"use client";

import { EditorTemplate, useEditor } from "@/components/editor";
import FormInput from "@/components/form/form-input";
import { FormTextArea } from "@/components/form/form-textarea";
import { getUseCaseById, updateUseCase } from "@/services/api";
import { UseCase } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { z } from "zod";

const UseCaseInfoPage = () => {
  const queryClient = useQueryClient();
  const { id, useCaseId } = useParams<{ id: string; useCaseId: string }>();

  const editor = useEditor<z.infer<typeof UseCase>, z.infer<typeof UseCase>>({
    defaultValues: {
      id: "",
      name: "",
      description: "",
    },
    queryKey: ["use_case", id, useCaseId],
    queryFn: () => getUseCaseById(id, useCaseId),
    mutationFn: (data) => updateUseCase(id, data),
    toFormState: UseCase.parse,
    toApiData: UseCase.parse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["use_cases", id] });
    },
  });

  return (
    <EditorTemplate {...editor} title="Käyttötapauksen tiedot">
      <div className="my-2 max-w-xl space-y-4">
        <FormInput label="Name" name="name" />
        <FormTextArea label="Description" name="description" />
      </div>
    </EditorTemplate>
  );
};

export default UseCaseInfoPage;
