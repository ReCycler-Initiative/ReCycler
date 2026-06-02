import { checkOrganizationAuthorization } from "@/lib/authorization";
import {
  detectGeoJsonSourceCrs,
  getWfsConfigurationHint,
  isGeoJsonLikeSourceFormat,
  resolveWfsUrl,
} from "@/lib/datasource";
import { DatasourceTestResult } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const TestBody = z.object({
  url: z.string().url(),
  source_format: z.enum(["json", "geojson", "wfs"]).default("json"),
  auth_type: z.enum(["none", "api_key", "basic", "query_param"]).default("none"),
  auth_header: z.string().nullable().optional(),
  /** Plain-text credential for the test (never persisted from this endpoint) */
  auth_credential: z.string().nullable().optional(),
  data_path: z.string().nullable().optional(),
});

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

/** Flatten an object into dot-path → sample value pairs (max depth 6) */
function extractDotPaths(
  obj: unknown,
  prefix = "",
  depth = 0
): { path: string; sampleValue: string }[] {
  if (depth > 6 || obj == null) return [];
  if (typeof obj !== "object") {
    return [{ path: prefix, sampleValue: String(obj ?? "") }];
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return [{ path: prefix, sampleValue: "[]" }];
    }

    const firstItem = obj[0];
    const indexedPath = prefix ? `${prefix}.0` : "0";
    const currentEntry = prefix
      ? [{ path: prefix, sampleValue: JSON.stringify(obj).slice(0, 80) }]
      : [];
    if (typeof firstItem === "object" && firstItem !== null) {
      return [...currentEntry, ...extractDotPaths(firstItem, indexedPath, depth + 1)];
    }

    return [
      ...currentEntry,
      { path: indexedPath, sampleValue: String(firstItem ?? "") },
    ];
  }

  const record = obj as Record<string, unknown>;
  const currentEntry = prefix
    ? [{ path: prefix, sampleValue: JSON.stringify(obj).slice(0, 80) }]
    : [];

  return [
    ...currentEntry,
    ...Object.entries(record).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      return extractDotPaths(value, path, depth + 1);
    }
    return [{ path, sampleValue: String(value ?? "") }];
    }),
  ];
}

function buildHeaders(
  authType: string,
  authHeader: string | null | undefined,
  credential: string | null | undefined
): Record<string, string> {
  if (authType === "api_key" && authHeader && credential) {
    return { [authHeader]: credential };
  }
  if (authType === "basic" && credential) {
    const encoded = Buffer.from(credential).toString("base64");
    return { Authorization: `Basic ${encoded}` };
  }
  return {};
}

function appendQueryParam(
  url: string,
  authType: string,
  authHeader: string | null | undefined,
  credential: string | null | undefined
): string {
  if (authType !== "query_param" || !authHeader || !credential) return url;
  const u = new URL(url);
  u.searchParams.set(authHeader, credential);
  return u.toString();
}

export async function POST(request: NextRequest, { params }: Params) {
  const { organizationId } = await params;

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) return authResult.response!;

  const json = await request.json().catch(() => null);
  const parsed = TestBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { url, source_format, auth_type, auth_header, auth_credential, data_path } =
    parsed.data;

  const headers = buildHeaders(auth_type, auth_header, auth_credential);
  const initialFetchUrl = appendQueryParam(url, auth_type, auth_header, auth_credential);

  let fetchUrl = initialFetchUrl;
  let resolvedSourceCrs: string | null = null;
  if (source_format === "wfs") {
    try {
      const resolved = await resolveWfsUrl(initialFetchUrl);
      fetchUrl = resolved.resolvedUrl;
      resolvedSourceCrs = resolved.sourceCrs;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: message }, { status: 422 });
    }
  }

  let responseData: unknown;
  try {
    const res = await fetch(fetchUrl, { headers, signal: AbortSignal.timeout(15_000) });

    if (!res.ok) {
      const detail = source_format === "wfs" ? ` ${getWfsConfigurationHint(fetchUrl)}` : "";
      return NextResponse.json(
        { error: `Source API responded with ${res.status} ${res.statusText}.${detail}`.trim() },
        { status: 422 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (source_format === "wfs" && !contentType.toLowerCase().includes("json")) {
      return NextResponse.json({ error: getWfsConfigurationHint(fetchUrl) }, { status: 422 });
    }

    responseData = await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const detail = source_format === "wfs" ? ` ${getWfsConfigurationHint(fetchUrl)}` : "";
    return NextResponse.json(
      { error: `Failed to reach URL: ${message}.${detail}`.trim() },
      { status: 422 }
    );
  }

  let sampleItem: unknown;

  if (isGeoJsonLikeSourceFormat(source_format)) {
    const fc = responseData as { features?: unknown[] };
    const first = fc?.features?.[0] as Record<string, unknown> | undefined;
    if (!first) {
      return NextResponse.json({ error: "GeoJSON has no features" }, { status: 422 });
    }
    // Return geometry path + properties keys
    const propertyPaths = extractDotPaths(first.properties ?? {}, "properties");
    const geomPaths = [{ path: "geometry", sampleValue: JSON.stringify(first.geometry).slice(0, 80) }];
    const detectedSourceCrs = detectGeoJsonSourceCrs(responseData, fetchUrl) ?? resolvedSourceCrs;
    return NextResponse.json(
      DatasourceTestResult.parse({
        sample_fields: [...geomPaths, ...propertyPaths],
        detected_source_crs: detectedSourceCrs,
        resolved_url: source_format === "wfs" ? fetchUrl : null,
      })
    );
  }

  // JSON format
  let array: unknown[];
  if (data_path) {
    const found = getNestedValue(responseData, data_path);
    if (!Array.isArray(found)) {
      return NextResponse.json(
        { error: `data_path "${data_path}" does not point to an array` },
        { status: 422 }
      );
    }
    array = found;
  } else if (Array.isArray(responseData)) {
    array = responseData;
  } else {
    return NextResponse.json(
      { error: "Response is not an array; set data_path to the array field" },
      { status: 422 }
    );
  }

  sampleItem = array[0];
  if (!sampleItem) {
    return NextResponse.json({ error: "Array is empty, no fields to detect" }, { status: 422 });
  }

  const sample_fields = extractDotPaths(sampleItem);

  return NextResponse.json(
    DatasourceTestResult.parse({
      sample_fields,
      detected_source_crs: null,
      resolved_url: null,
    })
  );
}
