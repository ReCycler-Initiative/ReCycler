"use client";

import Link from "next/link";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";

const AdminHomePage = () => {
  return (
    <PageTemplate title="Pääkäyttäjän etusivu">
      <div className="min-h-[calc(100vh-120px)] flex flex-col gap-8 py-8">
        {/* -------------------------------- */}
        {/* HEADER                          */}
        {/* -------------------------------- */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              Pääkäyttäjän käyttöliittymä
            </h1>
            <p className="text-sm text-gray-600">
              Tervetuloa ylläpitämään käyttötapauksen datalähteitä ja
              yhdistimiä. Valitse alta, mitä haluat hallita.
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
              <span className="rounded-full bg-gray-50 px-3 py-1">
                5 yhdistintä, joista 3 aktiivista
              </span>
              <span className="rounded-full bg-gray-50 px-3 py-1">
                Viimeisin synkronointi: 10.12.2025 09:30
              </span>
            </div>
          </div>
        </section>

        {/* -------------------------------- */}
        {/* MAIN NAVIGATION CARDS           */}
        {/* -------------------------------- */}
        <section className="grid gap-6 md:grid-cols-3">
          {/* Connectors -card */}
          <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Yhdistimet
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Ylläpidä yhteyksiä eri datalähteisiin (REST API, CSV, WMS...).
                Voit aktivoida, disabloida ja muokata yhdistimien asetuksia.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {/* Link to connector list page */}
              <Button asChild size="sm">
                <Link href="/admin/connectors">Avaa yhdistimet</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/connectors/new">+ Luo uusi yhdistin</Link>
              </Button>
            </div>
          </div>

          {/* Data & runs -card */}
          <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Datalähteet ja ajot
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Seuraa synkronointeja, tarkastele ajon tilaa ja datan laadun
                indikaattoreita. Soveltuu operatiiviseen valvontaan.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {/* Link to data sources / runs overview */}
              <Button asChild size="sm">
                <Link href="/admin/data-sources">Näytä datalähteet</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/runs">Ajot & lokit</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* -------------------------------- */}
        {/* QUICK LINKS / SECONDARY AREA    */}
        {/* -------------------------------- */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Pikalinkit
          </h3>
          <div className="flex flex-wrap gap-3 text-sm">
            {/* Quick links – tune based on your needs */}
            <Link
              href="/admin/settings"
              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 hover:bg-gray-100"
            >
              Ylläpitoasetukset
            </Link>
            <Link
              href="/admin/monitoring"
              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 hover:bg-gray-100"
            >
              Monitorointi & hälytykset
            </Link>
            <Link
              href="/admin/docs"
              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 hover:bg-gray-100"
            >
              Dokumentaatio
            </Link>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
};

export default AdminHomePage;
