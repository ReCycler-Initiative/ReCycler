"use client";

import { useState } from "react";
import Link from "next/link";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { EditIcon, PlusIcon } from "lucide-react";

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
    <PageTemplate
      title={`Datalähteet`}
      actions={
        <Button asChild type="button">
          <Link href="datasources/new">
            <PlusIcon className="mr-2" />Lisää datalähde
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-y-8 pb-24 lg:pb-0">
        <section className="border border-gray-200 bg-white p-1 shadow-sm">
          <div className="space-y-3">
            {attachedConnectors.length === 0 && (
              <div className="border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Tällä use casella ei ole vielä datalähteitä.
              </div>
            )}
            {attachedConnectors.map((connector) => (
              <div
                key={connector.id}
                className="flex flex-col gap-3 border border-gray-200 bg-gray-50 p-4 text-sm md:flex-row md:items-center md:justify-between"
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
                  <Button asChild variant="outline">
                    <Link href={`datasources/${connector.id}/edit`}>
                      <EditIcon className="mr-2" />
                      <span>Muokkaa</span>
                    </Link>
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

export default DataSourcesPage;
