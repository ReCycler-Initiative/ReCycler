"use client";

import { useState } from "react";
import Link from "next/link";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";

type ConnectorStatus = "draft" | "active" | "disabled";

type Connector = {
  id: string;
  name: string;
  status: ConnectorStatus;
  type: string; // esim. "REST API", "Webhook", "Datavarasto"
  description?: string;
  lastSyncAt?: string;
};

// Mockattu use case – hae oikeasti esim. API:sta tai server componentsista
const mockUseCase = {
  id: "uc-123",
  name: "Kierrätyspisteiden haku",
  description:
    "Use case, joka hakee kierrätyspisteet eri datalähteistä ja näyttää ne loppukäyttäjälle kartalla.",
};

// Mockattu connector-lista – korvaa backend-haulla
const allConnectors: Connector[] = [
  {
    id: "conn-1",
    name: "Recycler 4.0 API",
    status: "active",
    type: "REST API",
    description: "Pääasiallinen kierrätyspisteiden datalähde.",
    lastSyncAt: "2025-12-10T09:30:00Z",
  },
  {
    id: "conn-2",
    name: "Kaupunki A - avoin rajapinta",
    status: "draft",
    type: "REST API",
    description: "Kaupunki A:n avoin keräyspiste-rajapinta.",
  },
  {
    id: "conn-3",
    name: "Sisäinen CSV-tuonti",
    status: "disabled",
    type: "Batch / CSV",
    description: "Sisäinen CSV-tuonti taustajärjestelmästä.",
  },
];

const statusLabel: Record<ConnectorStatus, string> = {
  draft: "Luonnos",
  active: "Aktiivinen",
  disabled: "Poissa käytöstä",
};

const statusBadgeClass: Record<ConnectorStatus, string> = {
  draft: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  active: "bg-green-50 text-green-800 border border-green-200",
  disabled: "bg-gray-50 text-gray-700 border border-gray-200",
};

const DataSourcesPage = () => {
  // Oletus: use case käyttää aluksi vain yhtä yhdistintä
  const [attachedConnectors, setAttachedConnectors] = useState<Connector[]>([
    allConnectors[0],
  ]);

  const [availableConnectors, setAvailableConnectors] = useState<Connector[]>(
    allConnectors.slice(1)
  );

  const [selectedConnectorId, setSelectedConnectorId] = useState<string>("");

  const handleAttachConnector = () => {
    if (!selectedConnectorId) return;
    const connector = availableConnectors.find(
      (c) => c.id === selectedConnectorId
    );
    if (!connector) return;

    setAttachedConnectors((prev) => [...prev, connector]);
    setAvailableConnectors((prev) =>
      prev.filter((c) => c.id !== selectedConnectorId)
    );
    setSelectedConnectorId("");
    // TODO: kutsu backend: POST /use-cases/:id/connectors
  };

  const handleDetachConnector = (id: string) => {
    const connector = attachedConnectors.find((c) => c.id === id);
    if (!connector) return;

    setAttachedConnectors((prev) => prev.filter((c) => c.id !== id));
    setAvailableConnectors((prev) => [...prev, connector]);
    // TODO: kutsu backend: DELETE /use-cases/:id/connectors/:connectorId
  };

  return (
    <PageTemplate title={`Datalähteet`}>
      <div className="flex flex-col gap-y-8 pb-24 lg:pb-0">
        {/* ----------------------------- */}
        {/* HEADER & SUMMARY               */}
        {/* ----------------------------- */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-gray-900">
                Use casen datalähteet
              </h1>
              <p className="text-sm text-gray-600">
                Tältä sivulta näet, mitä yhdistimiä tämä use case käyttää, ja
                voit lisätä tai poistaa datalähteitä.
              </p>

              {mockUseCase.description && (
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Kuvaus:</span>{" "}
                  {mockUseCase.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                <span className="rounded-full bg-gray-50 px-3 py-1">
                  {attachedConnectors.length} yhdistintä liitetty
                </span>
                <span className="rounded-full bg-gray-50 px-3 py-1">
                  {availableConnectors.length} muuta yhdistintä saatavilla
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------- */}
        {/* ATTACHED CONNECTORS           */}
        {/* ----------------------------- */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Liitetyt yhdistimet
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Nämä yhdistimet toimittavat dataa tälle use caselle. Voit
                avata yhdistimen muokkausnäkymän tai poistaa sen use casesta.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {attachedConnectors.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Tällä use casella ei ole vielä liitettyjä yhdistimiä. Lisää
                yhdistin alta olevasta valikosta.
              </div>
            )}

            {attachedConnectors.map((connector) => (
              <div
                key={connector.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {connector.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass[connector.status]}`}
                    >
                      {statusLabel[connector.status]}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      {connector.type}
                    </span>
                  </div>

                  {connector.description && (
                    <p className="text-xs text-gray-600">
                      {connector.description}
                    </p>
                  )}

                  {connector.lastSyncAt && (
                    <p className="text-xs text-gray-500">
                      Viimeisin ajo / synkronointi:{" "}
                      {new Date(connector.lastSyncAt).toLocaleString("fi-FI")}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {/* Linkitä tänne teidän uusi connector-konffisivu */}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/connectors/${connector.id}`}>
                      Avaa yhdistimen asetukset
                    </Link>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDetachConnector(connector.id)}
                  >
                    Poista use casesta
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ----------------------------- */}
        {/* ADD CONNECTOR TO USE CASE     */}
        {/* ----------------------------- */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Lisää olemassa oleva yhdistin
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Liitä olemassa olevia yhdistimiä tähän use caseen. Yhdistimen
                tekniset asetukset muokataan omalla yhdistinsivullaan.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <select
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm 
                           focus:border-black focus:outline-none focus:ring-1 focus:ring-black md:w-64"
                value={selectedConnectorId}
                onChange={(e) => setSelectedConnectorId(e.target.value)}
              >
                <option value="">
                  {availableConnectors.length === 0
                    ? "Ei muita yhdistimiä saatavilla"
                    : "Valitse lisättävä yhdistin"}
                </option>
                {availableConnectors.map((connector) => (
                  <option key={connector.id} value={connector.id}>
                    {connector.name}{" "}
                    {connector.status !== "active"
                      ? `(${statusLabel[connector.status]})`
                      : ""}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                size="sm"
                className="md:ml-2"
                onClick={handleAttachConnector}
                disabled={!selectedConnectorId}
              >
                + Liitä use caseen
              </Button>

              {/* >>> UUSI: Luo uusi yhdistin -nappi <<< */}
              <Button
                asChild
                type="button"
                variant="outline"
                size="sm"
                className="md:ml-2 w-full md:w-auto"
              >
                {/* Vaihda href siihen reittiin, missä teidän "uusi connectori" -sivu on */}
                <Link href="/admin/connectors/new">
                  + Luo uusi yhdistin
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
};

export default DataSourcesPage;
