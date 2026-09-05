import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "ReCycler Export API",
      version: "1.0.0",
      description: `## Purpose

Read-only API for exporting recycling locations from ReCycler in GeoJSON format.

## Authentication

This API supports two authentication methods. For browser testing, open this documentation page while signed in to ReCycler; Swagger sends the existing session cookie automatically. For another application, request an Auth0 Machine-to-Machine access token with the \
\`client_credentials\` grant and send it as a Bearer token.

Both methods return data only when the identity is authorized for the requested organization. The M2M client must have the \
\`read:locations\` permission and be mapped to the ReCycler organization by the server configuration.

## Finding IDs

Open the organization's use case in ReCycler administration. The browser address contains both UUIDs in this form: \
\`/admin/organizations/{organizationId}/use_cases/{useCaseId}\`.`,
    },
    servers: [{ url: "/", description: "Current environment" }],
    tags: [
      {
        name: "Locations",
        description: "Export recycling locations that belong to an authorized organization.",
      },
    ],
    paths: {
      "/api/v1/export/organizations/{organizationId}/use_cases/{useCaseId}/locations": {
        get: {
          operationId: "exportLocations",
          summary: "Export recycling locations",
          description:
            "Returns all recycling locations for one use case as a GeoJSON FeatureCollection. Use **Try it out** and enter the IDs from the ReCycler administration URL. The signed-in user must be a member of the requested organization.",
          tags: ["Locations"],
          security: [{ sessionCookie: [] }, { bearerAuth: [] }],
          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,
              description: "Organization UUID from the ReCycler administration URL.",
              schema: { type: "string", format: "uuid" },
            },
            {
              name: "useCaseId",
              in: "path",
              required: true,
              description: "Use case UUID from the ReCycler administration URL.",
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            "200": {
              description: "Locations in GeoJSON format",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LocationFeatureCollection" },
                  example: {
                    type: "FeatureCollection",
                    features: [
                      {
                        type: "Feature",
                        geometry: {
                          type: "Point",
                          coordinates: [24.941, 60.173],
                        },
                        properties: {
                          id: "2b2be7e4-9412-4bdc-b4a1-93fe29b6f0d0",
                          name: "Keskustan kierrätyspiste",
                          address: "Esimerkkikatu 1",
                          postal_code: "00100",
                          post_office: "Helsinki",
                          fields: [
                            {
                              id: "c9fa6bcd-80dc-420b-9ce7-d1d7a1b61449",
                              name: "Materiaalit",
                              field_type: "multi_select",
                              order: 1,
                              value: ["Lasi", "Paperi"],
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
            "401": {
              description:
                "Authentication is required. Sign in to ReCycler for browser testing, or send a valid Auth0 M2M Bearer token.",
            },
            "403": {
              description:
                "The authenticated user or M2M client is not authorized for the requested organization.",
            },
            "500": {
              description: "The organization access check or data retrieval failed.",
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "appSession",
          description:
            "Authentication is handled by the ReCycler Auth0 browser session. Sign in before using Try it out; do not enter a value here.",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "For server-to-server use. Obtain an Auth0 Machine-to-Machine token with the client_credentials grant and the read:locations permission.",
        },
      },
      schemas: {
        LocationFeatureCollection: {
          type: "object",
          required: ["type", "features"],
          properties: {
            type: { type: "string", const: "FeatureCollection" },
            features: {
              type: "array",
              items: { $ref: "#/components/schemas/LocationFeature" },
            },
          },
        },
        LocationFeature: {
          type: "object",
          required: ["type", "geometry", "properties"],
          properties: {
            type: { type: "string", const: "Feature" },
            geometry: {
              type: "object",
              required: ["type", "coordinates"],
              properties: {
                type: { type: "string", const: "Point" },
                coordinates: {
                  type: "array",
                  items: { type: "number" },
                  minItems: 2,
                  maxItems: 2,
                },
              },
            },
            properties: {
              type: "object",
              required: ["id", "name", "fields"],
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                address: { type: "string" },
                postal_code: { type: "string" },
                post_office: { type: "string" },
                source_geometry: { type: "object", additionalProperties: true },
                fields: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      name: { type: "string" },
                      field_type: { type: "string" },
                      order: { type: ["integer", "null"] },
                      value: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}