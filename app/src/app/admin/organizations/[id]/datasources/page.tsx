"use client";

import Link from "next/link";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";

/**
 * Temporary mock data.
 * Replace with real backend data (per use case).
 */
type ConnectionStatus = "active" | "error" | "not_configured";

type DataConnection = {
  id: string;
  name: string; // e.g. "Sijainnit", "Ominaisuudet"
  status: ConnectionStatus;
  lastSyncAt?: string; // formatted string for now
};

const connections: DataConnection[] = [
  {
    id: "loc",
    name: "Sijainnit",
    status: "active",
    lastSyncAt: "10.12.2025 klo 09:30",
  },
  {
    id: "attr",
    name: "Ominaisuudet",
    status: "error",
    lastSyncAt: "09.12.2025 klo 22:14",
  },
  {
    id: "ref",
    name: "Viitetiedot",
    status: "not_configured",
  },
];

const statusLabel: Record<ConnectionStatus, string> = {
  active: "Aktiivinen",
  error: "Virhe",
  not_configured: "Ei määritetty",
};

const statusPillClass: Record<ConnectionStatus, string> = {
  active: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  not_configured: "bg-gray-200 text-gray-800",
};

const AdminHomePage = () => {
  return (
    <PageTemplate title="Datayhteydet">
      <div className="min-h-[calc(100vh-120px)] flex flex-col gap-6 pb-8">
        {/* -------------------------------- */}
        {/* HEADER                           */}
        {/* -------------------------------- */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {/* PageTemplate is the only H1; keep intro minimal here */}
            <p className="text-sm text-gray-600">
              Liitä ja hallitse käyttötapauksen datayhteyksiä.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/admin/data-source/connect">
                  + Liitä datayhteys
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm">
                <Link href="/admin/runs">Kaikki lokit</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* -------------------------------- */}
        {/* CONNECTION LIST                  */}
        {/* -------------------------------- */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-medium text-gray-900">Datayhteydet</h2>
            <p className="mt-1 text-sm text-gray-600">
              Avaa datayhteys, selaa dataa tai tarkista lokit.
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {connections.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold text-gray-900">
                      {c.name}
                    </div>
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        statusPillClass[c.status],
                      ].join(" ")}
                    >
                      {statusLabel[c.status]}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    Viimeisin synkronointi:{" "}
                    <span className="font-medium text-gray-900">
                      {c.lastSyncAt ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Per-connection actions */}
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/admin/data-source?connection=${c.id}`}>
                      Muokkaa
                    </Link>
                  </Button>

                  {/* "Selaa dataa" button removed */}

                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/runs?connection=${c.id}`}>Lokit</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageTemplate>
  );
};

export default AdminHomePage;
