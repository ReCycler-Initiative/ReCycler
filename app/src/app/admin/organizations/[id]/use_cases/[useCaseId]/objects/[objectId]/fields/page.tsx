"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { FieldRecord } from "@/types";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";
import { ObjectFormValues } from "../../_components/object-form";
import {
  FieldFormContent,
  fieldFormDefaultValues,
  useFieldForm,
} from "../../_components/field-form";
import { DialogTitle } from "@radix-ui/react-dialog";

const FIELD_TYPE_LABELS: Record<string, string> = {
  multi_select: "Monivalinta",
  text_input: "Tekstikenttä",
  address: "Osoite",
  opening_hours: "Aukioloajat",
};

type FieldItem = z.infer<typeof FieldRecord>;

export default function FieldsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldItem | null>(null);
  const form = useFormContext<ObjectFormValues>();
  const fieldsArray = useFieldArray({
    name: "fields",
    control: form.control,
  });

  const fieldForm = useFieldForm();

  const openNew = () => {
    fieldForm.reset(fieldFormDefaultValues);
    setEditingField(null);
    setDialogOpen(true);
  };

  const openEdit = (field: FieldItem) => {
    fieldForm.reset({
      name: field.name,
      field_type: field.field_type,
      required: field.required ?? false,
      choices: (field.options?.choices ?? []).map((v) => ({ value: v })),
      choiceColors: field.options?.choiceColors ?? {},
      placeholder: field.options?.placeholder ?? "",
      helpText: field.options?.helpText ?? "",
    });
    setEditingField(field);
    setDialogOpen(true);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fieldsArray.fields.length) return;

    const updatedFields = [...fieldsArray.fields];
    const [movedField] = updatedFields.splice(index, 1);
    updatedFields.splice(newIndex, 0, movedField);

    fieldsArray.update(index, updatedFields[index]);
    fieldsArray.update(newIndex, updatedFields[newIndex]);
  };

  return (
    <>
      {fieldsArray.fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ei kenttiä. Lisää ensimmäinen kenttä.
        </p>
      ) : (
        <div className="flex flex-col gap-y-4">
          <Button className="self-end" onClick={openNew}>
            <Plus className="h-4 w-4 mr-2" /> Lisää kenttä
          </Button>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-20">
                    Järjestys
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Nimi
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Tyyppi
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-24">
                    Pakollinen
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground w-24">
                    Toiminnot
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fieldsArray.fields.map((field, index) => (
                  <tr key={field.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, "up")}
                          className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Siirrä ylöspäin"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === fieldsArray.fields.length - 1}
                          onClick={() => handleMove(index, "down")}
                          className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Siirrä alaspäin"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{field.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {FIELD_TYPE_LABELS[field.field_type] ?? field.field_type}
                      {field.field_type === "multi_select" &&
                        field.options?.choices && (
                          <span className="ml-1 text-xs">
                            ({field.options.choices.length} vaihtoehtoa)
                          </span>
                        )}
                    </td>
                    <td className="px-4 py-3">
                      {field.required ? (
                        <span className="field-required-yes text-xs font-medium text-primary">
                          Kyllä
                        </span>
                      ) : (
                        <span className="field-required-no text-xs text-muted-foreground">
                          Ei
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(field)}
                          aria-label="Muokkaa kenttää"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (
                              confirm(
                                `Poistetaanko kenttä "${field.name}"?\n\nTämä poistaa myös kaikki kohteiden arvot tältä kentältä.`
                              )
                            ) {
                              fieldsArray.remove(index);
                            }
                          }}
                          aria-label="Poista kenttä"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="field-editor-dialog sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingField ? "Muokkaa kenttää" : "Uusi kenttä"}
            </DialogTitle>
          </DialogHeader>
          <FieldFormContent
            form={fieldForm}
            onCancel={() => setDialogOpen(false)}
            onSubmit={(values) => {
              fieldsArray.update(
                editingField
                  ? fieldsArray.fields.findIndex(
                      (f) => f.id === editingField.id
                    )
                  : fieldsArray.fields.length,
                values as any
              );
              setDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
