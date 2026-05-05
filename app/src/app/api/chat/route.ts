import db from "@/services/db";
import { Material } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type MultiSelectField = {
  id: string;
  name: string;
  choices: string[];
};

async function loadMultiSelectFields(useCaseId: string): Promise<MultiSelectField[]> {
  const rows: { id: string; name: string; options: any }[] = await db
    .select("id", "name", "options")
    .from("recycler.fields")
    .where("use_case_id", useCaseId)
    .where("field_type", "multi_select")
    .orderByRaw("\"order\" ASC NULLS LAST, created_at ASC");
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    choices: r.options?.choices ?? [],
  }));
}

async function loadUseCaseInfo(
  useCaseId: string
): Promise<{ name: string; description: string } | null> {
  const row = await db
    .select("name", "description")
    .from("recycler.use_cases")
    .where("id", useCaseId)
    .first();
  if (!row) return null;
  const name = (row.name ?? "").trim();
  const description = (row.description ?? "").trim();
  if (!name && !description) return null;
  return { name, description };
}

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

async function getOpenAiClient(): Promise<OpenAI> {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  throw new MissingApiKeyError("No OpenAI API key available");
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], imageBase64, imageMimeType, useCaseId, organizationId } = await req.json();

    const materials: Material[] = await db("recycler.materials").orderBy(
      "name"
    );
    const materialList = materials
      .map((m) => `- ${m.name} (koodi: ${m.code})`)
      .join("\n");

    const [trainingContext, useCaseInfo, multiSelectFields] = await Promise.all([
      useCaseId ? loadTrainingMaterials(useCaseId) : Promise.resolve(""),
      useCaseId ? loadUseCaseInfo(useCaseId) : Promise.resolve(null),
      useCaseId ? loadMultiSelectFields(useCaseId) : Promise.resolve([]),
    ]);

    const fieldsBlock = multiSelectFields.length > 0
      ? "\n\nKäyttötapauksen valintakentät (käytä näitä arvoja täsmälleen fieldSelections-vastauksessa):\n" +
        multiSelectFields.map((f) =>
          `- Kenttä "${f.name}" (id: ${f.id}):\n  Vaihtoehdot: ${f.choices.join(", ")}`
        ).join("\n")
      : "";

    const fieldsInstruction = multiSelectFields.length > 0
      ? `\n- fieldSelections on kumulatiivinen: sisällytä kaikki valinnat mitä käyttäjä on maininnut. Jos käyttäjä sanoo ettei jokin kuulu, poista se. Käytä täsmälleen yllä listattuja kenttien id-arvoja ja vaihtoehtoja.`
      : "";

    const fieldSelectionsFormat = multiSelectFields.length > 0
      ? `,\n  "fieldSelections": [{ "fieldId": "<kentän id>", "values": ["<valittu arvo>"] }]`
      : "";

    const useCaseContextBlock = useCaseInfo
      ? [
          useCaseInfo.name ? `Käyttötapauksen nimi: ${useCaseInfo.name}` : "",
          useCaseInfo.description
            ? `Käyttötapauksen kuvaus: ${useCaseInfo.description}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "";

    const systemPrompt = `${useCaseContextBlock ? useCaseContextBlock + "\n\n" : ""}${trainingContext ? "Ohjeistukset ja taustamateriaalit:\n\n" + trainingContext + "\n\n" : ""}
Käytettävissä olevat materiaalikategoriat (käytä näitä nimiä täsmälleen):
${materialList}${fieldsBlock}

Vastaa AINA seuraavassa JSON-muodossa:
{
  "reply": "Vapaamuotoinen, ystävällinen ja lyhyt vastausviesti käyttäjälle.",
  "materialNames": ["Kaikki ne materiaalikategorioiden nimet joita käyttäjä on maininnut koko keskustelun aikana — päivitä tämä lista koko ajan"]${fieldSelectionsFormat},
  "preparationTips": [
    { "materialName": "Kategorian nimi TÄSMÄLLEEN kuten yllä listassa", "tip": "Yksi lause: miten tämä materiaali kannattaa valmistella." }
  ]
}

Tärkeää:
- Jos tämä on ensimmäinen viesti (historia on tyhjä eikä käyttäjältä ole tullut viestiä), avaa keskustelu kontekstuaalisella tervehdyksellä${useCaseInfo?.name ? " joka viittaa käyttötapaukseen '" + useCaseInfo.name + "'" : ""} ja pyydä käyttäjää kertomaan tarpeestaan
- Jos käyttäjä tervehtii, pyydä häntä kertomaan tarpeestaan
- materialNames on kumulatiivinen: sisällytä kaikki kategoriat mitä käyttäjä on maininnut tässä keskustelussa
- Jos käyttäjä sanoo ettei jokin tavara kuulukaan mukaan, poista se materialNames-listasta${fieldsInstruction}
- preparationTips sisältää vihjeen jokaiselle materialNames-kategorialle
- Jos käyttäjä lähettää kuvan, tunnista kuvasta materiaalit ja neuvoo mihin kategorioihin ne kuuluvat
- Jos kuva on epäselvä tai et pysty tunnistamaan sisältöä, kysy tarkentavia kysymyksiä
- reply saa olla 1–3 lausetta, keskusteleva sävy
- Vastaa aina suomeksi`;

    const recentHistory = (history as { role: string; content: string }[]).slice(-10);

    const openai = await getOpenAiClient();

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
                    text: message || "Mitä tässä kuvassa on?",
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
      fieldSelections?: { fieldId: string; values: string[] }[];
      preparationTips: { materialName: string; tip: string }[];
    };

    const suggestedCodes = materials
      .filter((m) =>
        (parsed.materialNames ?? []).some(
          (name) => name.toLowerCase().trim() === m.name.toLowerCase().trim()
        )
      )
      .map((m) => m.code);

    // Resolve field string values → indices
    const suggestedFieldValues: Record<string, number[]> = {};
    for (const sel of parsed.fieldSelections ?? []) {
      const field = multiSelectFields.find((f) => f.id === sel.fieldId);
      if (!field) continue;
      const indices = sel.values
        .map((v) => field.choices.findIndex(
          (c) => c.toLowerCase().trim() === v.toLowerCase().trim()
        ))
        .filter((i) => i >= 0);
      if (indices.length > 0) suggestedFieldValues[sel.fieldId] = indices;
    }

    return NextResponse.json({
      reply: parsed.reply ?? "",
      suggestedCodes,
      suggestedFieldValues,
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
      { error: "Virhe chat-palvelussa" },
      { status: 500 }
    );
  }
}
