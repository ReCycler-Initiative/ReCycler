import db from "@/services/db";
import { Material } from "@/types";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function loadTrainingMaterials(): string {
  const dir = path.join(process.cwd(), "src/data/training-materials");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".txt"));
  return files
    .map((file) => {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      return `=== ${file.replace(".txt", "")} ===\n${content}`;
    })
    .join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], imageBase64, imageMimeType } = await req.json();

    const materials: Material[] = await db("recycler.materials").orderBy(
      "name"
    );
    const materialList = materials
      .map((m) => `- ${m.name} (koodi: ${m.code})`)
      .join("\n");

    const trainingContext = loadTrainingMaterials();

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
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Virhe kierrätysneuvonnassa" },
      { status: 500 }
    );
  }
}
