"use client";

import { PageLoadingSpinner } from "@/components/page-loading-spinner";
import { getObject, updateObject } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toApiData } from "../../_components/object-form";
import ObjectEditor from "../../_components/object-editor";

export default function EditObjectPage() {
  const router = useRouter();
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
  });

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <ObjectEditor
      defaultValues={{
        name: data?.name ?? "",
      }}
      mutation={async (organizationId, useCaseId, values) =>
        updateObject(organizationId, useCaseId, data?.id!, toApiData(values))
      }
    />
  );
}
