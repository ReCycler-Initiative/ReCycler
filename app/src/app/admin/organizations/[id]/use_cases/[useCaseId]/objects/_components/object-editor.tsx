"use client";

import { EditorTemplate, useEditor } from "@/components/editor-template";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  ObjectFormFields,
  ObjectFormValues,
  toApiData,
} from "../_components/field-form";

type ObjectEditorProps = {
  defaultValues: ObjectFormValues;
  mutation: (
    organizationId: string,
    useCaseId: string,
    data: ObjectFormValues
  ) => Promise<void>;
  title: string;
  introDescription: string;
  onSuccess: (organizationId: string, useCaseId: string) => void;
};

export default function ObjectEditor({
  defaultValues,
  mutation,
  title,
  introDescription,
  onSuccess,
}: ObjectEditorProps) {
  const { id: organizationId, useCaseId } = useParams<{
    id: string;
    useCaseId: string;
  }>();
  const queryClient = useQueryClient();

  const editor = useEditor<ObjectFormValues, ObjectFormValues>({
    defaultValues,
    queryKey: [],
    mutationFn: async (formValues) => {
      await mutation(organizationId, useCaseId, toApiData(formValues));
      return formValues;
    },
    toApiData: (v) => v,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["objects", organizationId, useCaseId],
      });
      onSuccess(organizationId, useCaseId);
    },
  });

  return (
    <EditorTemplate
      {...editor}
      title={title}
      introDescription={introDescription}
    >
      <ObjectFormFields form={editor.form} />
    </EditorTemplate>
  );
}
