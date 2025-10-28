import { checkOrganizationAuthorization } from "@/lib/authorization";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

const GetOrganizationAccessRequest = z.object({
  organizationId: z.string().uuid(),
});

type TGetOrganizationAccessRequest = z.infer<
  typeof GetOrganizationAccessRequest
>;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<TGetOrganizationAccessRequest> }
) {
  try {
    const { organizationId } = await params;

    const authResult = await checkOrganizationAuthorization(
      request,
      organizationId
    );

    if (!authResult.authorized) {
      // Return the error response with hasAccess: false
      const response = authResult.response!;
      const status = response.status;
      return NextResponse.json({ hasAccess: false }, { status });
    }

    return NextResponse.json({ hasAccess: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Organization access check error:", error);

    return NextResponse.json(
      { hasAccess: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
