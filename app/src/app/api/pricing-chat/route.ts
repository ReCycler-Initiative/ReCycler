import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

class MissingApiKeyError extends Error {}

async function getOpenAiClient(): Promise<OpenAI> {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  throw new MissingApiKeyError("No OpenAI API key available");
}

const PRICING_CONTEXT = `ReCycler Platformin etusivulla esitellään kolme palvelutasoa:

1. Pilotti
- 690 €/kk
- sopii ensimmäiseen tuotantokelpoiseen kokeiluun
- 1 käyttötapaus ja yksi julkaistava palvelunäkymä
- 1-2 datalähdettä tai kevyt ETL-tuonti
- perusbrändäys ja valmiit kartta- sekä hakunäkymät
- kevyt käyttöönotto ja sparraus aloitukseen

2. Kasvu
- tyypillisesti 1 290-1 990 €/kk
- useampi käyttötapaus samalla alustalla
- useita tietolähteitä ja automatisoituja ETL-ajastuksia
- laajempi ylläpito, kehitysjono ja käyttöoikeushallinta
- tuki sisällön, kohteiden ja datamallin jatkokehitykseen

3. Räätälöity
- tarjouskohtainen
- oma ympäristö tai asiakkaan hallinnoima hosting
- räätälöidyt integraatiot, tunnistautuminen ja datamallit
- projektikohtainen käyttöönotto, koulutus ja palvelunhallinta
- SLA, tuki- ja ylläpitomallit sekä jatkokehitys

Tärkeä linjaus:
- ReCycler on avoimen lähdekoodin alusta
- hinnoittelu liittyy käyttöönottoprojektiin, hostaukseen, integraatioihin, ylläpitoon, tukeen ja palvelun soveltamiseen eri käyttötapauksiin`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    const systemPrompt = `${PRICING_CONTEXT}

Olet ReCycler Platformin hinnoittelua ja käyttöönottoa selittävä avustaja.

Tehtäväsi:
- vastaa käyttäjän kysymyksiin näiden palvelutasojen eroista, käyttötapauksista ja käyttöönotosta
- auta käyttäjää hahmottamaan mikä taso sopii hänelle parhaiten
- pidä sävy keskustelevana, selkeänä ja käytännöllisenä
- jos käyttäjä kysyy jotain mitä et tiedä varmasti, sano se suoraan ja ohjaa tarjouskeskusteluun

Vastaa AINA JSON-muodossa:
{
  "reply": "Lyhyt mutta hyödyllinen vastaus suomeksi"
}

Lisäohjeet:
- jos keskustelu alkaa ilman viestiä, tervehdi ja kysy esimerkiksi organisaation koosta, käyttötapauksesta tai datalähteistä
- pidä vastaukset lyhyinä, yleensä 2-5 lausetta
- älä keksi uusia hintatasoja tai lupaa ominaisuuksia joita yllä ei ole kuvattu`;

    const openai = await getOpenAiClient();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...(history as { role: string; content: string }[])
          .slice(-10)
          .map((item) => ({
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

    return NextResponse.json({ reply: parsed.reply ?? "" });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json(
        { error: "Palvelu ei ole tällä hetkellä käytettävissä" },
        { status: 503 }
      );
    }

    console.error("Pricing chat API error:", err);
    return NextResponse.json(
      { error: "Virhe chat-palvelussa" },
      { status: 500 }
    );
  }
}
