"use client";

import { LoadingState } from "@/components/loading-state";
import { getOrganizationById } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const ThankYou = () => {
  const params = useParams();
  const organizationId = params.id as string;

  const {
    data: organization,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => getOrganizationById(organizationId),
  });

  return (
    <LoadingState isLoading={isLoading} error={isError || !organization}>
      {organization && (
        <div className="flex-1 bg-white">
          <h1 className="text-2xl text-center py-6 border-b bg-gray-50 text-primary">
            Organisaatio {organization.name} luotiin onnistuneesti
          </h1>
        </div>
      )}
    </LoadingState>
  );
};

export default ThankYou;
