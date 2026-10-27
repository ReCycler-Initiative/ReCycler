"use client";

import { getFields } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { CustomCheckbox, getNameIconEntry } from "@/components/materials";
import LoadingSpinner from "@/components/loading-spinner";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { localizeMaterialNameCandidate } from "@/lib/material-translations";
import { MarkdownContent } from "@/components/markdown-block";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export type FieldSelections = Record<string, number[]>;

export const FieldMaterials = ({
  organizationId,
  useCaseId,
  selectedValues,
  onSelectionChange,
}: {
  organizationId: string;
  useCaseId: string;
  selectedValues: FieldSelections;
  onSelectionChange: (values: FieldSelections) => void;
}) => {
  const { locale } = useLocale();
  const messages = useMessages();
  const [infoChoice, setInfoChoice] = useState<{ choice: string; text: string }>();
  const { data: fields, isFetching } = useQuery({
    queryKey: ["fields", organizationId, useCaseId],
    queryFn: () => getFields(organizationId, useCaseId),
    staleTime: Infinity,
  });

  const multiSelectFields = fields?.filter((f) => f.field_type === "multi_select") ?? [];

  if (isFetching) {
    return (
      <div className="flex items-center flex-col gap-4 py-6">
        <LoadingSpinner />
        <p>{messages.materials.loadingMaterials}</p>
      </div>
    );
  }

  if (multiSelectFields.length === 0) return null;

  return (
    <div className="space-y-6">
      {multiSelectFields.map((field) => {
        const choices = field.options?.choices ?? [];
        const fieldSelected = selectedValues[field.id] ?? [];

        return (
          <div key={field.id}>
            {multiSelectFields.length > 1 && (
              <h3 className="text-sm font-medium mb-3">{field.name}</h3>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {choices.map((choice, choiceIndex) => {
                const iconEntry = getNameIconEntry(choice);
                const color = field.options?.choiceColors?.[choice] ?? iconEntry?.baseHex;
                const checked = fieldSelected.includes(choiceIndex);
                const info = field.options?.choiceInfo?.[choice];
                return (
                  <CustomCheckbox
                    key={choice}
                    baseHex={color}
                    checked={checked}
                    label={localizeMaterialNameCandidate(choice, locale)}
                    icon={iconEntry?.icon}
                    onInfo={info ? () => setInfoChoice({ choice, text: info }) : undefined}
                    onToggle={() => {
                      const next = checked
                        ? fieldSelected.filter((i) => i !== choiceIndex)
                        : [...fieldSelected, choiceIndex];
                      onSelectionChange({ ...selectedValues, [field.id]: next });
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <Dialog open={!!infoChoice} onOpenChange={() => setInfoChoice(undefined)}>
        <DialogContent className="max-w-3xl px-0">
          <DialogTitle className="px-4 lg:px-6">
            {infoChoice && localizeMaterialNameCandidate(infoChoice.choice, locale)}
          </DialogTitle>
          <div className="max-h-[80vh] overflow-y-auto px-4 lg:px-6">
            {infoChoice && (
              <div className="mb-6">{getNameIconEntry(infoChoice.choice)?.icon}</div>
            )}
            <MarkdownContent content={infoChoice?.text ?? ""} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
