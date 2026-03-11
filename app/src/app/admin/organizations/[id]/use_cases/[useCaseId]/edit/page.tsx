"use client";

import { EditorTemplate, useEditor } from "@/components/editor-template";
import FormInput from "@/components/form/form-input";
import { FormTextArea } from "@/components/form/form-textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <Tabs defaultValue="info" className="my-2 max-w-xl">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="info" className="flex-1">
            Käyttötapauksen tiedot
          </TabsTrigger>
          <TabsTrigger value="sisaltosivut" className="flex-1">
            Sisältösivut
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="space-y-3">
            <FormInput label="Name" name="name" />
            <FormTextArea label="Description" name="description" />
          </div>
        </TabsContent>

        <TabsContent value="sisaltosivut">
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold mb-4">Etusivu</h3>
              <div className="space-y-3">
                <FormInput label="Otsikko" name="content.intro.title" />
                <FormTextArea label="Leipäteksti" name="content.intro.text" />
                <FormInput label="CTA" name="content.intro.cta" />
                <FormInput label="Ohita teksti" name="content.intro.skip" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Filterit</h3>
              <div className="space-y-3">
                <FormInput label="Otsikko" name="content.filters.title" />
                <FormTextArea label="Leipäteksti" name="content.filters.text" />
                <FormInput
                  label="AI-välilehti teksti"
                  name="content.filters.tab_ai"
                />
                <FormInput
                  label="Manuaali-välilehti teksti"
                  name="content.filters.tab_manual"
                />
                <FormInput label="CTA" name="content.filters.cta" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </EditorTemplate>
  );
};

export default UseCaseInfoPage;
