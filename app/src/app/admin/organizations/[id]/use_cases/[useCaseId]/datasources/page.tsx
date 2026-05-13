"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import {
  deleteDatasource,
  getDatasources,
  runDatasource,
} from "@/services/api";
import { Datasource } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Play, Trash2 } from "lucide-react";
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

const DatasourcesPage = () => {
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
      toast.success(
        `Synkronointi valmis — ${run.rows_synced ?? 0} sijaintia päivitetty`
      );
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

  return (
    <PageTemplate
      title="Datayhteydet"
      actions={
        <Button asChild>
          <Link
            href={`/admin/organizations/${organizationId}/use_cases/${useCaseId}/datasources/new`}
          >
            + Uusi datalähde
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Ladataan...</p>
      ) : datasources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ei datalähteitä. Lisää ensimmäinen klikkaamalla &quot;Uusi
          datalähde&quot;.
        </p>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
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
            <tbody className="divide-y divide-gray-100">
              {datasources.map((ds: Datasource) => (
                <tr key={ds.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{ds.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusPillClass[ds.status] ??
                          "bg-gray-100 text-gray-700",
                      ].join(" ")}
                    >
                      {statusLabel[ds.status] ?? ds.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-xs hidden md:table-cell">
                    {ds.url}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={runMutation.isPending}
                        onClick={() => runMutation.mutate(ds.id)}
                        aria-label="Aja synkronointi"
                        title="Aja synkronointi"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
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
                        className="text-destructive hover:text-destructive"
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
        </div>
      )}
    </PageTemplate>
  );
};

export default DatasourcesPage;
