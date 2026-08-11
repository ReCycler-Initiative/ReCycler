"use client";

import { PageIntro } from "@/components/admin/page-intro";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/locale-provider";
import { getLocationTypes } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const LocationTypesPage = () => {
  const messages = useMessages();
  const { id: organizationId, useCaseId } = useParams<{
    id: string;
    useCaseId: string;
  }>();

  const queryKey = ["locationTypes", organizationId, useCaseId];

  const { data: locationTypes = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getLocationTypes(organizationId, useCaseId),
  });

  return (
    <PageTemplate>
      <PageIntro
        title={messages.adminLocationTypesPage.title}
        description={messages.adminLocationTypesPage.description}
        actions={
          <Button asChild>
            <Link
              href={`/admin/organizations/${organizationId}/use_cases/${useCaseId}/locationTypes/new/edit`}
            >
              <Plus className="h-4 w-4 mr-2" />
              {messages.adminLocationTypesListPage.addLocationType}
            </Link>
          </Button>
        }
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          {messages.adminLocationTypesListPage.loading}
        </p>
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
                  <td className="px-4 py-3 font-medium">{locationType.name}</td>
                  <td className="px-4 py-3 font-medium text-center">
                    {locationType.fields.length}
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={
                        messages.adminLocationTypesListPage.editLocationTypeAria
                      }
                    >
                      <Link
                        href={`/admin/organizations/${organizationId}/use_cases/${useCaseId}/locationTypes/${locationType.id}/edit`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
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
