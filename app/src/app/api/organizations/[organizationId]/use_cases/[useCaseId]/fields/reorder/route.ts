import db from "@/services/db";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ReorderBody = z.array(
  z.object({
    id: z.string().uuid(),
    order: z.number().int().min(1),
  })
);

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ organizationId: string; useCaseId: string }> }
) {
  const { organizationId, useCaseId } = await params;

  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );
  if (!authResult.authorized) return authResult.response!;

  const json = await request.json().catch(() => null);
  const parsed = ReorderBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await db.transaction(async (trx) => {
    for (const { id, order } of parsed.data) {
      await trx.raw(
        `
        UPDATE recycler.fields f
        SET "order" = ?
        FROM recycler.use_cases uc
        WHERE f.use_case_id = uc.id
          AND uc.organization_id = ?::uuid
          AND uc.id = ?::uuid
          AND f.id = ?::uuid
        `,
        [order, organizationId, useCaseId, id]
      );
    }
  });

  return NextResponse.json({ ok: true });
}
