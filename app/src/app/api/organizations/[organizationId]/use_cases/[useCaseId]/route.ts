import { checkOrganizationAuthorization } from "@/lib/authorization";
import db from "@/services/db";
import { UseCase } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

const GetUseCaseRequest = z.object({
  organizationId: z.string().uuid(),
  useCaseId: z.string().uuid(),
});

type TGetUseCaseRequest = z.infer<typeof GetUseCaseRequest>;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<TGetUseCaseRequest> }
) {
  try {
    const { organizationId, useCaseId } = await params;

    // Check authorization
    const authResult = await checkOrganizationAuthorization(
      request,
      organizationId
    );

    if (!authResult.authorized) {
      return authResult.response!;
    }

    const useCase = await db
      .select("*")
      .from("recycler.use_cases")
      .where("id", useCaseId)
      .andWhere("organization_id", organizationId)
      .first();

    if (!useCase) {
      return NextResponse.json(
        { error: "Use case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(UseCase.parse(useCase));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<TGetUseCaseRequest> }
) {
  try {
    const { organizationId, useCaseId } = await params;

    // Check authorization
    const authResult = await checkOrganizationAuthorization(
      request,
      organizationId
    );

    if (!authResult.authorized) {
      return authResult.response!;
    }

    const body = await request.json();

    const updatedUseCase = await db("recycler.use_cases")
      .where("id", useCaseId)
      .andWhere("organization_id", organizationId)
      .update({
        name: body.name,
        description: body.description,
        updated_at: new Date(),
      })
      .returning("*")
      .then((rows) => rows[0]);

    if (!updatedUseCase) {
      return NextResponse.json(
        { error: "Use case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(UseCase.parse(updatedUseCase));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
