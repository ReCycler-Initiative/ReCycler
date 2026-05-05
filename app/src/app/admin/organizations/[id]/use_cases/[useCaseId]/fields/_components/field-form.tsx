"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const FieldFormSchema = z.object({
  name: z.string().min(1, "Nimi on pakollinen"),
  field_type: z.union([z.literal("multi_select"), z.literal("text_input")]),
  required: z.boolean(),
  choices: z.array(z.object({ value: z.string() })),
  placeholder: z.string(),
  helpText: z.string(),
});

export type FieldFormValues = z.infer<typeof FieldFormSchema>;

export type FieldFormDefaultValues = {
  name?: string;
  field_type?: "multi_select" | "text_input";
  required?: boolean;
  choices?: string[];
  placeholder?: string;
  helpText?: string;
};

export const toApiData = (values: FieldFormValues) => ({
  name: values.name,
  field_type: values.field_type,
  required: values.required,
  options:
    values.field_type === "multi_select"
      ? {
          choices: values.choices.map((c) => c.value).filter(Boolean),
          ...(values.placeholder ? { placeholder: values.placeholder } : {}),
          ...(values.helpText ? { helpText: values.helpText } : {}),
        }
      : {
          ...(values.placeholder ? { placeholder: values.placeholder } : {}),
          ...(values.helpText ? { helpText: values.helpText } : {}),
        },
});

export const useFieldForm = (defaults?: FieldFormDefaultValues) =>
  useForm<FieldFormValues>({
    resolver: zodResolver(FieldFormSchema),
    defaultValues: {
      name: defaults?.name ?? "",
      field_type: defaults?.field_type ?? "text_input",
      required: defaults?.required ?? false,
      choices: (defaults?.choices ?? []).map((v) => ({ value: v })),
      placeholder: defaults?.placeholder ?? "",
      helpText: defaults?.helpText ?? "",
    },
  });

export const FieldFormContent = ({
  form,
  backHref,
  onCancel,
  isPending,
  onSubmit,
}: {
  form: ReturnType<typeof useFieldForm>;
  backHref?: string;
  onCancel?: () => void;
  isPending: boolean;
  onSubmit: (values: FieldFormValues) => void;
}) => {
  const { register, watch, setValue, control, handleSubmit, formState } = form;
  const fieldType = watch("field_type");
  const required = watch("required");

  const { fields: choiceFields, append, remove } = useFieldArray({
    control,
    name: "choices",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
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

      {/* Type */}
      <div className="space-y-1.5">
        <Label>Tyyppi</Label>
        <Select
          value={fieldType}
          onValueChange={(v) =>
            setValue("field_type", v as "multi_select" | "text_input")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text_input">Tekstikenttä</SelectItem>
            <SelectItem value="multi_select">Monivalinta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Required */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="field-required"
          checked={required}
          onCheckedChange={(v) => setValue("required", !!v)}
        />
        <Label htmlFor="field-required" className="cursor-pointer">
          Pakollinen kenttä
        </Label>
      </div>

      {/* Choices — only for multi_select */}
      {fieldType === "multi_select" && (
        <div className="space-y-2">
          <Label>Vaihtoehdot</Label>
          <div className="space-y-2">
            {choiceFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...register(`choices.${index}.value`)}
                  placeholder={`Vaihtoehto ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                  aria-label="Poista vaihtoehto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ value: "" })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Lisää vaihtoehto
          </Button>
        </div>
      )}

      {/* Placeholder */}
      <div className="space-y-1.5">
        <Label htmlFor="field-placeholder">Placeholder-teksti</Label>
        <Input
          id="field-placeholder"
          {...register("placeholder")}
          placeholder="esim. Kirjoita lisätietoja..."
        />
      </div>

      {/* Help text */}
      <div className="space-y-1.5">
        <Label htmlFor="field-helptext">Ohjeteksti</Label>
        <Input
          id="field-helptext"
          {...register("helpText")}
          placeholder="esim. Näkyy käyttäjälle kenttää täyttäessä"
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel ? (
          <Button variant="outline" type="button" onClick={onCancel}>
            Peruuta
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={backHref!}>Peruuta</Link>
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Tallennetaan..." : "Tallenna"}
        </Button>
      </div>
    </form>
  );
};
