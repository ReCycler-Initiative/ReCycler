"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { getField, updateField } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  FieldFormContent,
  FieldFormValues,
  toApiData,
  useFieldForm,
} from "../_components/field-form";

export default function EditFieldPage() {
  const { id: organizationId, useCaseId, fieldId } = useParams<{
    id: string;
    useCaseId: string;
    fieldId: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const backHref = `/admin/organizations/${organizationId}/use_cases/${useCaseId}/fields`;

  const { data: field, isLoading, isError } = useQuery({
    queryKey: ["field", organizationId, useCaseId, fieldId],
    queryFn: () => getField(organizationId, useCaseId, fieldId),
  });

  const form = useFieldForm();

  // Populate form once field data is available
  useEffect(() => {
    if (!field) return;
    form.reset({
      name: field.name,
      field_type: field.field_type,
      required: field.required ?? false,
      choices: (field.options?.choices ?? []).map((v) => ({ value: v })),
      placeholder: field.options?.placeholder ?? "",
      helpText: field.options?.helpText ?? "",
    });
  }, [field]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: (values: FieldFormValues) =>
      updateField(organizationId, useCaseId, fieldId, toApiData(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fields", organizationId, useCaseId],
      });
      toast.success("Kenttä tallennettu");
      router.push(backHref);
    },
    onError: () => toast.error("Tallennus epäonnistui"),
  });

  if (isLoading) {
    return (
      <PageTemplate title="Muokkaa kenttää">
        <p className="text-sm text-muted-foreground">Ladataan...</p>
      </PageTemplate>
    );
  }

  if (isError || !field) {
    return (
      <PageTemplate title="Muokkaa kenttää">
        <p className="text-sm text-destructive">Kenttää ei löydy.</p>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title={`Muokkaa: ${field.name}`}>
      <FieldFormContent
        form={form}
        backHref={backHref}
        isPending={mutation.isPending}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </PageTemplate>
  );
}
