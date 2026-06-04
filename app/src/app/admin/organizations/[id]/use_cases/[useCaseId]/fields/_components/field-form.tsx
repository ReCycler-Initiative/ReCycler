"use client";

import { useMessages } from "@/i18n/locale-provider";
import { FormFooter, FormShell } from "@/components/editor-template";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const FieldFormSchema = z.object({
  name: z.string().min(1, "Nimi on pakollinen"),
  field_type: z.union([
    z.literal("multi_select"),
    z.literal("text_input"),
    z.literal("address"),
    z.literal("opening_hours"),
  ]),
  required: z.boolean(),
  choices: z.array(z.object({ value: z.string() })),
  choiceColors: z.record(z.string()),
  placeholder: z.string(),
  helpText: z.string(),
});

export type FieldFormValues = z.infer<typeof FieldFormSchema>;

export type FieldFormDefaultValues = {
  name?: string;
  field_type?: "multi_select" | "text_input" | "address" | "opening_hours";
  required?: boolean;
  choices?: string[];
  choiceColors?: Record<string, string>;
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
          ...(Object.keys(values.choiceColors).length
            ? { choiceColors: values.choiceColors }
            : {}),
          ...(values.placeholder ? { placeholder: values.placeholder } : {}),
          ...(values.helpText ? { helpText: values.helpText } : {}),
        }
      : {
          ...(values.placeholder ? { placeholder: values.placeholder } : {}),
          ...(values.helpText ? { helpText: values.helpText } : {}),
        },
});

export const fieldFormDefaultValues: FieldFormValues = {
  name: "",
  field_type: "text_input",
  required: false,
  choices: [],
  choiceColors: {},
  placeholder: "",
  helpText: "",
};

export const useFieldForm = (defaults?: FieldFormDefaultValues) =>
  useForm<FieldFormValues>({
    resolver: zodResolver(FieldFormSchema),
    defaultValues: {
      name: defaults?.name ?? "",
      field_type: defaults?.field_type ?? "text_input",
      required: defaults?.required ?? false,
      choices: (defaults?.choices ?? []).map((v) => ({ value: v })),
      choiceColors: defaults?.choiceColors ?? {},
      placeholder: defaults?.placeholder ?? "",
      helpText: defaults?.helpText ?? "",
    },
  });

const ColorPickerPopover = ({
  currentColor,
  containerRef,
  onColorChange,
  onRemove,
}: {
  currentColor: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onColorChange: (color: string) => void;
  onRemove?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [localColor, setLocalColor] = useState(currentColor || "#000000");

  // Sync local color when popover opens or currentColor changes externally
  useEffect(() => {
    setLocalColor(currentColor || "#000000");
  }, [currentColor, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={currentColor || "Valitse v\u00e4ri"}
          className="w-7 h-7 rounded-full border-2 shrink-0 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
          style={{
            backgroundColor: currentColor || "#e5e7eb",
            borderColor: currentColor || "#d1d5db",
          }}
        />
      </PopoverTrigger>
      <PopoverContent
        className="field-editor-popover w-auto p-3 space-y-3"
        align="start"
        container={containerRef.current}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div onPointerDown={(e) => e.stopPropagation()}>
          <HexColorPicker color={localColor} onChange={setLocalColor} />
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full border shrink-0"
            style={{ backgroundColor: localColor }}
          />
          <span className="text-xs font-mono text-muted-foreground">
            {localColor}
          </span>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground h-7 px-2"
              onClick={() => {
                onRemove();
                setOpen(false);
              }}
            >
              Poista
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            onColorChange(localColor);
            setOpen(false);
          }}
        >
          Valmis
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export const FieldFormFields = ({
  form,
}: {
  form: ReturnType<typeof useFieldForm>;
}) => {
  const messages = useMessages();
  const { register, setValue, getValues, control, formState } = form;

  const fieldType = useWatch({ control, name: "field_type" });
  const required = useWatch({ control, name: "required" });
  const choiceColors = useWatch({ control, name: "choiceColors" }) ?? {};
  const choices = useWatch({ control, name: "choices" }) ?? [];
  const popoverContainerRef = useRef<HTMLDivElement>(null);

  const {
    fields: choiceFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "choices",
  });

  return (
    <>
      <div ref={popoverContainerRef} />
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
            setValue(
              "field_type",
              v as "multi_select" | "text_input" | "address" | "opening_hours",
              { shouldDirty: true }
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="field-editor-select-content">
            <SelectItem value="text_input">Tekstikenttä</SelectItem>
            <SelectItem value="multi_select">Monivalinta</SelectItem>
            <SelectItem value="address">Osoite</SelectItem>
            <SelectItem value="opening_hours">Aukioloajat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Required */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="field-required"
          checked={required}
          onCheckedChange={(v) =>
            setValue("required", !!v, { shouldDirty: true })
          }
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
            {choiceFields.map((field, index) => {
              const choiceValue = choices[index]?.value ?? "";
              const currentColor = choiceColors[choiceValue] ?? "";

              return (
                <div key={field.id} className="flex gap-2 items-center">
                  <Input
                    {...register(`choices.${index}.value`)}
                    placeholder={`Vaihtoehto ${index + 1}`}
                  />
                  <ColorPickerPopover
                    currentColor={currentColor}
                    containerRef={popoverContainerRef}
                    onColorChange={(color) => {
                      if (!choiceValue) return;
                      const current = getValues("choiceColors") ?? {};
                      setValue(
                        "choiceColors",
                        { ...current, [choiceValue]: color },
                        { shouldDirty: true }
                      );
                    }}
                    onRemove={
                      currentColor
                        ? () => {
                            if (!choiceValue) return;
                            const current = getValues("choiceColors") ?? {};
                            const next = { ...current };
                            delete next[choiceValue];
                            setValue("choiceColors", next, {
                              shouldDirty: true,
                            });
                          }
                        : undefined
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      const key = choiceValue;
                      if (key) {
                        const next = { ...choiceColors };
                        delete next[key];
                        setValue("choiceColors", next, { shouldDirty: true });
                      }
                      remove(index);
                    }}
                    aria-label="Poista vaihtoehto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
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
    </>
  );
};

// Convenience wrapper for use inside dialogs (provides its own Form context + footer).
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
}) => (
  <FormShell form={form} onSubmit={onSubmit}>
    <FieldFormFields form={form} />
    <FormFooter
      isSubmitting={isPending}
      isDirty={form.formState.isDirty}
      onCancel={onCancel}
      cancelHref={backHref}
    />
  </FormShell>
);
