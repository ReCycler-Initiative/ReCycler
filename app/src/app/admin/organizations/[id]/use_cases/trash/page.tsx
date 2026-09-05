"use client";

import { PageIntro } from "@/components/admin/page-intro";
import { PageTemplate } from "@/components/admin/page-template";
import { PageLoadingSpinner } from "@/components/page-loading-spinner";
import { Button } from "@/components/ui/button";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { getDeletedUseCases, getUseCases, restoreUseCase } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const TRASH_RETENTION_DAYS = 30;

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export default function UseCaseTrashPage() {
  const { locale } = useLocale();
  const messages = useMessages();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const activeUseCasesQuery = useQuery({
    queryKey: ["use_cases", id],
    queryFn: () => getUseCases(id),
  });
  const deletedUseCasesQuery = useQuery({
    queryKey: ["deleted_use_cases", id],
    queryFn: () => getDeletedUseCases(id),
  });

  const restoreMutation = useMutation({
    mutationFn: (useCaseId: string) => restoreUseCase(id, useCaseId),
    onSuccess: async (restoredUseCase) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["use_cases", id] }),
        queryClient.invalidateQueries({ queryKey: ["deleted_use_cases", id] }),
      ]);
      router.push(`/admin/organizations/${id}/use_cases/${restoredUseCase.id}`);
    },
  });

  if (activeUseCasesQuery.isLoading || deletedUseCasesQuery.isLoading) {
    return <PageLoadingSpinner />;
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const firstActiveUseCase = activeUseCasesQuery.data?.[0];
  const deletedUseCases = deletedUseCasesQuery.data ?? [];

  return (
    <PageTemplate>
      <PageIntro
        title={messages.adminTrashPage.title}
        description={messages.adminTrashPage.description}
        actions={
          firstActiveUseCase ? (
            <Button asChild variant="outline">
              <Link href={`/admin/organizations/${id}/use_cases/${firstActiveUseCase.id}`}>
                {messages.adminTrashPage.openActiveUseCase}
              </Link>
            </Button>
          ) : undefined
        }
        icon={Trash2}
      />

      {deletedUseCases.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            {messages.adminTrashPage.emptyTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {messages.adminTrashPage.emptyDescription}
          </p>
        </section>
      ) : (
        <div className="grid gap-4">
          {deletedUseCases.map((useCase) => {
            const deletedAt = useCase.deleted_at ? new Date(useCase.deleted_at) : null;
            const purgeAt = deletedAt ? addDays(deletedAt, TRASH_RETENTION_DAYS) : null;
            const isRestoring =
              restoreMutation.isPending && restoreMutation.variables === useCase.id;

            return (
              <section
                key={useCase.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-slate-900">{useCase.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {useCase.description}
                    </p>
                    <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <span className="font-medium text-slate-900">
                          {messages.adminTrashPage.deletedAt}:
                        </span>{" "}
                        {deletedAt ? formatter.format(deletedAt) : "-"}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">
                          {messages.adminTrashPage.scheduledPurgeAt}:
                        </span>{" "}
                        {purgeAt ? formatter.format(purgeAt) : "-"}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    isLoading={isRestoring}
                    onClick={async () => {
                      try {
                        await restoreMutation.mutateAsync(useCase.id);
                      } catch {
                        window.alert(messages.adminTrashPage.restoreFailed);
                      }
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {messages.adminTrashPage.restoreUseCase}
                  </Button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </PageTemplate>
  );
}