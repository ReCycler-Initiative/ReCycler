"use client";

import { EditorTemplate, useEditor } from "@/components/editor-template";
import FormCheckbox from "@/components/form/form-checkbox";
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
          <TabsList className="mb-6 grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-3">
            <TabsTrigger
              value="info"
              className="w-full whitespace-normal py-2 text-center leading-tight"
            >
              {messages.adminUseCaseEditor.infoTab}
            </TabsTrigger>
            <TabsTrigger
              value="sisaltosivut"
              className="w-full whitespace-normal py-2 text-center leading-tight"
            >
              {messages.adminUseCaseEditor.contentPagesTab}
            </TabsTrigger>
            <TabsTrigger
              value="kartta"
              className="w-full whitespace-normal py-2 text-center leading-tight"
            >
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

              <div className="space-y-2 rounded-md border border-gray-200 p-3">
                <FormCheckbox
                  label={messages.adminUseCaseEditor.enableGeolocationLabel}
                  name="map_settings.enable_geolocation"
                />
                <FormCheckbox
                  label={messages.adminUseCaseEditor.enableSatelliteToggleLabel}
                  name="map_settings.enable_satellite_toggle"
                />
                <FormCheckbox
                  label={messages.adminUseCaseEditor.enableNavigationControlsLabel}
                  name="map_settings.enable_navigation_controls"
                />
                <FormCheckbox
                  label={messages.adminUseCaseEditor.enableFullscreenControlLabel}
                  name="map_settings.enable_fullscreen_control"
                />
                <FormCheckbox
                  label={messages.adminUseCaseEditor.enableSearchLabel}
                  name="map_settings.enable_search"
                />
              </div>

              <div className="space-y-3 rounded-md border border-gray-200 p-3">
                <h4 className="text-base font-semibold">
                  {messages.adminUseCaseEditor.onboardingSection}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {messages.adminUseCaseEditor.onboardingSectionDescription}
                </p>

                <FormCheckbox
                  label={messages.adminUseCaseEditor.enableOnboardingLabel}
                  name="map_settings.onboarding.enabled"
                />

                <div className="grid gap-2 md:grid-cols-2">
                  <FormCheckbox
                    label={messages.adminUseCaseEditor.onboardingStepSearchLabel}
                    name="map_settings.onboarding.steps.search"
                  />
                  <FormCheckbox
                    label={messages.adminUseCaseEditor.onboardingStepLocationLabel}
                    name="map_settings.onboarding.steps.location"
                  />
                  <FormCheckbox
                    label={messages.adminUseCaseEditor.onboardingStepMapStyleLabel}
                    name="map_settings.onboarding.steps.map_style"
                  />
                  <FormCheckbox
                    label={messages.adminUseCaseEditor.onboardingStepFilterLabel}
                    name="map_settings.onboarding.steps.filter"
                  />
                  <FormCheckbox
                    label={messages.adminUseCaseEditor.onboardingStepCompleteLabel}
                    name="map_settings.onboarding.steps.complete"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <FormInput
                    label={messages.adminUseCaseEditor.onboardingSearchTitleLabel}
                    name="map_settings.onboarding.content.search.title"
                    placeholder={messages.onboarding.searchTitle}
                  />
                  <FormTextArea
                    label={messages.adminUseCaseEditor.onboardingSearchBodyLabel}
                    name="map_settings.onboarding.content.search.body"
                    placeholder={messages.onboarding.searchHint}
                  />
                  <FormInput
                    label={messages.adminUseCaseEditor.onboardingSearchTipLabel}
                    name="map_settings.onboarding.content.search.tip"
                    placeholder={messages.onboarding.searchTip}
                  />

                  <FormInput
                    label={messages.adminUseCaseEditor.onboardingLocationTitleLabel}
                    name="map_settings.onboarding.content.location.title"
                    placeholder={messages.onboarding.locationTitle}
                  />
                  <FormTextArea
                    label={messages.adminUseCaseEditor.onboardingLocationBodyLabel}
                    name="map_settings.onboarding.content.location.body"
                    placeholder={messages.onboarding.locationBody}
                  />
                  <FormInput
                    label={messages.adminUseCaseEditor.onboardingLocationTipLabel}
                    name="map_settings.onboarding.content.location.tip"
                    placeholder={messages.onboarding.locationTip}
                  />

                  <FormInput
                    label={messages.adminUseCaseEditor.onboardingMapStyleTitleLabel}
                    name="map_settings.onboarding.content.map_style.title"
                    placeholder={messages.onboarding.mapStyleTitle}
                  />
                  <FormTextArea
                    label={messages.adminUseCaseEditor.onboardingMapStyleBodyLabel}
                    name="map_settings.onboarding.content.map_style.body"
                    placeholder={messages.onboarding.mapStyleBody}
                  />
                  <FormInput
                    label={messages.adminUseCaseEditor.onboardingMapStyleTipLabel}
                    name="map_settings.onboarding.content.map_style.tip"
                    placeholder={messages.onboarding.mapStyleTip}
                  />

                  <FormInput
                    label={messages.adminUseCaseEditor.onboardingFilterTitleLabel}
                    name="map_settings.onboarding.content.filter.title"
                    placeholder={messages.onboarding.filterTitle}
                  />
                  <FormTextArea
                    label={messages.adminUseCaseEditor.onboardingFilterBodyLabel}
                    name="map_settings.onboarding.content.filter.body"
                    placeholder={messages.onboarding.filterBody}
                  />
                  <FormInput
                    label={messages.adminUseCaseEditor.onboardingFilterTipLabel}
                    name="map_settings.onboarding.content.filter.tip"
                    placeholder={messages.onboarding.filterTip}
                  />

                  <FormInput
                    label={messages.adminUseCaseEditor.onboardingCompleteTitleLabel}
                    name="map_settings.onboarding.content.complete.title"
                    placeholder={messages.onboarding.completeTitle}
                  />
                  <FormInput
                    label={messages.adminUseCaseEditor.onboardingCompleteCtaLabel}
                    name="map_settings.onboarding.content.complete.ctaLabel"
                    placeholder={messages.onboarding.completeCta}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </EditorTemplate>
    </PageTemplate>
  );
};

export default UseCaseInfoPage;
