"use client";

import { getFields } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { CustomCheckbox, nameIconMap } from "@/components/materials";
import LoadingSpinner from "@/components/loading-spinner";

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
        <p>Haetaan vaihtoehtoja...</p>
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
                const iconEntry = nameIconMap[choice.toLowerCase()];
                const checked = fieldSelected.includes(choiceIndex);
                return (
                  <CustomCheckbox
                    key={choice}
                    baseHex={iconEntry?.baseHex}
                    checked={checked}
                    label={choice}
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
