"use client";

import { EditorTemplate, useEditor } from "@/components/editor-template";
import { createObject } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ObjectFormFields,
  ObjectFormValues,
  objectFormDefaultValues,
  toApiData,
} from "../_components/field-form";

export default function NewFieldPage() {
  const { id: organizationId, useCaseId } = useParams<{
    id: string;
    useCaseId: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const editor = useEditor<ObjectFormValues, ObjectFormValues>({
    defaultValues: objectFormDefaultValues,
    queryKey: [],
    mutationFn: async (formValues) => {
      await createObject(organizationId, useCaseId, toApiData(formValues));
      return formValues;
    },
    toApiData: (v) => v,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["objects", organizationId, useCaseId],
      });
      router.push(
        `/admin/organizations/${organizationId}/use_cases/${useCaseId}/objects`
      );
    },
  });

  return (
    <EditorTemplate
      {...editor}
      title="Uusi sisältömalli"
      introDescription="Luo uusi sisältömalli"
    >
      <ObjectFormFields form={editor.form} />
    </EditorTemplate>
  );
}
