"use client";

import { PageIntro } from "@/components/admin/page-intro";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/locale-provider";
import { deleteLocationType, getLocationTypes } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const LocationTypesPage = () => {
  const messages = useMessages();
  const queryClient = useQueryClient();
  const { id: organizationId, useCaseId } = useParams<{
    id: string;
    useCaseId: string;
  }>();

  const queryKey = ["locationTypes", organizationId, useCaseId];

  const { data: locationTypes = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getLocationTypes(organizationId, useCaseId),
  });

  const deleteMutation = useMutation({
    mutationFn: (locationTypeId: string) =>
      deleteLocationType(organizationId, useCaseId, locationTypeId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ["fields", organizationId, useCaseId] }),
      ]);
      toast.success(messages.adminLocationTypesListPage.deleteSuccess);
    },
    onError: (error) => {
      const inUse = isAxiosError(error) && error.response?.data?.code === "LOCATION_TYPE_IN_USE";
      toast.error(inUse
        ? messages.adminLocationTypesListPage.deleteInUse
        : messages.adminLocationTypesListPage.deleteFailed);
    },
  });

  return (
    <PageTemplate>
      <PageIntro
        title={messages.adminLocationTypesListPage.title}
        description={messages.adminLocationTypesListPage.description}
        actions={
          <Button asChild>
            <Link
              href={`/admin/organizations/${organizationId}/use_cases/${useCaseId}/location-types/new/edit`}
            >
              <Plus className="h-4 w-4 mr-2" />
              {messages.adminLocationTypesListPage.addLocationType}
            </Link>
          </Button>
        }
      />
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 h-32 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm">{messages.adminLocationTypesListPage.loading}</p>
        </div>
      ) : locationTypes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {messages.adminLocationTypesListPage.noLocationTypes}
        </p>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {messages.adminLocationTypesListPage.nameColumn}
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  {messages.adminLocationTypesListPage.fieldsColumn}
                </th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {locationTypes.map((locationType) => (
                <tr key={locationType.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium break-words">{locationType.name}</td>
                  <td className="px-4 py-3 font-medium text-center">
                    {locationType.fields.length}
                  </td>
                  <td className="px-2">
                    <div className="flex justify-end gap-1">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      aria-label={
                        messages.adminLocationTypesListPage.editLocationTypeAria
                      }
                    >
                      <Link
                        href={`/admin/organizations/${organizationId}/use_cases/${useCaseId}/location-types/${locationType.id}/edit`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      title={messages.adminLocationTypesListPage.deleteLocationTypeAria}
                      aria-label={messages.adminLocationTypesListPage.deleteLocationTypeAria}
                      disabled={deleteMutation.isPending}
                      isLoading={deleteMutation.isPending && deleteMutation.variables === locationType.id}
                      onClick={() => {
                        const confirmation = messages.adminLocationTypesListPage.deleteConfirm
                          .replace("{name}", locationType.name)
                          .replace("{count}", String(locationType.fields.length));
                        if (window.confirm(confirmation)) deleteMutation.mutate(locationType.id);
                      }}
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

export default LocationTypesPage;
