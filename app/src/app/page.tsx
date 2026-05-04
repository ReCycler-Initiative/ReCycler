import Link from "next/link";
import { PageTemplate } from "@/components/admin/page-template";
import { PricingAiChat } from "@/components/pricing-ai-chat";
import { pricingPlans } from "@/content/pricing";
import TitleBarService from "@/components/title-bar-service";
import { ExternalLink } from "lucide-react";
import { ReactNode } from "react";

type PricingCardProps = {
  name: string;
  audience: string;
  price: string;
  description: string;
  highlights: string[];
  ctaLabel?: string;
  ctaHref?: string;
  ctaNode?: ReactNode;
  featured?: boolean;
};

const PricingCard = ({
  name,
  audience,
  price,
  description,
  highlights,
  ctaLabel,
  ctaHref,
  ctaNode,
  featured = false,
}: PricingCardProps) => {
  return (
    <section
      className={[
        "rounded-2xl border bg-white p-6",
        featured
          ? "border-gray-900 shadow-sm ring-1 ring-gray-900"
          : "border-gray-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            {audience}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">{name}</h3>
        </div>
        {featured && (
          <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
            Suositeltu
          </span>
        )}
      </div>

      <div className="mt-5 text-3xl font-semibold tracking-tight text-gray-900">
        {price}
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>

      <ul className="mt-5 space-y-3 text-sm text-gray-700">
        {highlights.map((highlight) => (
          <li key={highlight} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      {ctaNode ?? (
        <Link
          href={ctaHref ?? "/api/auth/login?screen_hint=signup"}
          className={[
            "mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition",
            featured
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
          ].join(" ")}
        >
          {ctaLabel}
        </Link>
      )}
    </section>
  );
};

const HomePage = () => {
  return (
    <>
      <TitleBarService />
      <PageTemplate title="">
        <div className="px-4 py-10">
          {/* HERO SECTION */}
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="p-6 md:p-10">
              <div className="mx-auto max-w-3xl">
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
                  Sijaintipohjaisten palveluiden alusta
                </h1>

                <p className="mt-4 text-sm leading-6 text-gray-600 md:text-base">
                  ReCycler auttaa rakentamaan palveluita, joissa ihmiset löytävät
                  oikeat paikat, palvelupisteet tai keräyskohteet helposti.
                  Samalla sama järjestelmä auttaa ylläpitämään kohteita,
                  tuomaan tietoa muista järjestelmistä ja julkaisemaan palvelun
                  verkkoon ilman raskasta omaa kehitysprojektia.
                </p>

                <div className="mt-6 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    Asiakaslähtöinen palvelu tekee asioinnista nopeampaa,
                    selkeämpää ja helpompaa.
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    Käyttäjä löytää oikean palvelun helpommin ja saa heti
                    vastauksia selkokieliseltä AI-avustajalta.
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    Tietoa voidaan tuoda muista järjestelmistä automaattisesti.
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    Käyttäjät voidaan tunnistaa organisaation nykyisillä
                    tunnuksilla, kuten Microsoft- tai Google-kirjautumisella.
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Esimerkki käyttötapauksesta
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Esimerkiksi kunta voi toteuttaa palvelun, jossa asukas
                    löytää helposti alueen päiväkodit kartalta, vertailee
                    vaihtoehtoja ja saa AI-avustajalta nopeasti vastauksia
                    käytännön kysymyksiin. Käyttäjä näkee myös helposti, mistä
                    palvelu löytyy, ja voi tarkistaa nopeasti esimerkiksi,
                    löytyykö alueelta englanninkielinen päiväkoti tai
                    ympärivuorokautinen päiväkoti.
                  </p>
                </div>

                <p className="mt-6 text-sm leading-6 text-gray-600">
                  Käytännössä tämä tarkoittaa, että sama alusta sopii esimerkiksi
                  kierrätyspisteiden, asiointipaikkojen, palveluverkkojen tai muiden
                  sijaintiin perustuvien palveluiden julkaisuun ja ylläpitoon.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/recycler"
                    className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
                  >
                    Avaa ReCycler-demo
                    <ExternalLink className="ml-2 inline" size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* PRICING SECTION */}
          <div className="mt-10">
            <div className="max-w-3xl">
              <h2 className="text-base font-semibold text-gray-900">
                Hinnoittelu ja käyttöönotto
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                ReCycler voidaan ottaa käyttöön kevyenä pilotointina tai laajempana
                jatkuvana palveluna. Hinnoittelu rakentuu tyypillisesti
                käyttötapausten, datalähteiden, integraatioiden ja ylläpidon
                tarpeen mukaan.
              </p>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              {pricingPlans.map((plan) => (
                <PricingCard
                  key={plan.name}
                  name={plan.name}
                  audience={plan.audience}
                  price={plan.price}
                  description={plan.description}
                  highlights={plan.highlights}
                  featured={plan.featured}
                  ctaNode={<PricingAiChat />}
                />
              ))}
            </div>

          </div>

          {/* INFO SECTION */}
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Teknologia ja arkkitehtuuri
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Alusta on rakennettu modernilla teknologiapinolla: Next.js,
                TypeScript, PostgreSQL + PostGIS, Tailwind CSS. Docker-pohjainen
                kehitysympäristö ja Knex.js-migraatiot varmistavat helpon
                käyttöönoton.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                Full-stack TypeScript • PostGIS • ETL-pipelinet • REST API
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Avoin lähdekoodi ja kehitys
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                ReCycler-palvelu perustuu avoimen lähdekoodin
                ReCycler-projektiin. Lähdekoodi on saatavilla GitHubissa,
                kehitys on läpinäkyvää, ja projektiin voi osallistua kuka
                tahansa. Projekti on lisensoitu Apache 2.0 -lisenssillä.
              </p>
              <div className="mt-3">
                <a
                  href="https://github.com/ReCycler-Initiative/ReCycler"
                  className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700"
                >
                  Tutustu projektiin GitHubissa{" "}
                  <ExternalLink className="ml-1 inline" size={16} />
                </a>
              </div>
            </section>
          </div>

          <footer className="mt-10 rounded-2xl border border-gray-200 bg-gray-900 px-6 py-8 text-white">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-300">
                  Yhteystiedot
                </h3>
                <p className="mt-3 text-lg font-semibold text-white">
                  Yritys Oy
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  ReCycler-palvelun käyttöönotto, pilotointi ja jatkuva kehitys
                  organisaatioille.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">Osoite</h4>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  Kuvitteellinenkatu 12 A
                  <br />
                  00100 Helsinki
                  <br />
                  Suomi
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">Ota yhteyttä</h4>
                <div className="mt-3 space-y-2 text-sm text-gray-300">
                  <p>
                    Sähköposti: info@yritys.fi
                  </p>
                  <p>
                    Puhelin: 010 123 4567
                  </p>
                  <p>
                    Y-tunnus: 1234567-8
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </PageTemplate>
    </>
  );
};

export default HomePage;
