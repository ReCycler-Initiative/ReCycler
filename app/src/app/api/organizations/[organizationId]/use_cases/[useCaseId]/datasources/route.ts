import db from "@/services/db";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { encryptSecret } from "@/lib/crypto";
import { Datasource } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateDatasourceBody = z.object({
  name: z.string().trim().min(1),
  url: z.string().url(),
  status: z.enum(["draft", "active", "disabled"]).default("draft"),
  source_format: z.enum(["json", "geojson"]).default("json"),
  auth_type: z.enum(["none", "api_key", "basic", "query_param"]).default("none"),
  auth_header: z.string().nullable().optional(),
  auth_credential: z.string().nullable().optional(),
  data_path: z.string().nullable().optional(),
  name_source_field: z.string().nullable().optional(),
  external_id_source_field: z.string().nullable().optional(),
  coordinate_type: z.enum(["latlon", "geojson"]).default("latlon"),
  source_crs: z.enum(["wgs84", "etrs_tm35fin"]).default("wgs84"),
  lat_source_field: z.string().nullable().optional(),
  lon_source_field: z.string().nullable().optional(),
  geometry_source_field: z.string().nullable().optional(),
  schedule: z.string().nullable().optional(),
});

type Params = { params: Promise<{ organizationId: string; useCaseId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { organizationId, useCaseId } = await params;

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) return authResult.response!;

  const rows = await db("recycler.datasources")
    .select(
      "recycler.datasources.id", "recycler.datasources.name", "recycler.datasources.url",
      "recycler.datasources.use_case_id", "recycler.datasources.status",
      "recycler.datasources.source_format",
      "recycler.datasources.auth_type", "recycler.datasources.auth_header",
      "recycler.datasources.auth_credentials_last4",
      db.raw("recycler.datasources.auth_credentials_ciphertext IS NOT NULL AS auth_credentials_configured"),
      "recycler.datasources.data_path", "recycler.datasources.name_source_field",
      "recycler.datasources.external_id_source_field",
      "recycler.datasources.coordinate_type", "recycler.datasources.source_crs",
      "recycler.datasources.lat_source_field",
      "recycler.datasources.lon_source_field", "recycler.datasources.geometry_source_field",
      "recycler.datasources.schedule", "recycler.datasources.created_at",
      "recycler.datasources.updated_at"
    )
    .innerJoin("recycler.use_cases as uc", "recycler.datasources.use_case_id", "uc.id")
    .where({ "uc.organization_id": organizationId, "uc.id": useCaseId })
    .orderBy("recycler.datasources.created_at", "asc");

  return NextResponse.json(z.array(Datasource).parse(rows));
}

export async function POST(request: NextRequest, { params }: Params) {
  const { organizationId, useCaseId } = await params;

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) return authResult.response!;

  const useCase = await db("recycler.use_cases")
    .select("id")
    .where({ id: useCaseId, organization_id: organizationId })
    .first();
  if (!useCase) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = CreateDatasourceBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { auth_credential, ...rest } = parsed.data;
  const insertData: Record<string, unknown> = { ...rest, use_case_id: useCaseId };

  if (auth_credential && rest.auth_type !== "none") {
    const { ciphertext, last4 } = encryptSecret(auth_credential);
    insertData.auth_credentials_ciphertext = ciphertext;
    insertData.auth_credentials_last4 = last4;
  }

  const [row] = await db("recycler.datasources").insert(insertData).returning([
    "id", "name", "url", "use_case_id", "status", "source_format",
    "auth_type", "auth_header", "auth_credentials_last4",
    db.raw("auth_credentials_ciphertext IS NOT NULL AS auth_credentials_configured"),
    "data_path", "name_source_field", "external_id_source_field",
    "coordinate_type", "lat_source_field", "lon_source_field",
    "geometry_source_field", "schedule", "created_at", "updated_at",
  ]);

  return NextResponse.json(Datasource.parse(row), { status: 201 });
}
