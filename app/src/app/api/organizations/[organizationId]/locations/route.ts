import { NextResponse } from "next/server";

// Mock data - Rinki-ekopisteet Tampereella
const mockLocations = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.761, 61.4978],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Rinki-ekopiste Keskusta",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.792, 61.501],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Rinki-ekopiste Kaleva",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.85, 61.45],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000003",
        name: "Rinki-ekopiste Hervanta",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.685, 61.515],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000004",
        name: "Rinki-ekopiste Lielahti",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.632, 61.482],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000005",
        name: "Rinki-ekopiste Tesoma",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.828, 61.508],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000006",
        name: "Rinki-ekopiste Linnainmaa",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.745, 61.468],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000007",
        name: "Rinki-ekopiste Härmälä",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.72, 61.442],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000008",
        name: "Rinki-ekopiste Peltolammi",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.81, 61.435],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000009",
        name: "Rinki-ekopiste Multisilta",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.865, 61.478],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000010",
        name: "Rinki-ekopiste Kaukajärvi",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.835, 61.492],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000011",
        name: "Rinki-ekopiste Messukylä",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.798, 61.475],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000012",
        name: "Rinki-ekopiste Nekala",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.668, 61.495],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000013",
        name: "Rinki-ekopiste Rahola",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.815, 61.52],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000014",
        name: "Rinki-ekopiste Takahuhti",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.872, 61.462],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000015",
        name: "Rinki-ekopiste Atala",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.615, 61.472],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000016",
        name: "Rinki-ekopiste Lamminpää",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.648, 61.505],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000017",
        name: "Rinki-ekopiste Ikuri",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.84, 61.515],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000018",
        name: "Rinki-ekopiste Olkahinen",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.785, 61.428],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000019",
        name: "Rinki-ekopiste Vuores",
        fields: [],
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [23.71, 61.558],
      },
      properties: {
        id: "00000000-0000-0000-0000-000000000020",
        name: "Rinki-ekopiste Kämmenniemi",
        fields: [],
      },
    },
  ],
};

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Simulate some delay like a real API
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json(mockLocations);
}
