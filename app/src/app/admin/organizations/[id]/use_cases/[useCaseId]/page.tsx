"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageTemplate } from "@/components/admin/page-template";

const UseCaseHomePage = () => {
  useParams<{ id: string; useCaseId: string }>();

  return (
    <PageTemplate>
      <div className="pb-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-10">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-4xl">
              Yhtenäinen näkymä käyttötapauksen dataan
            </h1>

            <p className="mt-4 text-sm leading-6 text-gray-600 md:text-base">
              Näkymä kokoaa datalähteet, synkronoinnit ja laadun seurannan samaan
              paikkaan. Löydät hallinnan toiminnot yläpalkista.
            </p>

            <div className="mt-6 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
              <div className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                Datayhteyksien tila ja viimeisimmät synkronoinnit yhdellä silmäyksellä
              </div>
              <div className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                Lokit ja virheet ajokohtaisesti – helpottaa vianrajausta
              </div>
              <div className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                Selkeä tilannekuva siitä, onko data tuotantokelpoinen
              </div>
              <div className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                Ohjeet ja toimintaperiaatteet yhdessä paikassa
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">
                Mikä on “hyvä tila”?
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Kun datayhteydet ovat aktiivisia ja viimeisimmät ajot
                onnistuneita, käyttötapauksen data on käytettävissä ilman
                katkoksia.
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Jos virheitä ilmenee, tarkista ensin ajon loki ja sen jälkeen
                kyseisen datayhteyden asetukset.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">
                Ohjeet ja dokumentaatio
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Löydät täältä ohjeet datayhteyksien hallintaan, ajovirheiden
                tulkintaan ja käyttötapauksen toimintaperiaatteisiin.
              </p>

              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    href="/docs/datayhteydet"
                    className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700"
                  >
                    Datayhteydet – yleiskuva ja asetukset →
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/ajot-ja-lokit"
                    className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700"
                  >
                    Ajot ja lokit – virheiden tulkinta →
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/parhaat-kaytannot"
                    className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700"
                  >
                    Parhaat käytännöt hallintaan →
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default UseCaseHomePage;
