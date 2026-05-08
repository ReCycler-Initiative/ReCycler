"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/locale-provider";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type RunStatus = "success" | "error" | "running";

type RunItem = {
  id: string;
  startedAt: string;
  finishedAt?: string;
  status: RunStatus;
  source?: string;
  summary: string;
};

const runs: RunItem[] = [
  {
    id: "run_001",
    startedAt: "09.12.2025 22:14",
    finishedAt: "09.12.2025 22:15",
    status: "error",
    source: "Ominaisuudet",
    summary: "1 virhe – tarkista loki",
  },
  {
    id: "run_002",
    startedAt: "09.12.2025 04:10",
    finishedAt: "09.12.2025 04:11",
    status: "success",
    source: "Sijainnit",
    summary: "OK",
  },
  {
    id: "run_003",
    startedAt: "08.12.2025 22:14",
    finishedAt: "08.12.2025 22:14",
    status: "success",
    source: "Viitetiedot",
    summary: "OK",
  },
];

const statusLabel: Record<RunStatus, string> = {
  success: "Onnistui",
  error: "Virhe",
  running: "Käynnissä",
};

const statusPillClass: Record<RunStatus, string> = {
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  running: "bg-blue-100 text-blue-800",
};

export default function RunsPage() {
  const messages = useMessages();
  const searchParams = useSearchParams();
  const connection = searchParams.get("connection");

  const statusLabel: Record<RunStatus, string> = {
    success: messages.admin.statusSuccess,
    error: messages.admin.statusError,
    running: messages.admin.statusRunning,
  };

  return (
    <PageTemplate title={messages.admin.runsPageTitle}>
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {messages.admin.runsIntro}
            </p>

            {connection && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                {messages.admin.filterLabel} <span className="font-semibold">{connection}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="?">{messages.admin.clearFilter}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="#">{messages.admin.startRun}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-medium text-gray-900">{messages.admin.runHistoryTitle}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {messages.admin.runHistoryDescription}
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {runs.map((run) => (
              <div
                key={run.id}
                className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold text-gray-900">
                      {run.source ?? messages.admin.runSourceFallback}
                    </div>
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        statusPillClass[run.status],
                      ].join(" ")}
                    >
                      {statusLabel[run.status]}
                    </span>
                    <span className="text-xs text-gray-500">{run.id}</span>
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    {messages.admin.startedAt}: <span className="font-medium text-gray-900">{run.startedAt}</span>
                    {run.finishedAt && (
                      <>
                        {" "}
                        · {messages.admin.completedAt}: <span className="font-medium text-gray-900">{run.finishedAt}</span>
                      </>
                    )}
                  </div>

                  <div className="mt-1 text-sm text-gray-600">{run.summary}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="#">{messages.admin.openLog}</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="#">{messages.admin.showErrors}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900">{messages.admin.nextStepsTitle}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {messages.admin.nextStepsDescription}
          </p>
        </section>
      </div>
    </PageTemplate>
  );
}
