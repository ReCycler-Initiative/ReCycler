import db from "@/services/db";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { encryptSecret } from "@/lib/crypto";
import { isSupportedSourceCrsValue, normalizeSourceCrsValue } from "@/lib/datasource";
import { Datasource } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpdateDatasourceBody = z.object({
  name: z.string().trim().min(1),
  url: z.string().url(),
  status: z.enum(["draft", "active", "disabled"]),
  source_format: z.enum(["json", "geojson", "wfs"]),
  auth_type: z.enum(["none", "api_key", "basic", "query_param"]),
  auth_header: z.string().nullable().optional(),
  /** Supply to update credentials; omit to keep existing */
  auth_credential: z.string().nullable().optional(),
  data_path: z.string().nullable().optional(),
  name_source_field: z.string().nullable().optional(),
  external_id_source_field: z.string().nullable().optional(),
  coordinate_type: z.enum(["latlon", "geojson"]),
  source_crs: z
    .string()
    .trim()
    .refine(
      (value) => isSupportedSourceCrsValue(value),
      "Invalid source CRS. Use an EPSG code such as 4326 or EPSG:3067."
    )
    .transform((value) => normalizeSourceCrsValue(value))
    .optional(),
  lat_source_field: z.string().nullable().optional(),
  lon_source_field: z.string().nullable().optional(),
  geometry_source_field: z.string().nullable().optional(),
  schedule: z.string().nullable().optional(),
});

const RETURNING_COLS = [
  "id", "name", "url", "use_case_id", "status", "source_format",
  "auth_type", "auth_header", "auth_credentials_last4",
  db.raw("auth_credentials_ciphertext IS NOT NULL AS auth_credentials_configured"),
  "data_path", "name_source_field", "external_id_source_field",
  "coordinate_type", "source_crs", "lat_source_field", "lon_source_field",
  "geometry_source_field", "schedule", "created_at", "updated_at",
] as const;

type Params = {
  params: Promise<{ organizationId: string; useCaseId: string; datasourceId: string }>;
};

async function findDatasource(
  request: NextRequest,
  organizationId: string,
  useCaseId: string,
  datasourceId: string
) {
  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) return { error: authResult.response! };

  const row = await db("recycler.datasources as ds")
    .select("ds.*")
    .innerJoin("recycler.use_cases as uc", "ds.use_case_id", "uc.id")
    .where({
      "ds.id": datasourceId,
      "uc.id": useCaseId,
      "uc.organization_id": organizationId,
    })
    .first();

  if (!row) return { error: NextResponse.json({ error: "Datasource not found" }, { status: 404 }) };
  return { row };
}

export async function GET(request: NextRequest, { params }: Params) {
  const { organizationId, useCaseId, datasourceId } = await params;
  const result = await findDatasource(request, organizationId, useCaseId, datasourceId);
  if (result.error) return result.error;

  const { row } = result;
  const safe = {
    ...row,
    auth_credentials_configured: row.auth_credentials_ciphertext != null,
    auth_credentials_ciphertext: undefined,
  };

  return NextResponse.json(Datasource.parse(safe));
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { organizationId, useCaseId, datasourceId } = await params;
  const result = await findDatasource(request, organizationId, useCaseId, datasourceId);
  if (result.error) return result.error;

  const json = await request.json().catch(() => null);
  const parsed = UpdateDatasourceBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { auth_credential, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = {
    ...rest,
    updated_at: new Date(),
  };

  if (auth_credential && rest.auth_type !== "none") {
    const { ciphertext, last4 } = encryptSecret(auth_credential);
    updateData.auth_credentials_ciphertext = ciphertext;
    updateData.auth_credentials_last4 = last4;
  } else if (rest.auth_type === "none") {
    // Clear credentials when switching to no-auth
    updateData.auth_credentials_ciphertext = null;
    updateData.auth_credentials_last4 = null;
  }

  const [updated] = await db("recycler.datasources")
    .where({ id: datasourceId })
    .update(updateData)
    .returning(RETURNING_COLS);

  return NextResponse.json(Datasource.parse(updated));
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { organizationId, useCaseId, datasourceId } = await params;
  const result = await findDatasource(request, organizationId, useCaseId, datasourceId);
  if (result.error) return result.error;

  await db("recycler.datasources").where({ id: datasourceId }).delete();

  return new NextResponse(null, { status: 204 });
}
