import { checkOrganizationAuthorization, AuthorizationResult } from "@/lib/authorization";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { NextRequest, NextResponse } from "next/server";

const requiredScope = "read:locations";

function getIssuer() {
  const domain = process.env.AUTH0_DOMAIN?.trim();
  if (!domain) {
    throw new Error("AUTH0_DOMAIN is required for M2M token validation");
  }

  const normalizedDomain = domain.replace(/\/+$/, "");
  return normalizedDomain.startsWith("https://")
    ? `${normalizedDomain}/`
    : `https://${normalizedDomain}/`;
}

function getOrganizationForClient(clientId: string) {
  const mappings = process.env.AUTH0_M2M_CLIENT_ORGANIZATIONS;
  if (!mappings) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(mappings) as Record<string, string>;
    return parsed[clientId];
  } catch {
    throw new Error("AUTH0_M2M_CLIENT_ORGANIZATIONS must be valid JSON");
  }
}

async function checkM2MAuthorization(
  request: NextRequest,
  organizationId: string
): Promise<AuthorizationResult | null> {
  const authorizationHeader = request.headers.get("authorization");
  if (!authorizationHeader?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice("bearer ".length).trim();
  const audience = process.env.AUTH0_AUDIENCE?.trim();
  if (!audience) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "M2M authentication is not configured" },
        { status: 503 }
      ),
    };
  }

  try {
    const issuer = getIssuer();
    const jwks = createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`));
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience,
      algorithms: ["RS256"],
    });

    const scopes = [
      ...(typeof payload.scope === "string" ? payload.scope.split(" ") : []),
      ...(Array.isArray(payload.permissions)
        ? payload.permissions.filter((permission): permission is string => typeof permission === "string")
        : []),
    ];
    if (!scopes.includes(requiredScope)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: `Missing required scope: ${requiredScope}` },
          { status: 403 }
        ),
      };
    }

    const clientId = typeof payload.azp === "string" ? payload.azp : undefined;
    if (!clientId) {
      return {
        authorized: false,
        response: NextResponse.json({ error: "Token client is missing" }, { status: 403 }),
      };
    }

    const tokenOrganizationId = getOrganizationForClient(clientId);
    if (!tokenOrganizationId || tokenOrganizationId !== organizationId) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Token is not authorized for this organization" },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, organization: { id: organizationId } };
  } catch (error) {
    console.error("M2M token validation failed:", error);
    return {
      authorized: false,
      response: NextResponse.json({ error: "Invalid or expired access token" }, { status: 401 }),
    };
  }
}

export async function checkExportAuthorization(
  request: NextRequest,
  organizationId: string
) {
  const m2mAuthorization = await checkM2MAuthorization(request, organizationId);
  if (m2mAuthorization) {
    return m2mAuthorization;
  }

  return checkOrganizationAuthorization(request, organizationId);
}