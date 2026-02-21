"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageTemplate } from "@/components/admin/page-template";

type StatItem = {
  label: string;
  value: string;
  hint?: string;
};

const stats: StatItem[] = [
  { label: "Datayhteydet", value: "3", hint: "1 virhe vaatii huomion" },
  { label: "Viimeisin ajo", value: "09.12.2025 22:14", hint: "Ominaisuudet" },
  { label: "Virheet", value: "1", hint: "Tarkista lokit" },
];

const QuickCard = ({
  title,
  description,
  href,
  badge,
  tone = "light",
}: {
  title: string;
  description: string;
  href: string;
  badge: string;
  tone?: "light" | "dark";
}) => {
  const base =
    "group relative overflow-hidden rounded-2xl border shadow-sm transition-all";
  const light =
    "border-gray-200 bg-white hover:shadow-md hover:-translate-y-0.5";
  const dark =
    "border-gray-200 bg-gray-900 text-white hover:shadow-md hover:-translate-y-0.5";

  return (
    <Link
      href={href}
      className={[base, tone === "dark" ? dark : light].join(" ")}
    >
      {/* subtle highlight */}
      <div
        className={[
          "pointer-events-none absolute -top-24 right-0 h-56 w-56 rounded-full blur-3xl opacity-40",
          tone === "dark" ? "bg-blue-500" : "bg-blue-200",
        ].join(" ")}
      />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3
              className={[
                "text-base font-semibold",
                tone === "dark" ? "text-white" : "text-gray-900",
              ].join(" ")}
            >
              {title}
            </h3>
            <p
              className={[
                "mt-1 text-sm",
                tone === "dark" ? "text-gray-200" : "text-gray-600",
              ].join(" ")}
            >
              {description}
            </p>
          </div>

          <span
            className={[
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
              tone === "dark"
                ? "bg-white/10 text-white"
                : "bg-gray-100 text-gray-700",
            ].join(" ")}
          >
            {badge}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm font-medium">
          <span className={tone === "dark" ? "text-white" : "text-gray-900"}>
            Avaa
          </span>
          <span
            className={[
              "transition-transform group-hover:translate-x-0.5",
              tone === "dark" ? "text-white" : "text-gray-900",
            ].join(" ")}
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
};

const AdminHomePage = () => {
  const { id } = useParams<{ id: string }>();

  const datasourcesHref = `/admin/organizations/${id}/datasources`;
  const runsHref = `/admin/organizations/${id}/runs`;

  return (
    <PageTemplate fullWidth>
      <div className="pb-8">
        {/* BACKDROP */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {/* gradient + grid feel */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-200 via-indigo-200 to-cyan-200 blur-3xl opacity-70" />
            <div className="absolute inset-0 opacity-[0.06]">
              <div className="h-full w-full bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>
          </div>

          <div className="relative p-6 md:p-8">
            {/* HERO + SNAPSHOT */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
                  Yhtenäinen näkymä käyttötapauksen dataan ja integraatioihin
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base">
                  Näkymä kokoaa datalähteet, synkronoinnit ja laadun seurannan
                  samaan paikkaan. Näet nopeasti missä mennään, ja löydät
                  poikkeamat ennen kuin ne näkyvät lopputuloksessa.
                </p>

                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                    Datayhteyksien tila ja viimeisimmät synkronoinnit yhdellä
                    silmäyksellä
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                    Lokit ja virheet suoraan ajokohtaisesti – helpottaa
                    vianrajausta
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                    Selkeä “tilannekuva” siitä, onko data tuotantokelpoinen nyt
                  </li>
                </ul>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Pikatoiminnot
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Siirry suoraan yleisimpiin hallintatehtäviin.
                </p>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <QuickCard
                  title="Datayhteydet"
                  description="Liitä, muokkaa ja tarkista datayhteyksien tila."
                  href={datasourcesHref}
                  badge="Yhteydet"
                />
                <QuickCard
                  title="Ajot ja lokit"
                  description="Seuraa synkronointeja, virheitä ja suoritushistoriaa."
                  href={runsHref}
                  badge="Lokit"
                  tone="dark"
                />
              </div>
            </div>

            {/* SECONDARY CONTENT */}
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">
                  Mikä on “hyvä tila”?
                </h4>
                <p className="mt-2 text-sm text-gray-600">
                  Kun datayhteydet ovat aktiivisia ja viimeisimmät ajot
                  onnistuneita, käyttötapauksen data on käytettävissä ilman
                  katkoksia.
                </p>
                <div className="mt-3 text-sm text-gray-600">
                  Jos virheitä ilmenee, tarkista ensin ajon loki ja sen jälkeen
                  kyseisen datayhteyden asetukset.
                </div>
              </section>

              {/* Docs section (replaces "Suositellut reitit") */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900">
                  Ohjeet ja dokumentaatio
                </h4>

                <p className="mt-2 text-sm text-gray-600">
                  Löydät täältä ohjeet datayhteyksien hallintaan, ajovirheiden
                  tulkintaan ja käyttötapauksen toimintaperiaatteisiin.
                </p>

                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link
                      href="/docs/datayhteydet"
                      className="font-medium text-gray-900 hover:underline"
                    >
                      Datayhteydet – yleiskuva ja asetukset →
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/ajot-ja-lokit"
                      className="font-medium text-gray-900 hover:underline"
                    >
                      Ajot ja lokit – virheiden tulkinta →
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/docs/parhaat-kaytannot"
                      className="font-medium text-gray-900 hover:underline"
                    >
                      Parhaat käytännöt hallintaan →
                    </Link>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default AdminHomePage;