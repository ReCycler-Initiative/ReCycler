import { checkOrganizationAuthorization } from "@/lib/authorization";
import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ParamsSchema = z.object({
  organizationId: z.string().uuid(),
  useCaseId: z.string().uuid(),
});

const MAX_FILE_BYTES = 512 * 1024;
const ALLOWED_EXTENSIONS = new Set([".txt", ".md"]);

function getExtension(filename: string) {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
}

async function assertUseCaseInOrg(organizationId: string, useCaseId: string) {
  const useCase = await db
    .select("id")
    .from("recycler.use_cases")
    .where("id", useCaseId)
    .andWhere("organization_id", organizationId)
    .first();

  return !!useCase;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<z.infer<typeof ParamsSchema>> }
) {
  const { organizationId, useCaseId } = ParamsSchema.parse(await params);

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const allowed = await assertUseCaseInOrg(organizationId, useCaseId);
  if (!allowed) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  const rows = await db
    .select("id", "filename", "mime_type", "created_at")
    .from("recycler.use_case_training_materials")
    .where("use_case_id", useCaseId)
    .orderBy("created_at", "desc");

  return NextResponse.json(
    rows.map((row: any) => ({
      id: row.id,
      filename: row.filename,
      mimeType: row.mime_type,
      createdAt: row.created_at,
    }))
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<z.infer<typeof ParamsSchema>> }
) {
  const { organizationId, useCaseId } = ParamsSchema.parse(await params);

  const authResult = await checkOrganizationAuthorization(request, organizationId);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  const allowed = await assertUseCaseInOrg(organizationId, useCaseId);
  if (!allowed) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `file too large (max ${MAX_FILE_BYTES} bytes)` },
      { status: 413 }
    );
  }

  const ext = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: "Only .txt and .md files are allowed" },
      { status: 400 }
    );
  }

  const contentText = await file.text();

  const inserted = await db("recycler.use_case_training_materials")
    .insert({
      use_case_id: useCaseId,
      filename: file.name,
      mime_type: file.type || "text/plain",
      content_text: contentText,
      created_at: new Date(),
    })
    .returning(["id", "filename", "mime_type", "created_at"])
    .then((rows) => rows[0]);

  return NextResponse.json(
    {
      id: inserted.id,
      filename: inserted.filename,
      mimeType: inserted.mime_type,
      createdAt: inserted.created_at,
    },
    { status: 201 }
  );
}
