import db from "@/services/db";
import { NewUseCase, UseCase } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkOrganizationAuthorization } from "@/lib/authorization";
import { mapDbRowToUseCase } from "@/lib/mappers/use-case-mapper";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const organizationId = (await params).organizationId;

  if (!organizationId) {
    return NextResponse.json(
      { error: "organisation_id is required" },
      { status: 400 }
    );
  }

  // Check authorization
  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );

  if (!authResult.authorized) {
    return authResult.response!;
  }

  const result = await db.raw(
    `SELECT * FROM recycler.use_cases f WHERE organization_id = ?`,
    [organizationId]
  );

  const transformedRows = result.rows.map(mapDbRowToUseCase);
  return NextResponse.json(z.array(UseCase).parse(transformedRows));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const organizationId = (await params).organizationId;

  if (!organizationId) {
    return NextResponse.json(
      { error: "organisation_id is required" },
      { status: 400 }
    );
  }

  // Check authorization
  const authResult = await checkOrganizationAuthorization(
    request,
    organizationId
  );

  if (!authResult.authorized) {
    return authResult.response!;
  }

  try {
    const body = await request.json();
    const validatedData = NewUseCase.parse(body);

    const newUseCaseId = uuidv4();
    const now = new Date();

    // Insert new use case with default content
    await db("recycler.use_cases").insert({
      id: newUseCaseId,
      organization_id: organizationId,
      name: validatedData.name,
      description: validatedData.description,
      intro_title: "",
      intro_text: "",
      intro_cta: "",
      intro_skip: "",
      filters_title: "",
      filters_text: "",
      filters_cta: "",
      filters_tab_ai: "",
      filters_tab_manual: "",
      created_at: now,
      updated_at: now,
    });

    // Fetch the newly created use case
    const result = await db("recycler.use_cases")
      .where("id", newUseCaseId)
      .first();

    const transformedRow = mapDbRowToUseCase(result);
    return NextResponse.json(UseCase.parse(transformedRow), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating use case:", error);
    return NextResponse.json(
      { error: "Failed to create use case" },
      { status: 500 }
    );
  }
}
