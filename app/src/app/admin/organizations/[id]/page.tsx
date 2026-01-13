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
              Tervetuloa määrittämään käyttötapauksen datalähde ja hallitsemaan
              siihen liittyvää yhdistintä. Yhdessä käyttötapauksessa on yksi
              datalähde.
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
              <span className="rounded-full bg-gray-50 px-3 py-1">
                1 datalähde / käyttötapaus
              </span>
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
          {/* Data source & connector -card */}
          <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Datalähde ja yhdistin
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Liitä käyttötapaukseen datalähde (esim. REST API, CSV, WMS).
                Jos datalähde on jo liitetty, voit muokata sen ominaisuuksia ja
                yhdistimen asetuksia. Yhdessä käyttötapauksessa on yksi
                datalähde.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {/* Primary: connect/select data source for the use case */}
              <Button asChild size="sm">
                <Link href="/admin/data-source/connect">Liitä datalähde</Link>
              </Button>

              {/* Secondary: edit existing data source properties */}
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/data-source">Muokkaa datalähdettä</Link>
              </Button>

              {/* Optional: manage connector templates / catalog */}
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/connectors">Yhdistinkatalogi</Link>
              </Button>

              {/* Optional: create new connector type */}
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/connectors/new">+ Luo uusi yhdistin</Link>
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
