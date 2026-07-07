"use client";

import { PageLoadingSpinner } from "@/components/page-loading-spinner";
import { createObject, getObject, updateObject } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toApiData } from "../../_components/object-form";
import ObjectEditor from "../../_components/object-editor";

export default function EditObjectPage() {
  const {
    objectId,
    id: organizationId,
    useCaseId,
  } = useParams<{
    objectId: string;
    id: string;
    useCaseId: string;
  }>();

  const { data, isLoading } = useQuery({
    queryKey: [organizationId, useCaseId, objectId],
    queryFn: () => getObject(organizationId, useCaseId, objectId),
    enabled:
      !!organizationId && !!useCaseId && !!objectId && objectId !== "new",
  });

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <ObjectEditor
      defaultValues={{
        name: data?.name ?? "",
      }}
      mutation={async (organizationId, useCaseId, values) => {
        if (objectId === "new") {
          return await createObject(
            organizationId,
            useCaseId,
            toApiData(values)
          );
        }
        return await updateObject(
          organizationId,
          useCaseId,
          data?.id!,
          toApiData(values)
        );
      }}
    />
  );
}
