// lib/auth0.js

import { SdkError } from "@auth0/nextjs-auth0/errors";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { OnCallbackContext, SessionData } from "@auth0/nextjs-auth0/types";
import { NextResponse } from "next/server";
import { ManagementClient } from "auth0";

export const managementClient = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

// Initialize the Auth0 client
export const auth0 = new Auth0Client({
  // Options are loaded from environment variables by default
  // Ensure necessary environment variables are properly set
  // domain: process.env.AUTH0_DOMAIN,
  // clientId: process.env.AUTH0_CLIENT_ID,
  // clientSecret: process.env.AUTH0_CLIENT_SECRET,
  // appBaseUrl: process.env.APP_BASE_URL,
  // secret: process.env.AUTH0_SECRET,

  authorizationParameters: {
    // In v4, the AUTH0_SCOPE and AUTH0_AUDIENCE environment variables for API authorized applications are no longer automatically picked up by the SDK.
    // Instead, we need to provide the values explicitly.
    // scope: process.env.AUTH0_SCOPE,
    // audience: process.env.AUTH0_AUDIENCE,
  },
  onCallback: async (
    error: SdkError | null,
    ctx: OnCallbackContext,
    session: SessionData | null
  ) => {
    if (error) {
      return NextResponse.redirect(
        new URL(`/error?error=${error.message}`, process.env.APP_BASE_URL)
      );
    }

    let returnUrl = ctx.returnTo || "/";

    try {
      const organizations = await managementClient.users.organizations.list(
        session!.user.sub
      );

      if (organizations.data.length === 0) {
        returnUrl = "/organizations/wizard";
      }
    } catch (err) {
      console.error("Error fetching user organizations:", err);
    }

    return NextResponse.redirect(new URL(returnUrl, process.env.APP_BASE_URL));
  },
});
