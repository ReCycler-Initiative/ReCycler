import db from "@/services/db";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { DatasourceFieldMapping } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BulkMappingsBody = z.object({
  mappings: z.array(
    z.object({
      source_field: z.string().min(1),
      field_id: z.string().uuid(),
    })
  ),
});

type Params = {
  params: Promise<{ organizationId: string; useCaseId: string; datasourceId: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const { organizationId, useCaseId, datasourceId } = await params;

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) return authResult.response!;

  // Ensure datasource belongs to this org/use case
  const ds = await db("recycler.datasources as ds")
    .select("ds.id")
    .innerJoin("recycler.use_cases as uc", "ds.use_case_id", "uc.id")
    .where({ "ds.id": datasourceId, "uc.id": useCaseId, "uc.organization_id": organizationId })
    .first();

  if (!ds) {
    return NextResponse.json({ error: "Datasource not found" }, { status: 404 });
  }

  const rows = await db("recycler.datasource_field_mappings")
    .select("*")
    .where({ datasource_id: datasourceId })
    .orderBy("created_at", "asc");

  return NextResponse.json(z.array(DatasourceFieldMapping).parse(rows));
}

export async function POST(request: NextRequest, { params }: Params) {
  const { organizationId, useCaseId, datasourceId } = await params;

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) return authResult.response!;

  const ds = await db("recycler.datasources as ds")
    .select("ds.id")
    .innerJoin("recycler.use_cases as uc", "ds.use_case_id", "uc.id")
    .where({ "ds.id": datasourceId, "uc.id": useCaseId, "uc.organization_id": organizationId })
    .first();

  if (!ds) {
    return NextResponse.json({ error: "Datasource not found" }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = BulkMappingsBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await db.transaction(async (trx) => {
    await trx("recycler.datasource_field_mappings").where({ datasource_id: datasourceId }).delete();

    if (parsed.data.mappings.length > 0) {
      await trx("recycler.datasource_field_mappings").insert(
        parsed.data.mappings.map((m) => ({
          datasource_id: datasourceId,
          source_field: m.source_field,
          field_id: m.field_id,
        }))
      );
    }
  });

  const rows = await db("recycler.datasource_field_mappings")
    .select("*")
    .where({ datasource_id: datasourceId })
    .orderBy("created_at", "asc");

  return NextResponse.json(z.array(DatasourceFieldMapping).parse(rows));
}
