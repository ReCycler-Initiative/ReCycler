import { decryptSecret } from "@/lib/crypto";
import db from "@/services/db";
import { Material } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

async function loadTrainingMaterials(useCaseId: string): Promise<string> {
  const rows: { filename: string; content_text: string }[] = await db
    .select("filename", "content_text")
    .from("recycler.use_case_training_materials")
    .where("use_case_id", useCaseId)
    .orderBy("created_at", "asc");

  return rows
    .map((row) => `=== ${row.filename} ===\n${row.content_text}`)
    .join("\n\n");
}

class MissingApiKeyError extends Error {}

async function getOpenAiClient(useCaseId: string): Promise<OpenAI> {
  const secret = await db
    .select("openai_api_key_ciphertext")
    .from("recycler.use_case_secrets")
    .where("use_case_id", useCaseId)
    .first();

  if (secret?.openai_api_key_ciphertext) {
    const apiKey = decryptSecret(secret.openai_api_key_ciphertext);
    return new OpenAI({ apiKey });
  }

  throw new MissingApiKeyError("No OpenAI API key configured for this use case");
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], imageBase64, imageMimeType, useCaseId } = await req.json();

    const materials: Material[] = await db("recycler.materials").orderBy(
      "name"
    );
    const materialList = materials
      .map((m) => `- ${m.name} (koodi: ${m.code})`)
      .join("\n");

    const trainingContext = useCaseId
      ? await loadTrainingMaterials(useCaseId)
      : "";

    const systemPrompt = `Olet ReCycler-palvelun kierrätysneuvoja. Käyt keskustelua käyttäjän kanssa ja autat heitä selvittämään mihin kierrätyskategorioihin heidän tavaransa kuuluvat.

Alla on ohjeistukset eri jätelajeille:

${trainingContext}

Käytettävissä olevat materiaalikategoriat (käytä näitä nimiä täsmälleen):
${materialList}

Vastaa AINA seuraavassa JSON-muodossa:
{
  "reply": "Vapaamuotoinen, ystävällinen ja lyhyt suomenkielinen vastausviesti käyttäjälle.",
  "materialNames": ["KAIKKI ne materiaalikategorioiden nimet joita käyttäjä on maininnut koko keskustelun aikana ja jotka kuuluvat kierrätykseen — päivitä tämä lista koko ajan"],
  "preparationTips": [
    { "materialName": "Kategorian nimi TÄSMÄLLEEN kuten yllä listassa", "tip": "Yksi lause: miten tämä materiaali kannattaa valmistella ennen viemistä kierrätyspisteelle." }
  ]
}

Tärkeää:
- Jos käyttäjä sanoo ensimmäistä kertaa "Hei" tai tervehtii, pyydä heitä kertomaan mitä haluavat kierrättää
- materialNames on kumulatiivinen: sisällytä kaikki kategoriat mitä käyttäjä on maininnut tässä keskustelussa
- Jos käyttäjä sanoo ettei jokin tavara kuulukaan mukaan, poista se materialNames-listasta
- preparationTips sisältää vihjeen jokaiselle materialNames-kategorialle
- Jos esivalmistelua ei tarvita, mainitse se lyhyesti
- Jos käyttäjä lähettää kuvan, tunnista kuvasta kierrätettävät tavarat ja neuvoo mihin kategorioihin ne kuuluvat
- Jos kuva on epäselvä tai et pysty tunnistamaan tavaroita, kysy tarkentavia kysymyksiä
- reply saa olla 1–3 lausetta, keskusteleva sävy
- Vastaa aina suomeksi`;

    const recentHistory = (history as { role: string; content: string }[]).slice(-10);

    if (!useCaseId) {
      return NextResponse.json(
        { error: "Palvelu ei ole tällä hetkellä käytettävissä" },
        { status: 503 }
      );
    }

    const openai = await getOpenAiClient(useCaseId);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...recentHistory.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        ...(imageBase64
          ? [
              {
                role: "user" as const,
                content: [
                  {
                    type: "image_url" as const,
                    image_url: {
                      url: `data:${imageMimeType ?? "image/jpeg"};base64,${imageBase64}`,
                      detail: "low" as const,
                    },
                  },
                  {
                    type: "text" as const,
                    text: message || "Mitä tässä kuvassa on ja mihin se kierrätetään?",
                  },
                ],
              },
            ]
          : message
          ? [{ role: "user" as const, content: message }]
          : []),
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw) as {
      reply: string;
      materialNames: string[];
      preparationTips: { materialName: string; tip: string }[];
    };

    const suggestedCodes = materials
      .filter((m) =>
        (parsed.materialNames ?? []).some(
          (name) => name.toLowerCase().trim() === m.name.toLowerCase().trim()
        )
      )
      .map((m) => m.code);

    return NextResponse.json({
      reply: parsed.reply ?? "",
      suggestedCodes,
      preparationTips: parsed.preparationTips ?? [],
    });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      console.error("Chat API key not configured:", err.message);
      return NextResponse.json(
        { error: "Palvelu ei ole tällä hetkellä käytettävissä" },
        { status: 503 }
      );
    }
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Virhe kierrätysneuvonnassa" },
      { status: 500 }
    );
  }
}
