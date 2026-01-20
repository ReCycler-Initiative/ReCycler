"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminList } from "@/components/admin/admin-list";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { EditIcon, PlusIcon } from "lucide-react";

type ConnectorStatus = "draft" | "active" | "disabled";

type Connector = {
  id: string;
  name: string;
  status: ConnectorStatus;
  type: string;
  description?: string;
  lastSyncAt?: string;
};

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
  const [attachedConnectors] = useState<Connector[]>([allConnectors[0]]);

  return (
    <PageTemplate
      title="Datalähteet"
      actions={
        <Button asChild type="button">
          <Link href="datasources/new">
            <PlusIcon className="mr-2" />
            Lisää datalähde
          </Link>
        </Button>
      }
    >
      <AdminList
        items={attachedConnectors.map((connector) => ({
          id: connector.id,
          title: connector.name,
          description: connector.description,
          badges: (
            <>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass[connector.status]}`}
              >
                {statusLabel[connector.status]}
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700">
                {connector.type}
              </span>
            </>
          ),
          metadata: connector.lastSyncAt && (
            <p className="text-xs text-gray-500">
              Viimeisin ajo / synkronointi:{" "}
              {new Date(connector.lastSyncAt).toLocaleString("fi-FI")}
            </p>
          ),
          actions: (
            <Button asChild variant="outline">
              <Link href={`datasources/${connector.id}/edit`}>
                <EditIcon className="mr-2" />
                <span>Muokkaa</span>
              </Link>
            </Button>
          ),
        }))}
        emptyMessage="Tällä use casella ei ole vielä datalähteitä."
      />
    </PageTemplate>
  );
};

export default DataSourcesPage;
