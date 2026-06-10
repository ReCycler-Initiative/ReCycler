"use client";

import { PageIntro } from "@/components/admin/page-intro";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/locale-provider";
import { getObjects } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";

const ObjectsPage = () => {
  const messages = useMessages();
  const { id: organizationId, useCaseId } = useParams<{
    id: string;
    useCaseId: string;
  }>();

  const queryKey = ["objects", organizationId, useCaseId];

  const { data: fields = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getObjects(organizationId, useCaseId),
  });

  return (
    <PageTemplate>
      <PageIntro
        title={messages.admin.fields}
        description={messages.admin.useCaseHomeHighlights[2]}
        actions={
          <Button onClick={() => undefined}>
            <Plus className="h-4 w-4 mr-2" />
            Lisää sisältömalli
          </Button>
        }
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Ladataan...</p>
      ) : fields.length === 0 ? (
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.map((field, index) => (
                <tr key={field.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{field.name}</td>
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
