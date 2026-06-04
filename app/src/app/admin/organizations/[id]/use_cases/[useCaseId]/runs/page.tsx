"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { UseCasePageIntro } from "@/components/admin/use-case-page-intro";
import { Button } from "@/components/ui/button";
import {
  getDatasourceRuns,
  getDatasources,
  runDatasource,
} from "@/services/api";
import { Datasource, DatasourceRun } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useLocale, useMessages } from "@/i18n/locale-provider";

const statusPillClass: Record<string, string> = {
  running: "datasource-run-status-pill datasource-run-status-pill-running",
  completed: "datasource-run-status-pill datasource-run-status-pill-completed",
  failed: "datasource-run-status-pill datasource-run-status-pill-failed",
};

function formatDate(date: Date | undefined | null, locale: string) {
  if (!date) return "—";
  return new Date(date).toLocaleString(locale);
}

function formatRunToast(
  messages: ReturnType<typeof useMessages>,
  synced: number,
  deleted: number,
  skipped: number,
  failed: number
) {
  if (synced === 0 && deleted === 0 && failed === 0) {
    return `${messages.admin.syncCompleted} - ${messages.admin.noChangedOrImportedRows}`;
  }

  const parts = [
    `${synced} ${messages.admin.rowsChangedOrImported}`,
    `${deleted} ${messages.admin.rowsDeletedLabel}`,
  ];

  if (skipped > 0) {
    parts.push(`${skipped} ${messages.admin.rowsSkippedLabel}`);
  }

  if (failed > 0) {
    parts.push(`${failed} ${messages.admin.rowsFailedLabel}`);
  }

  return `${messages.admin.syncCompleted} - ${parts.join(", ")}`;
}

export default function RunsPage() {
  const messages = useMessages();
  const params = useParams<{ id: string; useCaseId: string }>();
  const organizationId = params.id;
  const { useCaseId } = params;
  const queryClient = useQueryClient();

  const { data: datasources = [] } = useQuery({
    queryKey: ["datasources", organizationId, useCaseId],
    queryFn: () => getDatasources(organizationId, useCaseId),
  });

  const runMutation = useMutation({
    mutationFn: (datasourceId: string) =>
      runDatasource(organizationId, useCaseId, datasourceId),
    onSuccess: (run, datasourceId) => {
      const synced = run.rows_synced ?? 0;
      const deleted = run.rows_deleted ?? 0;
      const skipped = run.rows_skipped ?? 0;
      const failed = run.rows_failed ?? 0;
      toast.success(formatRunToast(messages, synced, deleted, skipped, failed));
      queryClient.invalidateQueries({
        queryKey: ["datasource-runs", organizationId, useCaseId, datasourceId],
      });
    },
    onError: () => toast.error(messages.admin.syncFailed),
  });

  return (
    <PageTemplate>
      <div className="flex flex-col gap-6">
        <UseCasePageIntro
          title={messages.admin.runsPageTitle}
          description={messages.admin.runsIntro}
        />
        {datasources.length === 0 && (
          <p className="text-sm text-gray-500">{messages.admin.noDatasources}</p>
        )}
        {datasources.map((ds: Datasource) => (
          <DatasourceRunsSection
            key={ds.id}
            datasource={ds}
            organizationId={organizationId}
            useCaseId={useCaseId}
            onRun={() => runMutation.mutate(ds.id)}
            isRunning={runMutation.isPending && runMutation.variables === ds.id}
          />
        ))}
      </div>
    </PageTemplate>
  );
}

function DatasourceRunsSection({
  datasource,
  organizationId,
  useCaseId,
  onRun,
  isRunning,
}: {
  datasource: Datasource;
  organizationId: string;
  useCaseId: string;
  onRun: () => void;
  isRunning: boolean;
}) {
  const { locale } = useLocale();
  const messages = useMessages();

  const statusLabel: Record<string, string> = {
    running: messages.admin.statusRunning,
    completed: messages.admin.statusSuccess,
    failed: messages.admin.statusError,
  };

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ["datasource-runs", organizationId, useCaseId, datasource.id],
    queryFn: () => getDatasourceRuns(organizationId, useCaseId, datasource.id),
  });

  return (
    <section className="datasource-runs-card rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 p-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {datasource.name}
          </h2>
          <p className="mt-0.5 truncate text-sm text-gray-500">
            {datasource.url}
          </p>
        </div>
        <Button size="sm" onClick={onRun} disabled={isRunning}>
          <Play className={isRunning ? "mr-2 h-4 w-4 animate-bounce" : "mr-2 h-4 w-4"} />
          {isRunning ? `${messages.admin.runInProgress}...` : messages.admin.startRun}
        </Button>
      </div>

      {isLoading && <p className="p-4 text-sm text-gray-500">{messages.admin.loadingRuns}</p>}
      {!isLoading && runs.length === 0 && (
        <p className="p-4 text-sm text-gray-500">{messages.admin.noRuns}</p>
      )}
      <div className="divide-y divide-gray-100">
        {runs.map((run: DatasourceRun) => (
          <div
            key={run.id}
            className="flex flex-col gap-1 px-5 py-3 text-sm md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                  statusPillClass[run.status] ?? "datasource-run-status-pill",
                ].join(" ")}
              >
                {statusLabel[run.status] ?? run.status}
              </span>
              <span className="datasource-run-started-at text-gray-700">
                {formatDate(run.started_at, locale)}
              </span>
              {run.finished_at && (
                <span className="datasource-run-finished-at text-gray-400 text-xs">
                  → {formatDate(run.finished_at, locale)}
                </span>
              )}
            </div>
            <div className="datasource-run-summary flex gap-4 text-xs text-gray-500">
              {run.rows_synced != null && (
                <span>{run.rows_synced} {messages.admin.rowsChangedOrImported}</span>
              )}
              {run.rows_deleted != null && run.rows_deleted > 0 && (
                <span>{run.rows_deleted} {messages.admin.rowsDeletedLabel}</span>
              )}
              {run.rows_skipped != null && run.rows_skipped > 0 && (
                <span>{run.rows_skipped} {messages.admin.rowsSkippedLabel}</span>
              )}
              {run.rows_failed != null && run.rows_failed > 0 && (
                <span className="run-error-text">
                  {run.rows_failed} {messages.admin.rowsFailedLabel}
                </span>
              )}
              {run.error_message && (
                <span
                  className="run-error-text max-w-xs truncate"
                  title={run.error_message}
                >
                  {run.error_message}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
