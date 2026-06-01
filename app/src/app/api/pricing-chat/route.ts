import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/i18n/messages";
import { resolveLocale } from "@/i18n/locale-config";
import OpenAI from "openai";

class MissingApiKeyError extends Error {}

async function getOpenAiClient(): Promise<OpenAI> {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  throw new MissingApiKeyError("No OpenAI API key available");
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], locale: rawLocale } = await req.json();
    const locale = resolveLocale(rawLocale);
    const dictionary = getMessages(locale);
    const pricingContext = dictionary.pricingPlans
      .map(
        (
          plan: {
            name: string;
            price: string;
            description: string;
            highlights: string[];
          },
          index: number
        ) =>
          `${index + 1}. ${plan.name}\n- ${plan.price}\n- ${plan.description}\n${plan.highlights
            .map((highlight: string) => `- ${highlight}`)
            .join("\n")}`
      )
      .join("\n\n");

    const systemPrompt = `${
      locale === "en"
        ? "The ReCycler platform front page presents three service levels:"
        : "ReCycler Platformin etusivulla esitellään kolme palvelutasoa:"
    }

${pricingContext}

${locale === "en" ? "Important policy:" : "Tärkeä linjaus:"}
- ${locale === "en" ? "ReCycler is an open-source platform" : "ReCycler on avoimen lähdekoodin alusta"}
- ${
  locale === "en"
    ? "Pricing is tied to onboarding, hosting, integrations, maintenance, support, and adapting the service to different use cases"
    : "hinnoittelu liittyy käyttöönottoprojektiin, hostaukseen, integraatioihin, ylläpitoon, tukeen ja palvelun soveltamiseen eri käyttötapauksiin"
}

${
  locale === "en"
    ? "You are an assistant that explains ReCycler platform pricing and onboarding."
    : "Olet ReCycler Platformin hinnoittelua ja käyttöönottoa selittävä avustaja."
}

${locale === "en" ? "Your task:" : "Tehtäväsi:"}
- ${
  locale === "en"
    ? "Answer the user's questions about service level differences, use cases, and onboarding"
    : "vastaa käyttäjän kysymyksiin näiden palvelutasojen eroista, käyttötapauksista ja käyttöönotosta"
}
- ${
  locale === "en"
    ? "Help the user understand which level fits them best"
    : "auta käyttäjää hahmottamaan mikä taso sopii hänelle parhaiten"
}
- ${
  locale === "en"
    ? "Keep the tone conversational, clear, and practical"
    : "pidä sävy keskustelevana, selkeänä ja käytännöllisenä"
}
- ${
  locale === "en"
    ? "If the user asks something you do not know for sure, say so clearly and steer toward a quote discussion"
    : "jos käyttäjä kysyy jotain mitä et tiedä varmasti, sano se suoraan ja ohjaa tarjouskeskusteluun"
}

${locale === "en" ? "Always reply in JSON format:" : "Vastaa AINA JSON-muodossa:"}
{
  "reply": "${locale === "en" ? "A short but useful answer in English" : "Lyhyt mutta hyödyllinen vastaus suomeksi"}"
}

${locale === "en" ? "Additional instructions:" : "Lisäohjeet:"}
- ${
  locale === "en"
    ? "If the conversation starts without a message, greet the user and ask about organization size, use case, or data sources"
    : "jos keskustelu alkaa ilman viestiä, tervehdi ja kysy esimerkiksi organisaation koosta, käyttötapauksesta tai datalähteistä"
}
- ${
  locale === "en"
    ? "Keep replies short, usually 2-5 sentences"
    : "pidä vastaukset lyhyinä, yleensä 2-5 lausetta"
}
- ${
  locale === "en"
    ? "Do not invent new price levels or promise features not described above"
    : "älä keksi uusia hintatasoja tai lupaa ominaisuuksia joita yllä ei ole kuvattu"
}
- ${locale === "en" ? "Always answer in English." : "Vastaa aina suomeksi"}`;

    const openai = await getOpenAiClient();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...(history as { role: string; content: string }[])
          .slice(-10)
          .map((item: { role: string; content: string }) => ({
            role: item.role as "user" | "assistant",
            content: item.content,
          })),
        ...(message
          ? [{ role: "user" as const, content: message }]
          : []),
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(raw) as { reply?: string };

    return NextResponse.json({ reply: parsed.reply ?? dictionary.api.pricingGreeting });
  } catch (err) {
    const dictionary = getMessages(resolveLocale(null));
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json(
        { error: dictionary.api.chatUnavailable },
        { status: 503 }
      );
    }

    console.error("Pricing chat API error:", err);
    return NextResponse.json(
      { error: dictionary.api.chatError },
      { status: 500 }
    );
  }
}
