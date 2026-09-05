import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAINTENANCE_API_KEY_HEADER = "x-maintenance-api-key";
const DEFAULT_RETENTION_DAYS = 30;

function getRetentionDays() {
  const rawValue = process.env.USE_CASE_TRASH_RETENTION_DAYS;
  const parsed = Number.parseInt(rawValue ?? "", 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_RETENTION_DAYS;
  }

  return parsed;
}

export async function POST(request: NextRequest) {
  const configuredApiKey = process.env.MAINTENANCE_API_KEY?.trim();

  if (!configuredApiKey) {
    return NextResponse.json(
      { error: "MAINTENANCE_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const providedApiKey = request.headers.get(MAINTENANCE_API_KEY_HEADER)?.trim();

  if (!providedApiKey || providedApiKey !== configuredApiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const retentionDays = getRetentionDays();
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  const purgedUseCaseIds = await db.transaction(async (trx) => {
    const rows = await trx("recycler.use_cases")
      .select("id")
      .whereNotNull("deleted_at")
      .andWhere("deleted_at", "<=", cutoff);

    const useCaseIds = rows.map((row: { id: string }) => row.id);

    if (useCaseIds.length === 0) {
      return [];
    }

    await trx("recycler.use_cases").whereIn("id", useCaseIds).del();

    return useCaseIds;
  });

  return NextResponse.json({
    retentionDays,
    purgedCount: purgedUseCaseIds.length,
    purgedUseCaseIds,
    cutoff: cutoff.toISOString(),
  });
}