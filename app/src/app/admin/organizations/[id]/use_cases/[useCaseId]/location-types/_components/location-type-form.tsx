"use client";

import { FormFooter, FormShell } from "@/components/editor-template";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMessages } from "@/i18n/locale-provider";
import { LocationType, LocationTypeRecord } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const LocationTypeFormSchema = z.union([LocationType, LocationTypeRecord]);

export type LocationTypeFormValues = z.infer<typeof LocationTypeFormSchema>;

const LocationTypeFormDefaultValuesSchema = LocationType;

export type LocationTypeFormDefaultValues = z.infer<
  typeof LocationTypeFormDefaultValuesSchema
>;

export const toApiData = (values: LocationTypeFormValues) => {
  const fields = values.fields.map((field) => {
    const baseField = {
      name: field.name,
      field_type: field.field_type,
      order: field.order,
      ...(field.options && { options: field.options }),
      ...(field.required !== undefined && { required: field.required }),
    };

    if ("id" in field && field.id) {
      return {
        id: field.id,
        use_case_id: field.use_case_id,
        ...baseField,
      };
    }

    return baseField;
  });

  if ("id" in values && values.id) {
    return {
      id: values.id,
      name: values.name,
      use_case_id: values.use_case_id,
      fields,
    };
  }

  return {
    name: values.name,
    fields,
  };
};

export const locationTypeFormDefaultValues: LocationTypeFormValues = {
  name: "",
  fields: [],
};

export const useLocationTypeForm = (defaults?: LocationTypeFormDefaultValues) =>
  useForm<LocationTypeFormValues>({
    resolver: zodResolver(LocationTypeFormSchema),
    defaultValues: {
      name: defaults?.name ?? "",
    },
  });

export const LocationTypeFormFields = ({
  form,
}: {
  form: ReturnType<typeof useLocationTypeForm>;
}) => {
  const messages = useMessages();
  const { register, setValue, getValues, control, formState } = form;

  return (
    <>
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="field-name">{messages.adminLocationTypesPage.nameLabel}</Label>
        <Input
          id="field-name"
          {...register("name")}
          placeholder={messages.adminLocationTypesPage.namePlaceholder}
          autoFocus
        />
        {formState.errors.name && (
          <p className="text-xs text-destructive">
            {formState.errors.name.message}
          </p>
        )}
      </div>
    </>
  );
};

// Convenience wrapper for use inside dialogs (provides its own Form context + footer).
export const LocationTypeFormContent = ({
  form,
  backHref,
  onCancel,
  isPending,
  onSubmit,
}: {
  form: ReturnType<typeof useLocationTypeForm>;
  backHref?: string;
  onCancel?: () => void;
  isPending: boolean;
  onSubmit: (values: LocationTypeFormValues) => void;
}) => (
  <FormShell form={form} onSubmit={onSubmit}>
    <LocationTypeFormFields form={form} />
    <FormFooter
      isSubmitting={isPending}
      isDirty={form.formState.isDirty}
      onCancel={onCancel}
      cancelHref={backHref}
    />
  </FormShell>
);
