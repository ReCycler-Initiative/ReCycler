"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { UseCasePageIntro } from "@/components/admin/use-case-page-intro";
import { Button } from "@/components/ui/button";
import {
  deleteDatasource,
  getDatasources,
  runDatasource,
} from "@/services/api";
import { Datasource } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cable, CheckCircle2, Pencil, Play, TimerReset, Trash2 } from "lucide-react";
import { useMessages } from "@/i18n/locale-provider";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const statusLabel: Record<string, string> = {
  draft: "Luonnos",
  active: "Aktiivinen",
  disabled: "Poissa käytöstä",
};

const statusPillClass: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-800",
  disabled: "bg-yellow-100 text-yellow-800",
};

function formatRunToast(
  messages: ReturnType<typeof useMessages>,
  synced: number,
  skipped: number,
  failed: number
) {
  if (synced === 0 && skipped > 0 && failed === 0) {
    return `${messages.admin.syncCompleted} - ${messages.admin.noChangedOrImportedRows}`;
  }

  return `${messages.admin.syncCompleted} - ${synced} ${messages.admin.rowsChangedOrImported}, ${skipped} ${messages.admin.rowsSkippedLabel}, ${failed} ${messages.admin.rowsFailedLabel}`;
}

const DatasourcesPage = () => {
  const messages = useMessages();
  const params = useParams<{ id: string; useCaseId: string }>();
  const organizationId = params.id;
  const { useCaseId } = params;

  const queryClient = useQueryClient();

  const { data: datasources = [], isLoading } = useQuery({
    queryKey: ["datasources", organizationId, useCaseId],
    queryFn: () => getDatasources(organizationId, useCaseId),
  });

  const runMutation = useMutation({
    mutationFn: (datasourceId: string) =>
      runDatasource(organizationId, useCaseId, datasourceId),
    onSuccess: (run) => {
      const synced = run.rows_synced ?? 0;
      const skipped = run.rows_skipped ?? 0;
      const failed = run.rows_failed ?? 0;
      toast.success(formatRunToast(messages, synced, skipped, failed));
      queryClient.invalidateQueries({
        queryKey: ["datasources", organizationId, useCaseId],
      });
    },
    onError: () => toast.error("Synkronointi epäonnistui"),
  });

  const deleteMutation = useMutation({
    mutationFn: (datasourceId: string) =>
      deleteDatasource(organizationId, useCaseId, datasourceId),
    onSuccess: () => {
      toast.success("Datalähde poistettu");
      queryClient.invalidateQueries({
        queryKey: ["datasources", organizationId, useCaseId],
      });
    },
    onError: () => toast.error("Poisto epäonnistui"),
  });

  const totalCount = datasources.length;
  const activeCount = datasources.filter((ds) => ds.status === "active").length;
  const draftCount = datasources.filter((ds) => ds.status === "draft").length;

  return (
    <PageTemplate>
      <div className="space-y-6">
        <UseCasePageIntro
          title={messages.admin.datasourcesPageTitle}
          description={messages.admin.datasourcesIntro}
          actions={
            <Button asChild>
              <Link
                href={`/admin/organizations/${organizationId}/use_cases/${useCaseId}/datasources/new`}
              >
                {messages.admin.attachDatasource}
              </Link>
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: messages.admin.datasourcesListTitle, value: totalCount, icon: Cable },
            { label: messages.admin.statusActive, value: activeCount, icon: CheckCircle2 },
            { label: statusLabel.draft, value: draftCount, icon: TimerReset },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <card.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-2xl font-semibold text-slate-900">{card.value}</div>
              <div className="mt-1 text-sm text-slate-600">{card.label}</div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Ladataan...</p>
        ) : datasources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600 shadow-sm">
            Ei datalähteitä. Lisää ensimmäinen klikkaamalla &quot;{messages.admin.attachDatasource}&quot;.
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {messages.admin.datasourcesListTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {messages.admin.datasourcesListDescription}
              </p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Nimi
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Tila
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                    URL
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground w-32">
                    Toiminnot
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {datasources.map((ds: Datasource) => (
                  <tr key={ds.id} className="bg-white hover:bg-slate-50/70">
                    <td className="px-4 py-4 font-medium text-slate-900">{ds.name}</td>
                    <td className="px-4 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          statusPillClass[ds.status] ?? "bg-gray-100 text-gray-700",
                        ].join(" ")}
                      >
                        {statusLabel[ds.status] ?? ds.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground truncate max-w-xs hidden md:table-cell">
                      {ds.url}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 justify-end">
                        {(() => {
                          const isRunning = runMutation.isPending && runMutation.variables === ds.id;

                          return (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="datasource-action-button"
                          disabled={runMutation.isPending}
                          onClick={() => runMutation.mutate(ds.id)}
                          aria-label="Aja synkronointi"
                          title="Aja synkronointi"
                        >
                          <Play className={isRunning ? "h-4 w-4 animate-bounce" : "h-4 w-4"} />
                        </Button>
                          );
                        })()}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="datasource-action-button"
                          asChild
                          aria-label="Muokkaa"
                        >
                          <Link
                            href={`/admin/organizations/${organizationId}/use_cases/${useCaseId}/datasources/${ds.id}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="datasource-action-button datasource-delete-button text-slate-900 hover:bg-slate-100 hover:text-slate-900"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Poistetaanko datalähde "${ds.name}"?`)) {
                              deleteMutation.mutate(ds.id);
                            }
                          }}
                          aria-label="Poista"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </PageTemplate>
  );
};

export default DatasourcesPage;
