import db from "@/services/db";
import { getMessages } from "@/i18n/messages";
import { resolveLocale } from "@/i18n/locale-config";
import {
  getLocalizedMaterialName,
  materialNameMatches,
  normalizeMaterialText,
} from "@/lib/material-translations";
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
  let dictionary = getMessages(resolveLocale(null));

  try {
    const {
      message,
      history = [],
      imageBase64,
      imageMimeType,
      organizationId,
      useCaseId,
      locale: rawLocale,
      currentSelectedCodes = [],
      currentSelectedFieldValues = {},
    } = await req.json();
    const locale = resolveLocale(rawLocale);
    dictionary = getMessages(locale);

    const materials: Material[] = await db("recycler.materials").orderBy(
      "name"
    );
    const materialList = materials
      .map((m) =>
        locale === "en"
          ? `- ${getLocalizedMaterialName(m, locale)} (code: ${m.code})`
          : `- ${getLocalizedMaterialName(m, locale)} (koodi: ${m.code})`
      )
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

    const currentSelectedMaterialNames = materials
      .filter((material) => (currentSelectedCodes as number[]).includes(material.code))
      .map((material) => getLocalizedMaterialName(material, locale));

    const currentSelectedFieldLines = multiSelectFields.flatMap((field) => {
      const indices = (currentSelectedFieldValues as Record<string, number[]>)[field.id] ?? [];
      const selectedValues = indices
        .map((index) => field.choices[index])
        .filter(Boolean);

      if (selectedValues.length === 0) return [];

      return [`- ${field.name} (id: ${field.id}): ${selectedValues.join(", ")}`];
    });

    const currentSelectionsBlock =
      currentSelectedMaterialNames.length > 0 || currentSelectedFieldLines.length > 0
        ? `\n\n${locale === "en" ? "Current selections before the latest user message:" : "Nykyiset valinnat ennen uusinta käyttäjän viestiä:"}\n${
            currentSelectedMaterialNames.length > 0
              ? `${locale === "en" ? "Materials" : "Materiaalit"}: ${currentSelectedMaterialNames.join(", ")}`
              : `${locale === "en" ? "Materials" : "Materiaalit"}: -`
          }${
            currentSelectedFieldLines.length > 0
              ? `\n${locale === "en" ? "Field selections" : "Kenttävalinnat"}:\n${currentSelectedFieldLines.join("\n")}`
              : ""
          }`
        : "";

    const fieldsInstruction = multiSelectFields.length > 0
      ? `\n- fieldSelections on kumulatiivinen: sisällytä kaikki valinnat mitä käyttäjä on maininnut. Jos käyttäjä sanoo ettei jokin kuulu, poista se. Käytä täsmälleen yllä listattuja kenttien id-arvoja ja vaihtoehtoja.`
      : "";

    const fieldSelectionsFormat = multiSelectFields.length > 0
      ? `,\n  "fieldSelections": [{ "fieldId": "<kentän id>", "values": ["<valittu arvo>"] }]`
      : "";

    const useCaseContextBlock = useCaseInfo
      ? [
          useCaseInfo.name
            ? locale === "en"
              ? `Use case name: ${useCaseInfo.name}`
              : `Käyttötapauksen nimi: ${useCaseInfo.name}`
            : "",
          useCaseInfo.description
            ? locale === "en"
              ? `Use case description: ${useCaseInfo.description}`
              : `Käyttötapauksen kuvaus: ${useCaseInfo.description}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "";

    const systemPrompt = `${useCaseContextBlock ? useCaseContextBlock + "\n\n" : ""}${trainingContext ? (locale === "en" ? "Instructions and background materials:\n\n" : "Ohjeistukset ja taustamateriaalit:\n\n") + trainingContext + "\n\n" : ""}
${locale === "en" ? "Available material categories (use these names exactly):" : "Käytettävissä olevat materiaalikategoriat (käytä näitä nimiä täsmälleen):"}
${materialList}${fieldsBlock}${currentSelectionsBlock}

${locale === "en" ? "Always reply in the following JSON format:" : "Vastaa AINA seuraavassa JSON-muodossa:"}
{
  "reply": "${locale === "en" ? "A free-form, friendly, and short reply to the user." : "Vapaamuotoinen, ystävällinen ja lyhyt vastausviesti käyttäjälle."}",
  "materialNames": ["${locale === "en" ? "All material category names mentioned by the user during the whole conversation. Keep the list updated." : "Kaikki ne materiaalikategorioiden nimet joita käyttäjä on maininnut koko keskustelun aikana — päivitä tämä lista koko ajan"}"]${fieldSelectionsFormat},
  "preparationTips": [
    { "materialName": "${locale === "en" ? "Category name EXACTLY as listed above" : "Kategorian nimi TÄSMÄLLEEN kuten yllä listassa"}", "tip": "${locale === "en" ? "One sentence on how this material should be prepared." : "Yksi lause: miten tämä materiaali kannattaa valmistella."}" }
  ]
}

${locale === "en" ? "Important:" : "Tärkeää:"}
- ${
  locale === "en"
    ? `If this is the first message, open with a contextual greeting${useCaseInfo?.name ? ` that references the use case '${useCaseInfo.name}'` : ""} and ask the user to describe their need.`
    : `Jos tämä on ensimmäinen viesti (historia on tyhjä eikä käyttäjältä ole tullut viestiä), avaa keskustelu kontekstuaalisella tervehdyksellä${useCaseInfo?.name ? " joka viittaa käyttötapaukseen '" + useCaseInfo.name + "'" : ""} ja pyydä käyttäjää kertomaan tarpeestaan`
}
- ${locale === "en" ? "If the user greets you, ask them to describe their need." : "Jos käyttäjä tervehtii, pyydä häntä kertomaan tarpeestaan"}
- ${locale === "en" ? "Treat the current selections listed above as the starting state before processing the latest user message." : "Käsittele yllä listatut nykyiset valinnat lähtötilana ennen uusimman käyttäjäviestin tulkintaa"}
- ${locale === "en" ? "materialNames is cumulative and should include all categories mentioned in the conversation." : "materialNames on kumulatiivinen: sisällytä kaikki kategoriat mitä käyttäjä on maininnut tässä keskustelussa"}
- ${locale === "en" ? "If the user says something should no longer be included, remove it from materialNames." : "Jos käyttäjä sanoo ettei jokin tavara kuulukaan mukaan, poista se materialNames-listasta"}${fieldsInstruction}
- ${locale === "en" ? "preparationTips must contain one tip for each materialNames category." : "preparationTips sisältää vihjeen jokaiselle materialNames-kategorialle"}
- ${locale === "en" ? "If the user sends an image, identify the materials in it and explain which categories they belong to." : "Jos käyttäjä lähettää kuvan, tunnista kuvasta materiaalit ja neuvoo mihin kategorioihin ne kuuluvat"}
- ${locale === "en" ? "If the image is unclear or you cannot identify it, ask clarifying questions." : "Jos kuva on epäselvä tai et pysty tunnistamaan sisältöä, kysy tarkentavia kysymyksiä"}
- ${locale === "en" ? "reply should be 1-3 conversational sentences." : "reply saa olla 1–3 lausetta, keskusteleva sävy"}
- ${locale === "en" ? "Always answer in English." : "Vastaa aina suomeksi"}`;

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
                    text: message || (locale === "en" ? "What is in this image?" : "Mitä tässä kuvassa on?"),
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

    const localizedPreparationTips = (parsed.preparationTips ?? []).map((tip) => {
      const material = materials.find((item) => materialNameMatches(item, tip.materialName));

      return {
        ...tip,
        materialName: material
          ? getLocalizedMaterialName(material, locale)
          : tip.materialName,
      };
    });

    const currentFieldSelections = currentSelectedFieldValues as Record<string, number[]>;

    // Resolve field string values to selection indices expected by the client.
    const nextFieldValues: Record<string, number[]> = {};
    for (const sel of parsed.fieldSelections ?? []) {
      const field = multiSelectFields.find((f) => f.id === sel.fieldId);
      if (!field) continue;
      const indices = sel.values
        .map((value) =>
          field.choices.findIndex(
            (choice) => normalizeMaterialText(choice) === normalizeMaterialText(value)
          )
        )
        .filter((index) => index >= 0);
      if (indices.length > 0) {
        nextFieldValues[sel.fieldId] = indices;
      }
    }

    const suggestedFieldValues: Record<string, number[]> = Object.fromEntries(
      multiSelectFields.flatMap((field) => {
        const mergedIndices = [
          ...(currentFieldSelections[field.id] ?? []),
          ...(nextFieldValues[field.id] ?? []),
        ].filter((index, position, arr) => arr.indexOf(index) === position);

        return mergedIndices.length > 0 ? [[field.id, mergedIndices]] : [];
      })
    );

    const resolvedFieldChoiceValues = Object.entries(suggestedFieldValues).flatMap(
      ([fieldId, indices]) => {
        const field = multiSelectFields.find((item) => item.id === fieldId);
        if (!field) return [];

        return indices.map((index) => field.choices[index]).filter(Boolean);
      }
    );

    const matchedSuggestedCodes = materials
      .filter((m) =>
        (parsed.materialNames ?? []).some(
          (name) => materialNameMatches(m, name)
        )
      )
      .map((m) => m.code);

    const suggestedCodes = materials
      .filter((m) =>
        [...((currentSelectedCodes as number[]) ?? []), ...matchedSuggestedCodes].includes(
          m.code
        )
      )
      .filter(
        (m) =>
          !resolvedFieldChoiceValues.some((choice) => materialNameMatches(m, choice))
      )
      .map((m) => m.code);

    return NextResponse.json({
      reply: parsed.reply ?? "",
      suggestedCodes,
      suggestedFieldValues,
      preparationTips: localizedPreparationTips,
    });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      console.error("Chat API key not configured:", err.message);
      return NextResponse.json(
        { error: dictionary.api.chatUnavailable },
        { status: 503 }
      );
    }
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: dictionary.api.chatError },
      { status: 500 }
    );
  }
}
