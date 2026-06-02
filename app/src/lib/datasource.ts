const EPSG_PATTERN = /^(?:epsg:)?(\d+)$/i;

const LEGACY_CRS_ALIASES: Record<string, string> = {
  wgs84: "4326",
  etrs_tm35fin: "3067",
};

export function isSupportedSourceCrsValue(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  return (
    trimmed.toLowerCase() in LEGACY_CRS_ALIASES || EPSG_PATTERN.test(trimmed)
  );
}

export function normalizeSourceCrsValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return "4326";

  const alias = LEGACY_CRS_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;

  const match = trimmed.match(EPSG_PATTERN);
  if (match) return match[1];

  return trimmed;
}

export function parseSourceSrid(value: string | null | undefined): number {
  const normalized = normalizeSourceCrsValue(value);
  const srid = Number.parseInt(normalized, 10);

  if (!Number.isInteger(srid) || srid <= 0 || srid > 999999) {
    throw new Error(`Unsupported source CRS: ${value ?? ""}`.trim());
  }

  return srid;
}

export function isGeoJsonLikeSourceFormat(format: string | null | undefined) {
  return format === "geojson" || format === "wfs";
}

export function isWfsCapabilitiesRequest(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get("request")?.toLowerCase() === "getcapabilities";
  } catch {
    return false;
  }
}

export function getWfsConfigurationHint(url: string): string {
  if (isWfsCapabilitiesRequest(url)) {
    return (
      "WFS datasource URL points to GetCapabilities. Use a GetFeature URL that returns GeoJSON, " +
      "for example ...?service=WFS&version=2.0.0&request=GetFeature&typeNames=<layer>&outputFormat=application/json"
    );
  }

  return "WFS datasource must return GeoJSON FeatureCollection. Check typeNames and outputFormat=application/json.";
}