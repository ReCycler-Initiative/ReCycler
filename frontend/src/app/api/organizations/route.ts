import { CreateOrganizationRequest } from "@/types";
import { withZodPost } from "@/utils/routes";
import { NextResponse } from "next/server";

export const POST = withZodPost(CreateOrganizationRequest, async (params) => {
  return NextResponse.json({
    message: "Organization created",
  });
});
