"use client";

import { EditorTemplate, useEditor } from "@/components/editor-template";
import { ObjectRecord } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import z from "zod";
import { ObjectFormValues, toApiData } from "./object-form";

type ObjectEditorProps = {
  children?: React.ReactNode;
  defaultValues: ObjectFormValues;
  mutation: (
    organizationId: string,
    useCaseId: string,
    data: ObjectFormValues
  ) => Promise<z.infer<typeof ObjectRecord>>;
  onSuccess?: (organizationId: string, useCaseId: string) => void;
};

export default function ObjectEditor({
  children,
  defaultValues,
  mutation,
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
      const data = await mutation(
        organizationId,
        useCaseId,
        toApiData(formValues)
      );
      editor.form.reset({ name: data.name });
      return formValues;
    },
    toApiData: (v) => v,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["objects", organizationId, useCaseId],
      });
      onSuccess?.(organizationId, useCaseId);
    },
  });

  return <EditorTemplate {...editor}>{children}</EditorTemplate>;
}
