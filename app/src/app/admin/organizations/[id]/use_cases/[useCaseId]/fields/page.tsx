"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { UseCasePageIntro } from "@/components/admin/use-case-page-intro";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createField,
  deleteField,
  getFields,
  reorderFields,
  updateField,
} from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useMessages } from "@/i18n/locale-provider";
import {
  FieldFormContent,
  FieldFormValues,
  fieldFormDefaultValues,
  toApiData,
  useFieldForm,
} from "./_components/field-form";
import { z } from "zod";
import { FieldRecord } from "@/types";

const FIELD_TYPE_LABELS: Record<string, string> = {
  multi_select: "Monivalinta",
  text_input: "Tekstikenttä",
  address: "Osoite",
  opening_hours: "Aukioloajat",
};

type FieldItem = z.infer<typeof FieldRecord>;

export default function FieldsPage() {
  const messages = useMessages();
  const { id: organizationId, useCaseId } = useParams<{
    id: string;
    useCaseId: string;
  }>();
  const queryClient = useQueryClient();
  const queryKey = ["fields", organizationId, useCaseId];

  const { data: fields = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => getFields(organizationId, useCaseId),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldItem | null>(null);
  const form = useFieldForm();

  const openNew = () => {
    form.reset(fieldFormDefaultValues);
    setEditingField(null);
    setDialogOpen(true);
  };

  const openEdit = (field: FieldItem) => {
    form.reset({
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

  const createMutation = useMutation({
    mutationFn: (values: FieldFormValues) =>
      createField(organizationId, useCaseId, toApiData(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Kenttä luotu");
      setDialogOpen(false);
    },
    onError: () => toast.error("Luonti epäonnistui"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      fieldId,
      values,
    }: {
      fieldId: string;
      values: FieldFormValues;
    }) => updateField(organizationId, useCaseId, fieldId, toApiData(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Kenttä tallennettu");
      setDialogOpen(false);
    },
    onError: () => toast.error("Tallennus epäonnistui"),
  });

  const handleSubmit = (values: FieldFormValues) => {
    if (editingField) {
      updateMutation.mutate({ fieldId: editingField.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const deleteMutation = useMutation({
    mutationFn: (fieldId: string) =>
      deleteField(organizationId, useCaseId, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Kenttä poistettu");
    },
    onError: () => toast.error("Poisto epäonnistui"),
  });

  const reorderMutation = useMutation({
    mutationFn: (order: { id: string; order: number }[]) =>
      reorderFields(organizationId, useCaseId, order),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: () => toast.error("Järjestyksen tallennus epäonnistui"),
  });

  const handleMove = (index: number, direction: "up" | "down") => {
    const reordered = [...fields];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [reordered[index], reordered[swapIndex]] = [
      reordered[swapIndex],
      reordered[index],
    ];
    reorderMutation.mutate(
      reordered.map((f, i) => ({ id: f.id, order: i + 1 }))
    );
  };

  return (
    <>
      <PageTemplate>
        <UseCasePageIntro
          title={messages.admin.fields}
          description={messages.admin.useCaseHomeHighlights[2]}
          actions={
            <Button onClick={openNew}>
              <Plus className="h-4 w-4 mr-2" />
              Lisää kenttä
            </Button>
          }
        />
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Ladataan...</p>
        ) : fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ei kenttiä. Lisää ensimmäinen kenttä.
          </p>
        ) : (
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
                {fields.map((field, index) => (
                  <tr key={field.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0 || reorderMutation.isPending}
                          onClick={() => handleMove(index, "up")}
                          className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Siirrä ylöspäin"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={
                            index === fields.length - 1 ||
                            reorderMutation.isPending
                          }
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
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (
                              confirm(
                                `Poistetaanko kenttä "${field.name}"?\n\nTämä poistaa myös kaikki kohteiden arvot tältä kentältä.`
                              )
                            ) {
                              deleteMutation.mutate(field.id);
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
        )}
      </PageTemplate>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingField ? "Muokkaa kenttää" : "Uusi kenttä"}
            </DialogTitle>
          </DialogHeader>
          <FieldFormContent
            form={form}
            onCancel={() => setDialogOpen(false)}
            isPending={isPending}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
