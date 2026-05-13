import db from "@/services/db";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { DatasourceRun } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = {
  params: Promise<{ organizationId: string; useCaseId: string; datasourceId: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
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

  const rows = await db("recycler.datasource_runs")
    .select("*")
    .where({ datasource_id: datasourceId })
    .orderBy("started_at", "desc")
    .limit(20);

  return NextResponse.json(z.array(DatasourceRun).parse(rows));
}
