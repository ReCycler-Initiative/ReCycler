import db from "@/services/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PricingLeadSchema = z.object({
  name: z.string().trim().min(2, "Anna nimesi"),
  email: z.string().trim().email("Anna kelvollinen sähköposti"),
  organizationName: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().optional().or(z.literal("")),
  source: z.string().trim().optional().default("pricing-chat"),
  chatHistory: z
    .array(
      z.object({
        role: z.union([z.literal("user"), z.literal("assistant")]),
        content: z.string(),
      })
    )
    .default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = PricingLeadSchema.parse(await req.json());

    const [lead] = await db("recycler.pricing_leads")
      .insert({
        name: body.name,
        email: body.email,
        organization_name: body.organizationName || null,
        phone: body.phone || null,
        message: body.message || null,
        chat_history: JSON.stringify(body.chatHistory),
        source: body.source,
      })
      .returning(["id"]);

    return NextResponse.json({ ok: true, id: lead?.id ?? null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Virheelliset tiedot", issues: error.flatten() },
        { status: 400 }
      );
    }

    console.error("Pricing lead API error:", error);
    return NextResponse.json(
      { error: "Yhteydenoton tallennus epäonnistui" },
      { status: 500 }
    );
  }
}
