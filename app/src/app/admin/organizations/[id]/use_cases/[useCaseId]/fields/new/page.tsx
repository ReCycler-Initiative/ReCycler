"use client";

import { EditorTemplate, useEditor } from "@/components/editor-template";
import { createField } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  FieldFormFields,
  FieldFormValues,
  fieldFormDefaultValues,
  toApiData,
} from "../_components/field-form";

export default function NewFieldPage() {
  const { id: organizationId, useCaseId } = useParams<{
    id: string;
    useCaseId: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const editor = useEditor<FieldFormValues, FieldFormValues>({
    defaultValues: fieldFormDefaultValues,
    queryKey: [],
    mutationFn: async (formValues) => {
      await createField(organizationId, useCaseId, toApiData(formValues));
      return formValues;
    },
    toApiData: (v) => v,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fields", organizationId, useCaseId],
      });
      router.push(
        `/admin/organizations/${organizationId}/use_cases/${useCaseId}/fields`
      );
    },
  });

  return (
    <EditorTemplate {...editor} title="Uusi kenttä">
      <FieldFormFields form={editor.form} />
    </EditorTemplate>
  );
}
