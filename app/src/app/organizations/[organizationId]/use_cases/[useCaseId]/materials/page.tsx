"use client";

import { MaterialsPageContent } from "@/components/materials-page";
import { useLocale } from "@/i18n/locale-provider";
import { resolveLocalizedText } from "@/lib/use-case-content";
import { getUseCaseById } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

const MaterialsPage = () => {
  const { locale } = useLocale();
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
      title={useCase ? resolveLocalizedText(useCase.content.filters.title, locale) : undefined}
      description={useCase ? resolveLocalizedText(useCase.content.filters.text, locale) : undefined}
      ctaText={useCase ? resolveLocalizedText(useCase.content.filters.cta, locale) : undefined}
      tabAiText={useCase ? resolveLocalizedText(useCase.content.filters.tab_ai, locale) : undefined}
      tabManualText={useCase ? resolveLocalizedText(useCase.content.filters.tab_manual, locale) : undefined}
    />
  );
};

export default MaterialsPage;
