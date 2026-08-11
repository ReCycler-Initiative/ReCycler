"use client";

import Container from "@/components/container";
import { AiMaterialPrompt } from "@/components/ai-material-prompt";
import { useMessages } from "@/i18n/locale-provider";
import { Materials } from "@/components/materials";
import { FieldMaterials, FieldSelections } from "@/components/field-materials";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const EMPTY_SELECTED_CODES: number[] = [];
const EMPTY_SELECTED_FIELD_VALUES: FieldSelections = {};

const sameNumberArray = (left: number[], right: number[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const sameFieldSelections = (
  left: FieldSelections,
  right: FieldSelections
) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => sameNumberArray(left[key] ?? [], right[key] ?? []));
};

export const MaterialsPageContent = ({
  initialSelectedCodes = EMPTY_SELECTED_CODES,
  initialSelectedFieldValues = EMPTY_SELECTED_FIELD_VALUES,
  organizationId,
  useCaseId,
  resultsBasePath,
  embedded = false,
  title,
  description,
  ctaText,
  tabAiText,
  tabManualText,
  onResultsNavigate,
  onResultsHrefChange,
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
  onResultsNavigate?: () => void;
  onResultsHrefChange?: (href: string) => void;
}) => {
  const messages = useMessages();
  const [selectedCodes, setSelectedCodes] = useState<number[]>(
    initialSelectedCodes
  );
  const [selectedFieldValues, setSelectedFieldValues] = useState<FieldSelections>(
    initialSelectedFieldValues
  );
  const resolvedResultsBasePath =
    resultsBasePath ??
    (organizationId && useCaseId
      ? `/organizations/${organizationId}/use_cases/${useCaseId}/results`
      : "/recycler/results");
  const resolvedTitle = title || messages.materials.pageTitle;
  const resolvedCtaText = ctaText || messages.materials.ctaShowResults;
  const resolvedTabAiText = tabAiText || messages.materials.tabChat;
  const resolvedTabManualText = tabManualText || messages.materials.tabManual;

  useEffect(() => {
    setSelectedCodes((currentSelectedCodes) =>
      sameNumberArray(currentSelectedCodes, initialSelectedCodes)
        ? currentSelectedCodes
        : initialSelectedCodes
    );
  }, [initialSelectedCodes]);

  useEffect(() => {
    setSelectedFieldValues((currentSelectedFieldValues) =>
      sameFieldSelections(currentSelectedFieldValues, initialSelectedFieldValues)
        ? currentSelectedFieldValues
        : initialSelectedFieldValues
    );
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

  useEffect(() => {
    onResultsHrefChange?.(resultsHref);
  }, [onResultsHrefChange, resultsHref]);

  const totalSelected =
    selectedCodes.length +
    Object.values(selectedFieldValues).reduce((sum, vals) => sum + vals.length, 0);

  const showFieldMaterials = !!(organizationId && useCaseId);

  return (
    <Container className={`max-w-2xl ${embedded ? "pt-4" : "pt-7 lg:pt-14"}`}>
      <h1 className="text-xl font-medium mb-4 font-sans">
        {resolvedTitle}
      </h1>
      {description && (
        <p className="mb-4 font-sans">{description}</p>
      )}
      <Tabs defaultValue="ai">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="ai" className="flex-1">
            {resolvedTabAiText}
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex-1">
            {resolvedTabManualText}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <AiMaterialPrompt
            selectedCodes={selectedCodes}
            onSelectedCodesChange={setSelectedCodes}
            selectedFieldValues={selectedFieldValues}
            onSelectedFieldValuesChange={setSelectedFieldValues}
            organizationId={organizationId}
            useCaseId={useCaseId}
            ctaText={resolvedCtaText}
            resultsBasePath={resolvedResultsBasePath}
            onResultsNavigate={onResultsNavigate}
            showPreparationTips={!embedded}
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
            {messages.materials.selected} ({totalSelected})
            <Button asChild className="w-full max-w-96 lg:mb-6" size="lg">
              <Link href={resultsHref} onClick={onResultsNavigate}>
                {resolvedCtaText}
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Container>
  );
};
