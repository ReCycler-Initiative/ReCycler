"use client";

import Container from "@/components/container";
import { AiMaterialPrompt } from "@/components/ai-material-prompt";
import { Materials } from "@/components/materials";
import { FieldMaterials, FieldSelections } from "@/components/field-materials";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useEffect, useState } from "react";

export const MaterialsPageContent = ({
  initialSelectedCodes = [],
  initialSelectedFieldValues = {},
  organizationId,
  useCaseId,
  resultsBasePath,
  embedded = false,
  title = "Mitäs tänään kierrätetään?",
  description,
  ctaText = "Näytä kierrätyspisteet",
  tabAiText = "Chat",
  tabManualText = "Valitse itse",
}: {
  initialSelectedCodes?: number[];
  initialSelectedFieldValues?: FieldSelections;
  organizationId?: string;
  useCaseId?: string;
  resultsBasePath?: string;
  embedded?: boolean;
  title?: string;
  description?: string;
  ctaText?: string;
  tabAiText?: string;
  tabManualText?: string;
}) => {
  const [selectedCodes, setSelectedCodes] = useState<number[]>(initialSelectedCodes);
  const [selectedFieldValues, setSelectedFieldValues] = useState<FieldSelections>(initialSelectedFieldValues);

  const resolvedResultsBasePath =
    resultsBasePath ??
    (organizationId && useCaseId
      ? `/organizations/${organizationId}/use_cases/${useCaseId}/results`
      : "/recycler/results");

  useEffect(() => {
    setSelectedCodes(initialSelectedCodes);
  }, [initialSelectedCodes]);

  useEffect(() => {
    setSelectedFieldValues(initialSelectedFieldValues);
  }, [initialSelectedFieldValues]);

  const buildResultsHref = () => {
    const params = new URLSearchParams();
    if (selectedCodes.length) {
      params.set("materials", selectedCodes.join(","));
    }
    for (const [fieldId, values] of Object.entries(selectedFieldValues)) {
      if (values.length) {
        params.set(`field_${fieldId}`, values.join(","));
      }
    }
    const query = params.toString();
    return query ? `${resolvedResultsBasePath}?${query}` : resolvedResultsBasePath;
  };

  const resultsHref = buildResultsHref();

  const totalSelected =
    selectedCodes.length +
    Object.values(selectedFieldValues).reduce((sum, vals) => sum + vals.length, 0);

  const showFieldMaterials = !!(organizationId && useCaseId);

  return (
    <Container className={`max-w-2xl ${embedded ? "pt-4" : "pt-7 lg:pt-14"}`}>
      <h1 className="text-xl font-medium mb-4 font-sans">
        {title}
      </h1>
      {description && (
        <p className="mb-4 font-sans">{description}</p>
      )}
      <Tabs defaultValue="ai">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="ai" className="flex-1">
            {tabAiText}
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex-1">
            {tabManualText}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <AiMaterialPrompt
            selectedCodes={selectedCodes}
            onSelectedCodesChange={setSelectedCodes}
            organizationId={organizationId}
            useCaseId={useCaseId}
            ctaText={ctaText}
            resultsBasePath={resolvedResultsBasePath}
          />
        </TabsContent>

        <TabsContent value="manual">
          <div className={embedded ? "mb-6" : "mb-28 lg:mb-6"}>
            {showFieldMaterials ? (
              <FieldMaterials
                organizationId={organizationId}
                useCaseId={useCaseId}
                selectedValues={selectedFieldValues}
                onSelectionChange={setSelectedFieldValues}
              />
            ) : (
              <Materials
                selectedCodes={selectedCodes}
                onSelectionChange={setSelectedCodes}
              />
            )}
          </div>
          <div
            className={
              embedded
                ? "static bg-white p-4 flex flex-col items-center gap-y-4"
                : "fixed lg:static bottom-0 bg-white lg:bg-transparent border lg:border-none p-4 lg:p-0 left-0 right-0 border-gray-400 flex flex-col items-center gap-y-4"
            }
          >
            Valitut ({totalSelected})
            <Button asChild className="w-full max-w-96 lg:mb-6" size="lg">
              <Link href={resultsHref}>
                {ctaText}
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Container>
  );
};
