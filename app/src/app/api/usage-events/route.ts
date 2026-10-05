import { checkOrganizationAuthorization } from "@/lib/authorization";
import { resolveLocale } from "@/i18n/locale-config";
import { getLocalizedMaterialName } from "@/lib/material-translations";
import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const EventSchema = z.object({
  useCaseId: z.string().uuid(),
  sessionId: z.string().uuid(),
  eventType: z.enum(["map_view", "filters_applied"]),
  metadata: z.object({
    materialCodes: z.array(z.number().int().positive()).max(30).optional(),
    selectedFilterCount: z.number().int().min(0).max(100).optional(),
    fieldSelections: z.array(z.object({
      fieldId: z.string().uuid(),
      indices: z.array(z.number().int().min(0).max(100)).max(30),
    })).max(20).optional(),
  }).strict().default({}),
});

export async function POST(request: NextRequest) {
  const parsed = EventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid usage event" }, { status: 400 });
  }

  const useCase = await db("recycler.use_cases")
    .select("id")
    .where({ id: parsed.data.useCaseId })
    .whereNull("deleted_at")
    .first();
  if (!useCase) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  const requestedFields = parsed.data.metadata.fieldSelections ?? [];
  const fieldIds = [...new Set(requestedFields.map((selection) => selection.fieldId))];
  const configuredFields = fieldIds.length
    ? await db("recycler.fields")
        .select("id", "options")
        .where({ use_case_id: parsed.data.useCaseId })
        .whereIn("id", fieldIds)
    : [];
  const fieldSelections = requestedFields.flatMap((selection) => {
    const field = configuredFields.find((item) => item.id === selection.fieldId);
    const choiceCount = Array.isArray(field?.options?.choices) ? field.options.choices.length : 0;
    const indices = [...new Set(selection.indices)].filter((index) => index < choiceCount);
    return indices.length ? [{ fieldId: selection.fieldId, indices }] : [];
  });

  await db("recycler.usage_events").insert({
    use_case_id: parsed.data.useCaseId,
    session_id: parsed.data.sessionId,
    event_type: parsed.data.eventType,
    metadata: { ...parsed.data.metadata, fieldSelections },
  });

  return new NextResponse(null, { status: 204 });
}

const DAYS_OPTIONS = [7, 30, 90] as const;

export async function GET(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get("organizationId");
  const useCaseId = request.nextUrl.searchParams.get("useCaseId");
  const requestedDays = Number(request.nextUrl.searchParams.get("days") ?? 30);
  const days = DAYS_OPTIONS.includes(requestedDays as (typeof DAYS_OPTIONS)[number])
    ? requestedDays
    : 30;
  const locale = resolveLocale(request.nextUrl.searchParams.get("locale"));

  if (!organizationId || !useCaseId) {
    return NextResponse.json({ error: "Missing use case identifiers" }, { status: 400 });
  }

  const authorization = await checkOrganizationAuthorization(request, organizationId);
  if (!authorization.authorized) return authorization.response!;

  const useCase = await db("recycler.use_cases")
    .select("id")
    .where({ id: useCaseId, organization_id: organizationId })
    .whereNull("deleted_at")
    .first();
  if (!useCase) return NextResponse.json({ error: "Use case not found" }, { status: 404 });

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const base = () => db("recycler.usage_events").where("use_case_id", useCaseId).where("created_at", ">=", since);
  const totals = await base().select(
    db.raw("COUNT(*) FILTER (WHERE event_type = 'map_view')::int AS map_views"),
    db.raw("COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'map_view')::int AS visitors"),
    db.raw("COUNT(*) FILTER (WHERE event_type = 'filters_applied')::int AS filter_actions"),
    db.raw("COUNT(*) FILTER (WHERE event_type = 'chat_message')::int AS chat_messages"),
    db.raw("COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'chat_message')::int AS chat_users")
  ).first();

  const daily = await base()
    .select(db.raw("to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date"))
    .select(db.raw("COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'map_view')::int AS visitors"))
    .select(db.raw("COUNT(*) FILTER (WHERE event_type = 'filters_applied')::int AS filter_actions"))
    .select(db.raw("COUNT(*) FILTER (WHERE event_type = 'chat_message')::int AS chat_messages"))
    .groupByRaw("date_trunc('day', created_at)")
    .orderByRaw("date_trunc('day', created_at)");

  const materialRows = await db.raw(
    `SELECT code.value AS code, COUNT(*)::int AS count
     FROM recycler.usage_events
     CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(metadata->'materialCodes', '[]'::jsonb)) AS code(value)
    WHERE use_case_id = ? AND event_type IN ('filters_applied', 'map_view') AND created_at >= ?
     GROUP BY code.value ORDER BY count DESC LIMIT 8`,
    [useCaseId, since]
  );
  const fieldChoiceRows = await db.raw(
    `SELECT selection.value->>'fieldId' AS field_id, choice.value::int AS choice_index, COUNT(*)::int AS count
     FROM recycler.usage_events AS event
     CROSS JOIN LATERAL jsonb_array_elements(COALESCE(event.metadata->'fieldSelections', '[]'::jsonb)) AS selection(value)
     CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(selection.value->'indices', '[]'::jsonb)) AS choice(value)
    WHERE event.use_case_id = ? AND event.event_type IN ('filters_applied', 'map_view') AND event.created_at >= ?
     GROUP BY selection.value->>'fieldId', choice.value::int
     ORDER BY count DESC LIMIT 8`,
    [useCaseId, since]
  );
  const topicRows = await base()
    .where("event_type", "chat_message")
    .select(db.raw("metadata->>'topic' AS topic"))
    .count("* as count")
    .groupByRaw("metadata->>'topic'")
    .orderBy("count", "desc");
  const materialCodes = materialRows.rows.map((row: { code: string }) => Number(row.code));
  const materialNames: { code: number; name: string }[] = materialCodes.length
    ? await db("recycler.materials").select("code", "name").whereIn("code", materialCodes)
    : [];
  const materialNameByCode = new Map(
    materialNames.map((material) => [material.code, getLocalizedMaterialName(material, locale)])
  );
  const choiceFields: { id: string; name: string; options: { choices?: string[] } }[] =
    await db("recycler.fields")
      .select("id", "name", "options")
      .where("use_case_id", useCaseId);
  const fieldById = new Map(choiceFields.map((field) => [field.id, field]));
  const selections = [
    ...materialRows.rows.map((row: { code: string; count: number }) => ({
      code: `material-${row.code}`,
      name: materialNameByCode.get(Number(row.code)) ?? row.code,
      count: Number(row.count),
    })),
    ...fieldChoiceRows.rows.map((row: { field_id: string; choice_index: number; count: number }) => {
      const field = fieldById.get(row.field_id);
      const choice = field?.options?.choices?.[row.choice_index];
      return {
        code: `field-${row.field_id}-${row.choice_index}`,
        name: field && choice ? `${field.name}: ${choice}` : "",
        count: Number(row.count),
      };
    }).filter((selection: { name: string }) => Boolean(selection.name)),
  ].sort((first, second) => second.count - first.count).slice(0, 8);

  return NextResponse.json({
    days,
    totals: Object.fromEntries(Object.entries(totals ?? {}).map(([key, value]) => [key, Number(value ?? 0)])),
    daily,
    selections,
    chatTopics: topicRows,
  });
}