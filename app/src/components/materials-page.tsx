"use client";

import Container from "@/components/container";
import { AiMaterialPrompt } from "@/components/ai-material-prompt";
import { Materials } from "@/components/materials";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";

export const MaterialsPageContent = ({
  organizationId,
  useCaseId,
  title = "Mitäs tänään kierrätetään?",
  description,
  ctaText = "Näytä kierrätyspisteet",
  tabAiText = "Chat",
  tabManualText = "Valitse itse",
}: {
  organizationId?: string;
  useCaseId?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  tabAiText?: string;
  tabManualText?: string;
}) => {
  const form = useForm();
  const materialValues = useWatch({
    control: form.control,
    name: "materials",
    defaultValue: {},
  });
  const materials: [string, boolean][] = Object.entries(materialValues);
  const selectedMaterials = materials.filter(([, value]) => value);

  return (
    <Container className="max-w-2xl pt-7 lg:pt-14">
      <h1 className="text-xl font-medium mb-4 font-sans">
        {title}
      </h1>
      {description && (
        <p className="mb-4 font-sans">{description}</p>
      )}
      <Tabs defaultValue="ai">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="ai" className="flex-1">
            {tabAiText}
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex-1">
            {tabManualText}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <AiMaterialPrompt
            organizationId={organizationId}
            useCaseId={useCaseId}
            ctaText={ctaText}
            resultsBasePath={
              organizationId && useCaseId
                ? `/organizations/${organizationId}/use_cases/${useCaseId}/results`
                : undefined
            }
          />
        </TabsContent>

        <TabsContent value="manual">
          <Form {...form}>
            <div className="mb-28 lg:mb-6">
              <Materials />
            </div>
            <div className="fixed lg:static bottom-0 bg-white lg:bg-transparent border lg:border-none p-4 lg:p-0 left-0 right-0 border-gray-400 flex flex-col items-center gap-y-4">
              Valitut ({selectedMaterials.length})
              <Button asChild className="w-full max-w-96 lg:mb-6" size="lg">
                <Link
                  href={`/recycler/results?materials=${encodeURIComponent(
                    selectedMaterials.map(([key]) => key).join(",")
                  )}`}
                >
                  {ctaText}
                </Link>
              </Button>
            </div>
          </Form>
        </TabsContent>
      </Tabs>
    </Container>
  );
};
