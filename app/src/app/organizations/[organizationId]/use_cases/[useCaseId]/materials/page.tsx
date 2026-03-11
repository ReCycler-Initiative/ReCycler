"use client";

import { MaterialsPageContent } from "@/components/materials-page";
import { getUseCaseById } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const MaterialsPage = () => {
  const { organizationId, useCaseId } = useParams<{
    organizationId: string;
    useCaseId: string;
  }>();

  const { data: useCase } = useQuery({
    queryKey: ["use_case", organizationId, useCaseId],
    queryFn: () => getUseCaseById(organizationId, useCaseId),
  });

  return (
    <MaterialsPageContent
      organizationId={organizationId}
      useCaseId={useCaseId}
      title={useCase?.content.filters.title || undefined}
      description={useCase?.content.filters.text || undefined}
      ctaText={useCase?.content.filters.cta || undefined}
      tabAiText={useCase?.content.filters.tab_ai || undefined}
      tabManualText={useCase?.content.filters.tab_manual || undefined}
    />
  );
};

export default MaterialsPage;
