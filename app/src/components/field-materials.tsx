"use client";

import { getFields } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { CustomCheckbox, getNameIconEntry } from "@/components/materials";
import LoadingSpinner from "@/components/loading-spinner";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { localizeMaterialNameCandidate } from "@/lib/material-translations";

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
                return (
                  <CustomCheckbox
                    key={choice}
                    baseHex={color}
                    checked={checked}
                    label={localizeMaterialNameCandidate(choice, locale)}
                    icon={iconEntry?.icon}
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
    </div>
  );
};
