"use client";

import { FormFooter, FormShell } from "@/components/editor-template";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ObjectFormSchema = z.object({
  name: z.string().min(1, "Nimi on pakollinen"),
});

export type ObjectFormValues = z.infer<typeof ObjectFormSchema>;

export type ObjectFormDefaultValues = {
  name?: string;
};

export const toApiData = (values: ObjectFormValues) => ({
  name: values.name,
});

export const objectFormDefaultValues: ObjectFormValues = {
  name: "",
};

export const useObjectForm = (defaults?: ObjectFormDefaultValues) =>
  useForm<ObjectFormValues>({
    resolver: zodResolver(ObjectFormSchema),
    defaultValues: {
      name: defaults?.name ?? "",
    },
  });

export const ObjectFormFields = ({
  form,
}: {
  form: ReturnType<typeof useObjectForm>;
}) => {
  const { register, setValue, getValues, control, formState } = form;

  return (
    <>
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="field-name">Nimi</Label>
        <Input
          id="field-name"
          {...register("name")}
          placeholder="esim. Materiaalit"
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
export const ObjectFormContent = ({
  form,
  backHref,
  onCancel,
  isPending,
  onSubmit,
}: {
  form: ReturnType<typeof useObjectForm>;
  backHref?: string;
  onCancel?: () => void;
  isPending: boolean;
  onSubmit: (values: ObjectFormValues) => void;
}) => (
  <FormShell form={form} onSubmit={onSubmit}>
    <ObjectFormFields form={form} />
    <FormFooter
      isSubmitting={isPending}
      isDirty={form.formState.isDirty}
      onCancel={onCancel}
      cancelHref={backHref}
    />
  </FormShell>
);
