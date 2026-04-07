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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:bg-gray-50">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
    </div>
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
                  ReCycler Platform on moderni, skaalautuva alusta sijaintitietoon
                  ja ominaisuuksiin perustuvien sovellusten rakentamiseen. Luo
                  nopeasti hakupalveluita, karttanäkymiä ja tietopohjia – yhdellä
                  yhtenäisellä järjestelmällä.
                </p>

                <div className="mt-6 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                  <div className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                    Sijaintipohjainen haku ja karttaintegraatiot valmiina
                  </div>
                  <div className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                    Joustava tietomalli erilaisten kohteiden ja ominaisuuksien hallintaan
                  </div>
                  <div className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                    ETL-integraatiot ulkoisiin tietolähteisiin
                  </div>
                  <div className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                    Mobiiliystävällinen käyttöliittymä ja moderni teknologia
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/recycler"
                    className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
                  >
                    Avaa ReCycler-demo
                    <ExternalLink className="ml-2 inline" size={18} />
                  </Link>
                  <Link
                    href="/api/auth/login?screen_hint=signup"
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50 sm:w-auto"
                  >
                    Luo tunnus
                  </Link>
                </div>

                <div className="mt-4 text-xs text-gray-600">
                  Kirjautuminen tapahtuu Auth0:n kautta (Google, O365 ym.)
                </div>
              </div>
            </div>
          </div>

          {/* FEATURES SECTION */}
          <div className="mt-10">
            <h2 className="text-base font-semibold text-gray-900">
              Ominaisuudet
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Kaikki olennaiset rakennuspalikat yhdessä alustassa.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FeatureCard
                title="Sijaintipohjainen haku"
                description="PostGIS-pohjainen geospatiaalinen tietokanta mahdollistaa tehokkaan etäisyys- ja aluepohjaisen haun."
              />
              <FeatureCard
                title="Joustava tietomalli"
                description="Määrittele omia kohdetyyppejä, kenttiä ja ominaisuuksia ilman koodausta."
              />
              <FeatureCard
                title="ETL-integraatiot"
                description="Tuo dataa ulkoisista lähteistä automaattisesti configuroitavien ETL-prosessien kautta."
              />
              <FeatureCard
                title="Mobiiliystävällinen UI"
                description="Next.js ja React-pohjainen käyttöliittymä toimii saumattomasti mobiilissa ja työpöydällä."
              />
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
                ReCycler Platform on avoimen lähdekoodin projekti GitHubissa.
                Projektiin voi osallistua kuka tahansa, ja lähdekoodi on
                läpinäkyvää ja vapaasti hyödynnettävissä Apache 2.0
                -lisenssillä.
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
        </div>
      </PageTemplate>
    </>
  );
};

export default HomePage;
