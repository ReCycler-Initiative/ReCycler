import db from "@/services/db";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { decryptSecret } from "@/lib/crypto";
import {
  detectGeoJsonGeometryType,
  getWfsConfigurationHint,
  getUnsupportedGeometryHint,
  isGeoJsonLikeSourceFormat,
  isSupportedLocationGeometryType,
  parseSourceSrid,
  resolveWfsUrl,
} from "@/lib/datasource";
import { DatasourceRun } from "@/types";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{ organizationId: string; useCaseId: string; datasourceId: string }>;
};

/** Traverse a dot-notation path on an object, e.g. "properties.address" */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((cur, key) => {
    if (cur != null && typeof cur === "object") {
      return (cur as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function buildHeaders(
  authType: string,
  authHeader: string | null,
  ciphertext: string | null
): Record<string, string> {
  if (!ciphertext) return {};

  try {
    const credential = decryptSecret(ciphertext);
    if (authType === "api_key" && authHeader) {
      return { [authHeader]: credential };
    }
    if (authType === "basic") {
      const encoded = Buffer.from(credential).toString("base64");
      return { Authorization: `Basic ${encoded}` };
    }
  } catch {
    // Decryption failure — run without auth rather than crashing
  }
  return {};
}

function appendQueryParam(
  url: string,
  authType: string,
  authHeader: string | null,
  ciphertext: string | null
): string {
  if (authType !== "query_param" || !authHeader || !ciphertext) return url;
  try {
    const credential = decryptSecret(ciphertext);
    const u = new URL(url);
    u.searchParams.set(authHeader, credential);
    return u.toString();
  } catch {
    return url;
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { organizationId, useCaseId, datasourceId } = await params;

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) return authResult.response!;

  const datasource = await db("recycler.datasources as ds")
    .select("ds.*")
    .innerJoin("recycler.use_cases as uc", "ds.use_case_id", "uc.id")
    .where({
      "ds.id": datasourceId,
      "uc.id": useCaseId,
      "uc.organization_id": organizationId,
    })
    .first();

  if (!datasource) {
    return NextResponse.json({ error: "Datasource not found" }, { status: 404 });
  }

  const mappings = await db("recycler.datasource_field_mappings")
    .select("source_field", "field_id")
    .where({ datasource_id: datasourceId });

  const now = new Date();
  const [run] = await db("recycler.datasource_runs")
    .insert({ datasource_id: datasourceId, status: "running", started_at: now })
    .returning("*");

  let rowsSynced = 0;
  let rowsFailed = 0;
  let errorMessage: string | null = null;

  try {
    const headers = buildHeaders(
      datasource.auth_type,
      datasource.auth_header,
      datasource.auth_credentials_ciphertext
    );

    const initialFetchUrl = appendQueryParam(
      datasource.url,
      datasource.auth_type,
      datasource.auth_header,
      datasource.auth_credentials_ciphertext
    );

    const fetchUrl = datasource.source_format === "wfs"
      ? (await resolveWfsUrl(initialFetchUrl)).resolvedUrl
      : initialFetchUrl;

    const res = await fetch(fetchUrl, {
      headers,
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const detail =
        datasource.source_format === "wfs"
          ? ` ${getWfsConfigurationHint(fetchUrl)}`
          : "";
      throw new Error(
        `Source API responded with ${res.status} ${res.statusText}.${detail}`.trim()
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (
      datasource.source_format === "wfs" &&
      !contentType.toLowerCase().includes("json")
    ) {
      throw new Error(getWfsConfigurationHint(fetchUrl));
    }

    const responseData: unknown = await res.json();
    if (isGeoJsonLikeSourceFormat(datasource.source_format as string | undefined)) {
      const detectedGeometryType = detectGeoJsonGeometryType(responseData);
      if (!isSupportedLocationGeometryType(detectedGeometryType)) {
        throw new Error(getUnsupportedGeometryHint(detectedGeometryType));
      }
    }

    const items = extractItems(datasource, responseData);

    for (const item of items) {
      try {
        const locationName = datasource.name_source_field
          ? String(getNestedValue(item, datasource.name_source_field) ?? "")
          : "";

        if (!locationName) {
          rowsFailed++;
          continue;
        }

        const externalId = datasource.external_id_source_field
          ? String(getNestedValue(item, datasource.external_id_source_field) ?? "")
          : null;

        const coords = extractCoords(datasource, item);
        if (!coords) {
          rowsFailed++;
          continue;
        }

        const sourceSrid = parseSourceSrid(
          datasource.source_crs as string | null | undefined
        );

        // Upsert location — relies on UNIQUE INDEX (datasource_id, external_id)
        const upsertResult = await db.raw(
          `
          INSERT INTO recycler.locations (id, name, use_case_id, geom, external_id, datasource_id)
          VALUES (uuid_generate_v4(), ?, ?::uuid, ST_Transform(ST_SetSRID(ST_MakePoint(?, ?), ?), 4326), ?, ?::uuid)
          ON CONFLICT (datasource_id, external_id)
          WHERE datasource_id IS NOT NULL AND external_id IS NOT NULL
          DO UPDATE SET
            name = EXCLUDED.name,
            geom = EXCLUDED.geom,
            updated_at = now()
          RETURNING id
          `,
          [locationName, useCaseId, coords.lon, coords.lat, sourceSrid, externalId, datasourceId]
        );

        const locationId: string = upsertResult.rows[0].id;

        // Upsert field values
        for (const mapping of mappings) {
          const rawValue = getNestedValue(item, mapping.source_field);
          const values = Array.isArray(rawValue)
            ? rawValue.map(String)
            : rawValue != null
              ? [String(rawValue)]
              : [];

          if (values.length === 0) continue;

          await db.raw(
            `
            INSERT INTO recycler.location_fields (id, location_id, field_id, value)
            VALUES (uuid_generate_v4(), ?::uuid, ?::uuid, ?::jsonb)
            ON CONFLICT (location_id, field_id)
            DO UPDATE SET value = EXCLUDED.value
            `,
            [locationId, mapping.field_id, JSON.stringify(values)]
          );
        }

        rowsSynced++;
      } catch (rowErr: unknown) {
        console.error("[datasource run] row failed:", rowErr);
        rowsFailed++;
      }    }
  } catch (err: unknown) {
    errorMessage = err instanceof Error ? err.message : String(err);
  }

  const finishedAt = new Date();
  const finalStatus =
    errorMessage || (rowsFailed > 0 && rowsSynced === 0) ? "failed" : "completed";

  const [updatedRun] = await db("recycler.datasource_runs")
    .where({ id: run.id })
    .update({
      status: finalStatus,
      finished_at: finishedAt,
      rows_synced: rowsSynced,
      rows_failed: rowsFailed,
      error_message: errorMessage,
    })
    .returning("*");

  return NextResponse.json(DatasourceRun.parse(updatedRun));
}

function extractItems(datasource: Record<string, unknown>, data: unknown): unknown[] {
  if (isGeoJsonLikeSourceFormat(datasource.source_format as string | undefined)) {
    const fc = data as { features?: unknown[] };
    return fc?.features ?? [];
  }

  if (datasource.data_path) {
    const found = getNestedValue(data, datasource.data_path as string);
    return Array.isArray(found) ? found : [];
  }

  return Array.isArray(data) ? data : [];
}

function extractCoords(
  datasource: Record<string, unknown>,
  item: unknown
): { lat: number; lon: number } | null {
  if (datasource.coordinate_type === "geojson") {
    const geometryField = datasource.geometry_source_field as string | null;
    const geomObj = geometryField
      ? getNestedValue(item, geometryField)
      : (item as Record<string, unknown>)?.geometry;
    // geomObj can be either a GeoJSON geometry object {coordinates:[lon,lat]}
    // or already the coordinates array [lon, lat] if the field points there directly
    const coords = Array.isArray(geomObj)
      ? geomObj
      : (geomObj as { coordinates?: unknown } | null)?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;
    const [lon, lat] = coords as [number, number];
    if (!isFinite(lon) || !isFinite(lat)) return null;
    return { lat, lon };
  }

  // lat/lon fields
  const latField = datasource.lat_source_field as string | null;
  const lonField = datasource.lon_source_field as string | null;
  if (!latField || !lonField) return null;

  const lat = Number(getNestedValue(item, latField));
  const lon = Number(getNestedValue(item, lonField));
  if (!isFinite(lat) || !isFinite(lon)) return null;

  return { lat, lon };
}
