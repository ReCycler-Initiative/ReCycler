"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useMessages } from "@/i18n/locale-provider";
import { Field, FieldRecord } from "@/types";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";
import {
  FieldFormContent,
  fieldFormDefaultValues,
  useFieldForm,
} from "../../_components/field-form";
import { ObjectFormValues } from "../../_components/object-form";

const FieldSchema = z.union([Field, FieldRecord]);

type FieldItem = z.infer<typeof FieldSchema>;

export default function FieldsPage() {
  const messages = useMessages();
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
      choiceColors: field.options?.choiceColors ?? {},
      choices: (field.options?.choices ?? []).map((v) => ({ value: v })),
      field_type: field.field_type,
      helpText: field.options?.helpText ?? "",
      id: "id" in field ? field.id : null,
      name: field.name,
      order: field.order,
      placeholder: field.options?.placeholder ?? "",
      required: field.required ?? false,
      use_case_id: "use_case_id" in field ? field.use_case_id : null,
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
    <div className="flex flex-col gap-y-4">
      <Button className="self-end" onClick={openNew}>
        <Plus className="h-4 w-4 mr-2" /> {messages.adminFieldsPage.addField}
      </Button>
      {fieldsArray.fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {messages.adminFieldsPage.noFields}
        </p>
      ) : (
        <div className="flex flex-col gap-y-4">
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-20">
                    {messages.adminFieldsPage.orderColumn}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {messages.adminFieldsPage.nameColumn}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {messages.adminFieldsPage.typeColumn}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-24">
                    {messages.adminFieldsPage.requiredColumn}
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground w-24">
                    {messages.adminFieldsPage.actionsColumn}
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
                          aria-label={messages.adminFieldsPage.moveUpAria}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === fieldsArray.fields.length - 1}
                          onClick={() => handleMove(index, "down")}
                          className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label={messages.adminFieldsPage.moveDownAria}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{field.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {messages.adminFieldsPage.fieldTypeLabels[
                        field.field_type
                      ] ?? field.field_type}
                      {field.field_type === "multi_select" &&
                        field.options?.choices && (
                          <span className="ml-1 text-xs">
                            ({field.options.choices.length}{" "}
                            {messages.adminFieldsPage.optionsCount})
                          </span>
                        )}
                    </td>
                    <td className="px-4 py-3">
                      {field.required ? (
                        <span className="field-required-yes text-xs font-medium text-primary">
                          {messages.adminFieldsPage.requiredYes}
                        </span>
                      ) : (
                        <span className="field-required-no text-xs text-muted-foreground">
                          {messages.adminFieldsPage.requiredNo}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(field)}
                          aria-label={messages.adminFieldsPage.editFieldAria}
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
                                messages.adminFieldsPage.deleteConfirm.replace(
                                  "{name}",
                                  field.name
                                )
                              )
                            ) {
                              fieldsArray.remove(index);
                            }
                          }}
                          aria-label={messages.adminFieldsPage.deleteFieldAria}
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
              {editingField
                ? messages.adminFieldsPage.editTitle
                : messages.adminFieldsPage.newTitle}
            </DialogTitle>
          </DialogHeader>
          <FieldFormContent
            form={fieldForm}
            onCancel={() => setDialogOpen(false)}
            onSubmit={(values) => {
              const existing = editingField
                ? fieldsArray.fields.findIndex(
                    (f) => "id" in editingField && f.id === editingField.id
                  )
                : -1;
              if (existing !== -1) {
                if ("order" in values) {
                  fieldsArray.update(existing, values);
                }
              } else {
                fieldsArray.append({
                  ...values,
                  order: fieldsArray.fields.length,
                });
              }
              setDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
