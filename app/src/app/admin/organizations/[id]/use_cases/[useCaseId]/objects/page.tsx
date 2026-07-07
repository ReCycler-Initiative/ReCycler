"use client";

import { PageIntro } from "@/components/admin/page-intro";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { getObjects } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const ObjectsPage = () => {
  const { id: organizationId, useCaseId } = useParams<{
    id: string;
    useCaseId: string;
  }>();

  const queryKey = ["objects", organizationId, useCaseId];

  const { data: objects = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getObjects(organizationId, useCaseId),
  });

  return (
    <PageTemplate>
      <PageIntro
        title="Sisältömallit"
        description="Lisää ja muokkaa sisältömalleja"
        actions={
          <Button asChild>
            <Link
              href={`/admin/organizations/${organizationId}/use_cases/${useCaseId}/objects/new/edit`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Lisää sisältömalli
            </Link>
          </Button>
        }
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Ladataan...</p>
      ) : objects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ei sisältömalleja. Lisää ensimmäinen sisältömalli
        </p>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Nimi
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Kenttiä
                </th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {objects.map((object) => (
                <tr key={object.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{object.name}</td>
                  <td className="px-4 py-3 font-medium text-center">
                    {object.fields.length}
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="icon"
                      // onClick={() => openEdit(field)}
                      aria-label="Muokkaa kenttää"
                    >
                      <Link
                        href={`/admin/organizations/${organizationId}/use_cases/${useCaseId}/objects/${object.id}/edit`}
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

export default ObjectsPage;
