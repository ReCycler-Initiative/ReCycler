import db from "@/services/db";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { decryptSecret } from "@/lib/crypto";
import {
  getWfsConfigurationHint,
  isGeoJsonLikeSourceFormat,
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

function collectCoordinatePairs(value: unknown, pairs: Array<[number, number]>): void {
  if (!Array.isArray(value)) return;

  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    Number.isFinite(value[0]) &&
    typeof value[1] === "number" &&
    Number.isFinite(value[1])
  ) {
    pairs.push([value[0], value[1]]);
    return;
  }

  for (const entry of value) {
    collectCoordinatePairs(entry, pairs);
  }
}

function getRepresentativePointFromCoordinates(
  coordinates: unknown
): { lat: number; lon: number } | null {
  const pairs: Array<[number, number]> = [];
  collectCoordinatePairs(coordinates, pairs);

  if (pairs.length === 0) return null;

  let minLon = pairs[0][0];
  let maxLon = pairs[0][0];
  let minLat = pairs[0][1];
  let maxLat = pairs[0][1];

  for (const [lon, lat] of pairs) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return {
    lon: (minLon + maxLon) / 2,
    lat: (minLat + maxLat) / 2,
  };
}

function extractSourceGeometry(
  datasource: Record<string, unknown>,
  item: unknown
): Record<string, unknown> | null {
  if (datasource.coordinate_type !== "geojson") return null;

  const geometryField = datasource.geometry_source_field as string | null;
  const geomObj = geometryField
    ? getNestedValue(item, geometryField)
    : (item as Record<string, unknown>)?.geometry;

  if (!geomObj || typeof geomObj !== "object" || Array.isArray(geomObj)) {
    return null;
  }

  const geometry = geomObj as Record<string, unknown>;
  if (typeof geometry.type !== "string") return null;

  return geometry;
}

function isPointGeometryType(type: string | null | undefined): boolean {
  return type === "Point" || type === "MultiPoint";
}

function shouldImportItem(
  datasource: Record<string, unknown>,
  sourceGeometry: Record<string, unknown> | null
): boolean {
  if (datasource.coordinate_type !== "geojson") {
    return datasource.import_point_geometries !== false;
  }

  const geometryType = typeof sourceGeometry?.type === "string" ? sourceGeometry.type : null;
  const isPointLike = isPointGeometryType(geometryType);

  if (isPointLike) {
    return datasource.import_point_geometries !== false;
  }

  return datasource.import_non_point_geometries !== false;
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

function getPaginationInfo(data: unknown): { currentPage: number; totalPages: number } | null {
  if (!data || typeof data !== "object") return null;

  const pagination = (data as { pagination?: unknown }).pagination;
  if (!pagination || typeof pagination !== "object") return null;

  const currentPage = Number((pagination as Record<string, unknown>)["current-page"]);
  const totalPages = Number((pagination as Record<string, unknown>)["total-pages"]);

  if (!Number.isInteger(currentPage) || !Number.isInteger(totalPages)) return null;
  if (currentPage < 1 || totalPages < currentPage) return null;

  return { currentPage, totalPages };
}

async function fetchJsonPages(
  initialUrl: string,
  headers: Record<string, string>,
  sourceFormat: string
): Promise<unknown[]> {
  const responses: unknown[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const pageUrl = new URL(initialUrl);
    pageUrl.searchParams.set("page", String(page));

    const res = await fetch(pageUrl.toString(), {
      headers,
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const detail =
        sourceFormat === "wfs" ? ` ${getWfsConfigurationHint(pageUrl.toString())}` : "";
      throw new Error(
        `Source API responded with ${res.status} ${res.statusText}.${detail}`.trim()
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (sourceFormat === "wfs" && !contentType.toLowerCase().includes("json")) {
      throw new Error(getWfsConfigurationHint(pageUrl.toString()));
    }

    const pageData: unknown = await res.json();
    responses.push(pageData);

    const pagination = getPaginationInfo(pageData);
    totalPages = pagination?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages);

  return responses;
}

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

    const pagedResponseData = isGeoJsonLikeSourceFormat(
      datasource.source_format as string | undefined
    )
      ? [await (async () => {
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

          return res.json();
        })()]
      : await fetchJsonPages(fetchUrl, headers, datasource.source_format as string);

    const items = pagedResponseData.flatMap((pageData) => extractItems(datasource, pageData));

    for (const item of items) {
      try {
        const sourceGeometry = extractSourceGeometry(datasource, item);
        if (!shouldImportItem(datasource, sourceGeometry)) {
          continue;
        }

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
          WITH incoming AS (
            SELECT
              uuid_generate_v4() AS id,
              ?::text AS name,
              ?::uuid AS use_case_id,
              ST_Transform(ST_SetSRID(ST_MakePoint(?, ?), ?), 4326) AS fallback_geom,
              CASE
                WHEN ? IS NULL THEN NULL
                ELSE ST_Transform(ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON(?), ?)), 4326)
              END AS source_geom,
              ?::text AS external_id,
              ?::uuid AS datasource_id
          )
          INSERT INTO recycler.locations (id, name, use_case_id, geom, source_geom, external_id, datasource_id)
          SELECT
            id,
            name,
            use_case_id,
            CASE
              WHEN source_geom IS NULL THEN fallback_geom
              ELSE ST_PointOnSurface(source_geom)
            END AS geom,
            source_geom,
            external_id,
            datasource_id
          FROM incoming
          ON CONFLICT (datasource_id, external_id)
          WHERE datasource_id IS NOT NULL AND external_id IS NOT NULL
          DO UPDATE SET
            name = EXCLUDED.name,
            geom = EXCLUDED.geom,
            source_geom = EXCLUDED.source_geom,
            updated_at = now()
          RETURNING id
          `,
          [
            locationName,
            useCaseId,
            coords.lon,
            coords.lat,
            sourceSrid,
            sourceGeometry ? JSON.stringify(sourceGeometry) : null,
            sourceGeometry ? JSON.stringify(sourceGeometry) : null,
            sourceSrid,
            externalId,
            datasourceId,
          ]
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
    const sourceGeometry = extractSourceGeometry(datasource, item);
    const geometryType = typeof sourceGeometry?.type === "string" ? sourceGeometry.type : null;

    if (
      sourceGeometry &&
      !isPointGeometryType(geometryType) &&
      datasource.generate_point_from_non_point_geometries === false
    ) {
      return null;
    }

    const coords = sourceGeometry?.coordinates;

    if (coords !== undefined) {
      return getRepresentativePointFromCoordinates(coords);
    }

    const geometryField = datasource.geometry_source_field as string | null;
    const geomObj = geometryField
      ? getNestedValue(item, geometryField)
      : (item as Record<string, unknown>)?.geometry;

    return getRepresentativePointFromCoordinates(geomObj);
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
