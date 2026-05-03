export type PricingPlan = {
  name: string;
  audience: string;
  price: string;
  description: string;
  highlights: string[];
  featured?: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    name: "Pilotti",
    audience: "Nopea kokeilu",
    price: "690 €/kk",
    description:
      "Sopii ensimmäiseen tuotantokelpoiseen kokeiluun, kun halutaan nopeasti näkyviin yksi palvelu ja todentaa arvo oikealla datalla.",
    highlights: [
      "1 käyttötapaus ja yksi julkaistava palvelunäkymä",
      "1-2 datalähdettä tai kevyt ETL-tuonti",
      "Perusbrändäys ja valmiit kartta- sekä hakunäkymät",
      "Palveluun sisältyvä tekoälyavustin perusohjaukseen ja neuvontaan",
      "Kevyt käyttöönotto ja sparraus aloitukseen",
    ],
  },
  {
    name: "Kasvu",
    audience: "Organisaatiokäyttö",
    price: "1 290-1 990 €/kk",
    description:
      "Tarkoitettu kunnille, palveluorganisaatioille ja tiimeille, jotka haluavat useampia palveluita saman alustan päälle jatkuvalla ylläpidolla.",
    highlights: [
      "Useampi käyttötapaus samalla alustalla",
      "Useita tietolähteitä ja automatisoituja ETL-ajastuksia",
      "Tekoälyavustin osana palvelua käyttäjien ohjaukseen ja sisällön tukeen",
      "Laajempi ylläpito, kehitysjono ja käyttöoikeushallinta",
      "Tuki sisällön, kohteiden ja datamallin jatkokehitykseen",
    ],
    featured: true,
  },
  {
    name: "Räätälöity",
    audience: "Laajat tarpeet",
    price: "Tarjouskohtainen",
    description:
      "Kun mukana on oma ympäristö, erityisiä integraatioita, SLA-vaatimuksia tai useita organisaatioita, ratkaisu rakennetaan tapauskohtaisesti.",
    highlights: [
      "Oma ympäristö tai asiakkaan hallinnoima hosting",
      "Räätälöidyt integraatiot, tunnistautuminen ja datamallit",
      "Tekoälyavustin voidaan sovittaa organisaation omiin prosesseihin",
      "Projektikohtainen käyttöönotto, koulutus ja palvelunhallinta",
      "SLA, tuki- ja ylläpitomallit sekä jatkokehitys",
    ],
  },
];