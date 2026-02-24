import Link from "next/link";
import { PageTemplate } from "@/components/admin/page-template";
import TitleBarService from "@/components/title-bar-service";
import { ExternalLink } from "lucide-react";

type FeatureCardProps = {
  title: string;
  description: string;
};

const FeatureCard = ({ title, description }: FeatureCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full bg-blue-200 blur-3xl opacity-40" />
      <div className="relative">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const HomePage = () => {
  return (
    <>
      <TitleBarService />
      <PageTemplate title="">
        <div className="px-4 py-8">
          {/* HERO SECTION */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {/* Gradient background */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-200 via-indigo-200 to-cyan-200 blur-3xl opacity-70" />
              <div className="absolute inset-0 opacity-[0.06]">
                <div className="h-full w-full bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:32px_32px]" />
              </div>
            </div>

            <div className="relative p-6 md:p-8">
              <div className="max-w-3xl">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
                  ReCycler Platform – Sijaintipohjaisten palveluiden alusta
                </h1>

                <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base">
                  ReCycler Platform on moderni, skaalautuva alusta
                  sijaintitietoon ja ominaisuuksiin perustuvien sovellusten
                  rakentamiseen. Luo nopeasti hakupalveluita, karttanäkymiä ja
                  tietopohjia – yhdellä yhtenäisellä järjestelmällä.
                </p>

                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    Sijaintipohjainen haku ja karttaintegraatiot valmiina
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    Joustava tietomalli erilaisten kohteiden ja ominaisuuksien
                    hallintaan
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    ETL-integraatiot ulkoisiin tietolähteisiin
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    Mobiiliystävällinen käyttöliittymä ja moderni teknologia
                  </li>
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/recycler"
                  className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
                >
                  Avaa ReCycler-demo
                  <ExternalLink className="ml-2 inline" size={20} />
                </Link>
                <Link
                  href="/api/auth/login?screen_hint=signup"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50 sm:w-auto"
                >
                  Rekisteröidy / Kirjaudu
                </Link>
              </div>

              {/* Hint */}
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                <span>
                  Kirjautuminen tapahtuu Auth0:n kautta (Google, O365 ym.)
                </span>
              </div>
            </div>
          </div>

          {/* FEATURES SECTION */}
          <div className="mt-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Alustan ominaisuudet
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Kaikki mitä tarvitset sijaintipohjaisten palveluiden
                rakentamiseen.
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Sijaintipohjainen haku"
                description="PostGIS-pohjainen geospatiaalinen tietokanta mahdollistaa tehokkaan etäisyys- ja aluepohjaisen haun."
              />
              <FeatureCard
                title="ETL-integraatiot"
                description="Tuo dataa ulkoisista lähteistä automaattisesti configuroitavien ETL-prosessien kautta."
              />
              <FeatureCard
                title="Joustava tietomalli"
                description="Määrittele omia kohdetyyppejä, kenttiä ja ominaisuuksia ilman koodausta."
              />
              <FeatureCard
                title="Responsiivinen UI"
                description="Next.js ja React-pohjainen käyttöliittymä toimii saumattomasti mobiilissa ja työpöydällä."
              />
              <FeatureCard
                title="Organisaatiomallin tuki"
                description="Hallitse useita organisaatioita ja niiden dataa keskitetysti yhdessä järjestelmässä."
              />
              <FeatureCard
                title="Avoin lähdekoodi"
                description="Apache 2.0 -lisenssi, GitHub-pohjainen kehitys ja läpinäkyvä arkkitehtuuri."
              />
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">
                Avoin lähdekoodi ja kehitys
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                ReCycler Platform on avoimen lähdekoodin projekti GitHubissa.
                Projektiin voi osallistua kuka tahansa, ja lähdekoodi on
                läpinäkyvää ja vapaasti hyödynnettävissä Apache 2.0
                -lisenssillä.
              </p>
              <div className="mt-3">
                <a
                  href="https://github.com/ReCycler-Initiative/ReCycler"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Tutustu projektiin GitHubissa{" "}
                  <ExternalLink className="ml-1 inline" size={16} />
                </a>
              </div>
            </section>
          </div>

          {/* USE CASES */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">
              Käyttötapauksia
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              ReCycler Platform soveltuu monenlaisiin sijaintipohjaisiin
              palveluihin, kuten:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-xs font-medium text-gray-900">
                  Palvelupisteet
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Liikkeet, toimipisteet
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-xs font-medium text-gray-900">
                  Julkiset palvelut
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Kirjastot, virastot
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-xs font-medium text-gray-900">
                  Infrastruktuuri
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Latauspisteet, huoltoasemat
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-xs font-medium text-gray-900">
                  Kierrätys
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Kierrätyspisteet, ekopisteet
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTemplate>
    </>
  );
};

export default HomePage;
