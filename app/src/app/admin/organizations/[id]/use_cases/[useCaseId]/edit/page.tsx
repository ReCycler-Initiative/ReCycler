"use client";

import { EditorTemplate, useEditor } from "@/components/editor-template";
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
        <div>
          <h3 className="text-lg font-semibold mb-4">Yleiset tiedot</h3>
          <div className="space-y-3">
            <FormInput label="Name" name="name" />
            <FormTextArea label="Description" name="description" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Etusivu</h3>
          <div className="space-y-3">
            <FormInput label="Otsikko" name="content.intro.title" />
            <FormInput label="CTA" name="content.intro.cta" />
            <FormInput label="Ohita teksti" name="content.intro.skip" />
            <FormTextArea label="Leipäteksti" name="content.intro.text" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Filterit</h3>
          <div className="space-y-3">
            <FormInput label="Otsikko" name="content.filters.title" />
            <FormInput label="CTA" name="content.filters.cta" />
            <FormTextArea label="Leipäteksti" name="content.filters.text" />
          </div>
        </div>
      </div>
    </EditorTemplate>
  );
};

export default UseCaseInfoPage;
