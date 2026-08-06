"use client";

import { EditorTemplate, useEditor } from "@/components/editor-template";
import FormInput from "@/components/form/form-input";
import { FormTextArea } from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEFAULT_USE_CASE_MAP_SETTINGS,
  resolveUseCaseMapSettings,
} from "@/lib/map-settings";
import { getUseCaseById, updateUseCase } from "@/services/api";
import { UseCase } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { z } from "zod";
import { PageTemplate } from "@/components/admin/page-template";
import { PageIntro } from "@/components/admin/page-intro";

const UseCaseInfoPage = () => {
  const { locale } = useLocale();
  const messages = useMessages();
  const queryClient = useQueryClient();
  const { id, useCaseId } = useParams<{ id: string; useCaseId: string }>();

  const editor = useEditor<z.infer<typeof UseCase>, z.infer<typeof UseCase>>({
    defaultValues: {
      id: "",
      name: "",
      description: "",
      map_settings: DEFAULT_USE_CASE_MAP_SETTINGS,
    },
    queryKey: ["use_case", id, useCaseId],
    queryFn: () => getUseCaseById(id, useCaseId),
    mutationFn: (data) => updateUseCase(id, data),
    toFormState: (data) => {
      const parsed = UseCase.parse(data);
      return {
        ...parsed,
        map_settings: resolveUseCaseMapSettings(parsed.map_settings),
      };
    },
    toApiData: UseCase.parse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["use_cases", id] });
    },
  });

  return (
    <PageTemplate>
      <PageIntro
        title={messages.adminUseCaseEditor.title}
        description={messages.adminUseCaseEditor.description}
      />
      <EditorTemplate {...editor}>
        <Tabs defaultValue="info" className="my-2 max-w-6xl">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="info" className="flex-1">
              {messages.adminUseCaseEditor.infoTab}
            </TabsTrigger>
            <TabsTrigger value="sisaltosivut" className="flex-1">
              {messages.adminUseCaseEditor.contentPagesTab}
            </TabsTrigger>
            <TabsTrigger value="kartta" className="flex-1">
              {messages.adminUseCaseEditor.mapTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="space-y-3">
              <FormInput
                label={messages.adminUseCaseEditor.nameLabel}
                name="name"
              />
              <FormTextArea
                label={messages.adminUseCaseEditor.descriptionLabel}
                name="description"
              />
            </div>
          </TabsContent>

          <TabsContent value="sisaltosivut">
            <div className="space-y-12">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {messages.adminUseCaseEditor.frontPageSection}
                </h3>
                <Tabs
                  key={`intro-${locale}`}
                  defaultValue={locale}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <TabsList className="mb-4 w-full justify-start gap-1">
                    <TabsTrigger value="fi">
                      {messages.adminUseCaseEditor.finnishSection}
                    </TabsTrigger>
                    <TabsTrigger value="en">
                      {messages.adminUseCaseEditor.englishSection}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="fi" className="space-y-3">
                    <FormInput
                      label={messages.adminUseCaseEditor.titleLabel}
                      name="content.intro.title.fi"
                    />
                    <FormTextArea
                      label={messages.adminUseCaseEditor.bodyLabel}
                      name="content.intro.text.fi"
                      textareaClassName="min-h-40 resize-y"
                    />
                    <FormInput
                      label={messages.adminUseCaseEditor.ctaLabel}
                      name="content.intro.cta.fi"
                    />
                    <FormInput
                      label={messages.adminUseCaseEditor.skipTextLabel}
                      name="content.intro.skip.fi"
                    />
                  </TabsContent>

                  <TabsContent value="en" className="space-y-3">
                    <FormInput
                      label={messages.adminUseCaseEditor.titleLabel}
                      name="content.intro.title.en"
                    />
                    <FormTextArea
                      label={messages.adminUseCaseEditor.bodyLabel}
                      name="content.intro.text.en"
                      textareaClassName="min-h-40 resize-y"
                    />
                    <FormInput
                      label={messages.adminUseCaseEditor.ctaLabel}
                      name="content.intro.cta.en"
                    />
                    <FormInput
                      label={messages.adminUseCaseEditor.skipTextLabel}
                      name="content.intro.skip.en"
                    />
                  </TabsContent>
                </Tabs>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {messages.adminUseCaseEditor.filtersSection}
                </h3>
                <Tabs
                  key={`filters-${locale}`}
                  defaultValue={locale}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <TabsList className="mb-4 w-full justify-start gap-1">
                    <TabsTrigger value="fi">
                      {messages.adminUseCaseEditor.finnishSection}
                    </TabsTrigger>
                    <TabsTrigger value="en">
                      {messages.adminUseCaseEditor.englishSection}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="fi" className="space-y-3">
                    <FormInput
                      label={messages.adminUseCaseEditor.titleLabel}
                      name="content.filters.title.fi"
                    />
                    <FormTextArea
                      label={messages.adminUseCaseEditor.bodyLabel}
                      name="content.filters.text.fi"
                      textareaClassName="min-h-40 resize-y"
                    />
                    <FormInput
                      label={messages.adminUseCaseEditor.aiTabTextLabel}
                      name="content.filters.tab_ai.fi"
                    />
                    <FormInput
                      label={messages.adminUseCaseEditor.manualTabTextLabel}
                      name="content.filters.tab_manual.fi"
                    />
                    <FormInput
                      label={messages.adminUseCaseEditor.ctaLabel}
                      name="content.filters.cta.fi"
                    />
                  </TabsContent>

                  <TabsContent value="en" className="space-y-3">
                    <FormInput
                      label={messages.adminUseCaseEditor.titleLabel}
                      name="content.filters.title.en"
                    />
                    <FormTextArea
                      label={messages.adminUseCaseEditor.bodyLabel}
                      name="content.filters.text.en"
                      textareaClassName="min-h-40 resize-y"
                    />
                    <FormInput
                      label={messages.adminUseCaseEditor.aiTabTextLabel}
                      name="content.filters.tab_ai.en"
                    />
                    <FormInput
                      label={messages.adminUseCaseEditor.manualTabTextLabel}
                      name="content.filters.tab_manual.en"
                    />
                    <FormInput
                      label={messages.adminUseCaseEditor.ctaLabel}
                      name="content.filters.cta.en"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kartta">
            <div className="space-y-5 rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    {messages.adminUseCaseEditor.mapSection}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {messages.adminUseCaseEditor.mapSectionDescription}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    editor.form.setValue(
                      "map_settings",
                      DEFAULT_USE_CASE_MAP_SETTINGS,
                      { shouldDirty: true }
                    )
                  }
                >
                  {messages.adminUseCaseEditor.resetMapDefaults}
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <FormInput
                  label={messages.adminUseCaseEditor.mapCenterLngLabel}
                  name="map_settings.initial_center.0"
                />
                <FormInput
                  label={messages.adminUseCaseEditor.mapCenterLatLabel}
                  name="map_settings.initial_center.1"
                />
                <FormInput
                  label={messages.adminUseCaseEditor.mapZoomLabel}
                  name="map_settings.initial_zoom"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <FormInput
                  label={messages.adminUseCaseEditor.mapBoundsSouthWestLngLabel}
                  name="map_settings.max_bounds.0.0"
                />
                <FormInput
                  label={messages.adminUseCaseEditor.mapBoundsSouthWestLatLabel}
                  name="map_settings.max_bounds.0.1"
                />
                <FormInput
                  label={messages.adminUseCaseEditor.mapBoundsNorthEastLngLabel}
                  name="map_settings.max_bounds.1.0"
                />
                <FormInput
                  label={messages.adminUseCaseEditor.mapBoundsNorthEastLatLabel}
                  name="map_settings.max_bounds.1.1"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <FormInput
                  label={messages.adminUseCaseEditor.geocoderMinLngLabel}
                  name="map_settings.geocoder_bbox.0"
                />
                <FormInput
                  label={messages.adminUseCaseEditor.geocoderMinLatLabel}
                  name="map_settings.geocoder_bbox.1"
                />
                <FormInput
                  label={messages.adminUseCaseEditor.geocoderMaxLngLabel}
                  name="map_settings.geocoder_bbox.2"
                />
                <FormInput
                  label={messages.adminUseCaseEditor.geocoderMaxLatLabel}
                  name="map_settings.geocoder_bbox.3"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </EditorTemplate>
    </PageTemplate>
  );
};

export default UseCaseInfoPage;
