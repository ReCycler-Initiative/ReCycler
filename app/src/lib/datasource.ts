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

type WfsPointLayerCandidate = {
  name: string;
  title: string | null;
  defaultCrs: string | null;
};

export function extractEpsgCode(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/EPSG[:/]{1,2}(\d+)$/i) ?? trimmed.match(EPSG_PATTERN);
  return match?.[1] ?? null;
}

export function detectGeoJsonSourceCrs(data: unknown, url?: string): string | null {
  if (data && typeof data === "object") {
    const crsName = (data as {
      crs?: { properties?: { name?: string | null } | null } | null;
    }).crs?.properties?.name;

    const fromBody = extractEpsgCode(crsName);
    if (fromBody) return fromBody;
  }

  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const fromUrl = extractEpsgCode(parsedUrl.searchParams.get("srsName"));
    if (fromUrl) return fromUrl;
  } catch {
    return null;
  }

  return null;
}

export function detectGeoJsonGeometryType(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const firstFeature = (data as { features?: Array<{ geometry?: { type?: string | null } | null }> })
    .features?.[0];

  return firstFeature?.geometry?.type ?? null;
}

export function isSupportedLocationGeometryType(type: string | null | undefined): boolean {
  return type === "Point";
}

export function getUnsupportedGeometryHint(type: string | null | undefined): string {
  const geometryType = type ?? "tuntematon geometria";
  return `Vain pistekohteet ovat tuettuja Kohteet-näkymässä. Lähde palautti geometriatyypin ${geometryType}, joten kohteita ei voi lisätä nykyisellä toteutuksella.`;
}

export function isWfsCapabilitiesRequest(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get("request")?.toLowerCase() === "getcapabilities";
  } catch {
    return false;
  }
}

export function isWfsGetFeatureRequest(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get("request")?.toLowerCase() === "getfeature";
  } catch {
    return false;
  }
}

function buildWfsCapabilitiesUrl(url: string): string {
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set("service", "WFS");
  parsedUrl.searchParams.set("version", "2.0.0");
  parsedUrl.searchParams.set("request", "GetCapabilities");
  parsedUrl.searchParams.delete("typeNames");
  parsedUrl.searchParams.delete("outputFormat");
  parsedUrl.searchParams.delete("count");
  parsedUrl.searchParams.delete("srsName");
  return parsedUrl.toString();
}

function buildWfsDescribeFeatureTypeUrl(url: string, typeName: string): string {
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set("service", "WFS");
  parsedUrl.searchParams.set("version", "2.0.0");
  parsedUrl.searchParams.set("request", "DescribeFeatureType");
  parsedUrl.searchParams.set("typeNames", typeName);
  parsedUrl.searchParams.delete("outputFormat");
  parsedUrl.searchParams.delete("count");
  parsedUrl.searchParams.delete("srsName");
  return parsedUrl.toString();
}

function buildWfsGetFeatureUrl(url: string, typeName: string): string {
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set("service", "WFS");
  parsedUrl.searchParams.set("version", "2.0.0");
  parsedUrl.searchParams.set("request", "GetFeature");
  parsedUrl.searchParams.set("typeNames", typeName);
  parsedUrl.searchParams.set("outputFormat", "application/json");
  parsedUrl.searchParams.delete("count");
  return parsedUrl.toString();
}

function extractFeatureTypesFromCapabilitiesXml(xml: string): WfsPointLayerCandidate[] {
  const candidates: WfsPointLayerCandidate[] = [];
  const featureTypeMatches = xml.matchAll(/<FeatureType\b[\s\S]*?<Name>([^<]+)<\/Name>[\s\S]*?(?:<Title>([^<]*)<\/Title>)?[\s\S]*?(?:<DefaultCRS>([^<]*)<\/DefaultCRS>)?[\s\S]*?<\/FeatureType>/g);

  for (const match of featureTypeMatches) {
    candidates.push({
      name: match[1]?.trim() ?? "",
      title: match[2]?.trim() || null,
      defaultCrs: match[3]?.trim() || null,
    });
  }

  return candidates.filter((candidate) => candidate.name);
}

function extractGeometryPropertyType(xml: string): string | null {
  const match = xml.match(/type="gml:([A-Za-z]+)PropertyType"/);
  return match?.[1] ?? null;
}

async function findPointLayerCandidates(url: string): Promise<WfsPointLayerCandidate[]> {
  const capabilitiesUrl = buildWfsCapabilitiesUrl(url);
  const capabilitiesResponse = await fetch(capabilitiesUrl, {
    signal: AbortSignal.timeout(20_000),
  });

  if (!capabilitiesResponse.ok) {
    throw new Error(`WFS capabilities request failed with ${capabilitiesResponse.status} ${capabilitiesResponse.statusText}`);
  }

  const capabilitiesXml = await capabilitiesResponse.text();
  const featureTypes = extractFeatureTypesFromCapabilitiesXml(capabilitiesXml);
  const pointCandidates: WfsPointLayerCandidate[] = [];

  for (const featureType of featureTypes) {
    const describeUrl = buildWfsDescribeFeatureTypeUrl(url, featureType.name);
    const describeResponse = await fetch(describeUrl, {
      signal: AbortSignal.timeout(20_000),
    });

    if (!describeResponse.ok) continue;

    const describeXml = await describeResponse.text();
    const geometryPropertyType = extractGeometryPropertyType(describeXml);

    if (geometryPropertyType === "Point" || geometryPropertyType === "MultiPoint") {
      pointCandidates.push(featureType);
      if (pointCandidates.length > 1) break;
    }
  }

  return pointCandidates;
}

export async function resolveWfsUrl(url: string): Promise<{
  resolvedUrl: string;
  sourceCrs: string | null;
}>
{
  if (isWfsGetFeatureRequest(url)) {
    return { resolvedUrl: url, sourceCrs: null };
  }

  const pointCandidates = await findPointLayerCandidates(url);

  if (pointCandidates.length === 0) {
    throw new Error(
      "WFS-palvelusta ei löytynyt pistekohteita. Valitse palvelu, jossa on Point-tyyppinen layer."
    );
  }

  if (pointCandidates.length > 1) {
    const examples = pointCandidates
      .slice(0, 2)
      .map((candidate) => candidate.title ? `${candidate.name} (${candidate.title})` : candidate.name)
      .join(", ");

    throw new Error(
      `WFS-palvelussa on useita piste-layereita. Valitse haluttu layer erillisellä GetFeature-URL:lla. Esimerkkejä: ${examples}`
    );
  }

  const [selected] = pointCandidates;
  return {
    resolvedUrl: buildWfsGetFeatureUrl(url, selected.name),
    sourceCrs: extractEpsgCode(selected.defaultCrs),
  };
}

export function getWfsConfigurationHint(url: string): string {
  if (isWfsCapabilitiesRequest(url)) {
    return (
      "WFS datasource URL points to GetCapabilities. You can use it as a starting point, but if the service has multiple point layers you must choose one with GetFeature and typeNames."
    );
  }

  return "WFS datasource must return GeoJSON FeatureCollection. Check typeNames and outputFormat=application/json.";
}