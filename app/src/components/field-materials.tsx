"use client";

import { getFields, getLocationTypes } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { CustomCheckbox, getNameIconEntry } from "@/components/materials";
import LoadingSpinner from "@/components/loading-spinner";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { localizeMaterialNameCandidate } from "@/lib/material-translations";
import { ChoiceInfo, ChoiceInfoDialog } from "@/components/choice-info-dialog";
import { useState } from "react";
import { LocationTypeChips } from "@/components/location-type-chips";
import { FieldRecord } from "@/types";
import { z } from "zod";

export type FieldSelections = Record<string, number[]>;

type FieldRecordType = z.infer<typeof FieldRecord>;

// Empty type selection means all types are shown
export const isTypeSelected = (selectedTypeIds: string[], typeId: string) =>
  selectedTypeIds.length === 0 || selectedTypeIds.includes(typeId);

export const FieldMaterials = ({
  organizationId,
  useCaseId,
  selectedValues,
  onSelectionChange,
  selectedTypeIds = [],
  onTypeSelectionChange,
}: {
  organizationId: string;
  useCaseId: string;
  selectedValues: FieldSelections;
  onSelectionChange: (values: FieldSelections) => void;
  selectedTypeIds?: string[];
  onTypeSelectionChange?: (typeIds: string[]) => void;
}) => {
  const { locale } = useLocale();
  const messages = useMessages();
  const [infoChoice, setInfoChoice] = useState<ChoiceInfo>();
  const { data: fields, isFetching } = useQuery({
    queryKey: ["fields", organizationId, useCaseId],
    queryFn: () => getFields(organizationId, useCaseId),
    staleTime: Infinity,
  });
  const { data: locationTypes = [], isFetching: isFetchingTypes } = useQuery({
    queryKey: ["locationTypes", organizationId, useCaseId],
    queryFn: () => getLocationTypes(organizationId, useCaseId),
    staleTime: Infinity,
  });

  const multiSelectFields = fields?.filter((f) => f.field_type === "multi_select") ?? [];
  const showTypes = locationTypes.length > 1 && !!onTypeSelectionChange;

  const toggleType = (typeId: string) => {
    if (!onTypeSelectionChange) return;
    const allIds = locationTypes.map((type) => type.id);
    const current = selectedTypeIds.length === 0 ? allIds : selectedTypeIds;
    const deselecting = current.includes(typeId);
    const next = deselecting ? current.filter((id) => id !== typeId) : [...current, typeId];
    if (next.length === 0) return; // At least one type must stay visible
    onTypeSelectionChange(next.length === allIds.length ? [] : next);

    if (deselecting) {
      // Selections of a hidden type would otherwise keep filtering invisibly
      const hiddenFieldIds = multiSelectFields
        .filter((field) => field.object_id === typeId)
        .map((field) => field.id);
      if (hiddenFieldIds.some((id) => selectedValues[id]?.length)) {
        onSelectionChange(
          Object.fromEntries(
            Object.entries(selectedValues).filter(([id]) => !hiddenFieldIds.includes(id))
          )
        );
      }
    }
  };

  if (isFetching || isFetchingTypes) {
    return (
      <div className="flex items-center flex-col gap-4 py-6">
        <LoadingSpinner />
        <p>{messages.materials.loadingMaterials}</p>
      </div>
    );
  }

  if (multiSelectFields.length === 0 && !showTypes) return null;

  const renderField = (field: FieldRecordType) => {
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
  };

  // Group fields under their location type; fields without a type are shown first
  const untypedFields = multiSelectFields.filter(
    (field) => !field.object_id || !locationTypes.some((type) => type.id === field.object_id)
  );
  const typeGroups = locationTypes
    .filter((type) => isTypeSelected(selectedTypeIds, type.id))
    .map((type) => ({
      type,
      fields: multiSelectFields.filter((field) => field.object_id === type.id),
    }))
    .filter((group) => group.fields.length > 0);

  return (
    <div className="space-y-6">
      {showTypes && (
        <div>
          <h3 className="text-sm font-medium mb-3">{messages.materials.locationTypes}</h3>
          <LocationTypeChips
            types={locationTypes}
            isActive={(typeId) => isTypeSelected(selectedTypeIds, typeId)}
            onToggle={toggleType}
          />
        </div>
      )}
      {untypedFields.map(renderField)}
      {typeGroups.map(({ type, fields: groupFields }) =>
        showTypes ? (
          <section key={type.id} className="space-y-4">
            <h2 className="text-base font-semibold border-b border-gray-200 pb-1">{type.name}</h2>
            {groupFields.map(renderField)}
          </section>
        ) : (
          groupFields.map(renderField)
        )
      )}
      <ChoiceInfoDialog info={infoChoice} onClose={() => setInfoChoice(undefined)} />
    </div>
  );
};
