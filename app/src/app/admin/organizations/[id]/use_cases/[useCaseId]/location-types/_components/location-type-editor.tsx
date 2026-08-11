"use client";

import { EditorTemplate, useEditor } from "@/components/editor-template";
import { LocationTypeRecord } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import z from "zod";
import { LocationTypeFormValues, toApiData } from "./location-type-form";

type LocationTypeEditorProps = {
  children?: React.ReactNode;
  defaultValues: LocationTypeFormValues;
  mutation: (
    organizationId: string,
    useCaseId: string,
    data: LocationTypeFormValues
  ) => Promise<z.infer<typeof LocationTypeRecord>>;
  onSuccess?: (organizationId: string, useCaseId: string) => void;
};

export default function LocationTypeEditor({
  children,
  defaultValues,
  mutation,
  onSuccess,
}: LocationTypeEditorProps) {
  const { id: organizationId, useCaseId } = useParams<{
    id: string;
    useCaseId: string;
  }>();
  const queryClient = useQueryClient();

  const editor = useEditor<LocationTypeFormValues, LocationTypeFormValues>({
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
        queryKey: ["locationTypes", organizationId, useCaseId],
      });
      onSuccess?.(organizationId, useCaseId);
    },
  });

  return <EditorTemplate {...editor}>{children}</EditorTemplate>;
}
