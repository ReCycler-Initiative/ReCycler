"use client";

import { FormFooter } from "@/components/editor-template";
import FormInput from "@/components/form/form-input";
import FormSelect from "@/components/form/form-select";
import { useMessages } from "@/i18n/locale-provider";
import { normalizeSourceCrsValue } from "@/lib/datasource";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDatasource,
  getDatasource,
  getDatasourceMappings,
  getFields,
  saveDatasourceMappings,
  testDatasource,
  updateDatasource,
} from "@/services/api";
import {
  Datasource,
  DatasourceFieldMapping,
  DatasourceTestResult,
  FieldRecord,
} from "@/types";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ---------- Schema ----------

const createDatasourceFormSchema = (messages: any) =>
  z.object({
    name: z.string().trim().min(1, messages.datasourceEditor.nameRequired),
    url: z.string().url(messages.datasourceEditor.validUrlRequired),
    status: z.enum(["draft", "active", "disabled"]),
    source_format: z.enum(["json", "geojson", "wfs"]),
    auth_type: z.enum(["none", "api_key", "basic", "query_param"]),
    auth_header: z.string().nullable().optional(),
    auth_credential: z.string().nullable().optional(),
    data_path: z.string().nullable().optional(),
    name_source_field: z.string().nullable().optional(),
    external_id_source_field: z.string().nullable().optional(),
    coordinate_type: z.enum(["latlon", "geojson"]),
    source_crs: z
      .string()
      .trim()
      .regex(/^(?:epsg:)?\d+$/i, messages.datasourceEditor.validEpsgRequired),
    lat_source_field: z.string().nullable().optional(),
    lon_source_field: z.string().nullable().optional(),
    geometry_source_field: z.string().nullable().optional(),
    schedule: z.string().nullable().optional(),
    mappings: z.array(
      z.object({
        source_field: z.string().min(1),
        field_id: z.string().uuid(),
      })
    ),
  });

type DatasourceFormValues = z.infer<typeof DatasourceFormSchema>;

// ---------- Props ----------

export type DataSourceEditorProps = {
  organizationId: string;
  useCaseId: string;
  /** Omit for create mode */
  datasourceId?: string;
  onSaved?: (datasource: Datasource) => void;
};

type ConnectionStatus = "idle" | "testing" | "success" | "error";

// ---------- Component ----------

export const DataSourceEditor = ({
  organizationId,
  useCaseId,
  datasourceId,
  onSaved,
}: DataSourceEditorProps) => {
  const messages = useMessages();
  const isEdit = !!datasourceId;
  const DatasourceFormSchema = createDatasourceFormSchema(messages);

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sampleFields, setSampleFields] = useState<
    DatasourceTestResult["sample_fields"]
  >([]);
  const [useCaseFields, setUseCaseFields] = useState<
    z.infer<typeof FieldRecord>[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [createdDatasourceId, setCreatedDatasourceId] = useState<
    string | undefined
  >(datasourceId);

  const form = useForm<DatasourceFormValues>({
    resolver: zodResolver(DatasourceFormSchema),
    defaultValues: {
      name: "",
      url: "",
      status: "draft",
      source_format: "json",
      auth_type: "none",
      auth_header: null,
      auth_credential: null,
      data_path: null,
      name_source_field: null,
      external_id_source_field: null,
      coordinate_type: "latlon",
      source_crs: "4326",
      lat_source_field: null,
      lon_source_field: null,
      geometry_source_field: null,
      schedule: null,
      mappings: [],
    },
  });

  const { register, control, handleSubmit, getValues, formState, reset, setValue } = form;

  const {
    fields: mappingRows,
    append: appendMapping,
    remove: removeMapping,
  } = useFieldArray({ control, name: "mappings" });

  const authType = useWatch({ control, name: "auth_type" });
  const sourceFormat = useWatch({ control, name: "source_format" });
  const coordinateType = useWatch({ control, name: "coordinate_type" });
  const mappingDisabled = !isEdit && connectionStatus !== "success";

  // Load use case fields
  useEffect(() => {
    getFields(organizationId, useCaseId)
      .then(setUseCaseFields)
      .catch(() => {});
  }, [organizationId, useCaseId]);

  // Load existing datasource in edit mode
  useEffect(() => {
    if (!isEdit || !datasourceId) return;
    Promise.all([
      getDatasource(organizationId, useCaseId, datasourceId),
      getDatasourceMappings(organizationId, useCaseId, datasourceId),
    ])
      .then(([ds, mappings]: [Datasource, DatasourceFieldMapping[]]) => {
        reset({
          name: ds.name,
          url: ds.url,
          status: ds.status,
          source_format: ds.source_format,
          auth_type: ds.auth_type,
          auth_header: ds.auth_header ?? null,
          auth_credential: null, // never pre-filled
          data_path: ds.data_path ?? null,
          name_source_field: ds.name_source_field ?? null,
          external_id_source_field: ds.external_id_source_field ?? null,
          coordinate_type: ds.coordinate_type,
          source_crs: normalizeSourceCrsValue(ds.source_crs ?? "4326"),
          lat_source_field: ds.lat_source_field ?? null,
          lon_source_field: ds.lon_source_field ?? null,
          geometry_source_field: ds.geometry_source_field ?? null,
          schedule: ds.schedule ?? null,
          mappings: mappings.map((m) => ({
            source_field: m.source_field,
            field_id: m.field_id,
          })),
        });
      })
        .catch(() => toast.error(messages.datasourceEditor.datasourceLoadFailed));
  }, [isEdit, datasourceId, organizationId, useCaseId, reset]);

  const handleTestConnection = async () => {
    setConnectionError(null);
    setConnectionStatus("testing");

    const isValid = await form.trigger([
      "name",
      "url",
      "status",
      "source_format",
      "auth_type",
      "coordinate_type",
      "source_crs",
    ]);

    if (!isValid) {
      setConnectionStatus("error");
      setConnectionError(messages.datasourceEditor.fillRequiredBeforeTest);
      return;
    }

    const values = getValues();

    try {
      // Need a datasourceId for the test endpoint — create a draft first if in create mode
      let dsId = createdDatasourceId;
      if (!dsId) {
        const created = await createDatasource(organizationId, useCaseId, {
          ...values,
          source_crs: normalizeSourceCrsValue(values.source_crs),
          status: "draft",
        });
        dsId = created.id;
        setCreatedDatasourceId(dsId);
      }

      const result = await testDatasource(organizationId, useCaseId, dsId, {
        url: values.url,
        source_format: values.source_format,
        auth_type: values.auth_type,
        auth_header: values.auth_header,
        auth_credential: values.auth_credential,
        data_path: values.data_path,
      });

      setSampleFields(result.sample_fields);
      if (result.detected_source_crs) {
        setValue("source_crs", result.detected_source_crs, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      if (result.resolved_url && result.resolved_url !== values.url) {
        setValue("url", result.resolved_url, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      setConnectionStatus("success");
    } catch (err: unknown) {
      setConnectionStatus("error");
      const msg = axios.isAxiosError(err)
        ? ((err.response?.data as { error?: string } | undefined)?.error ?? err.message)
        : err instanceof Error
          ? err.message
          : messages.datasourceEditor.connectionError;
      setConnectionError(msg);
    }
  };

  const onSubmit = async (values: DatasourceFormValues) => {
    setIsSaving(true);
    try {
      let saved: Datasource;

      if (createdDatasourceId) {
        saved = await updateDatasource(
          organizationId,
          useCaseId,
          createdDatasourceId,
          {
            ...values,
            source_crs: normalizeSourceCrsValue(values.source_crs),
          }
        );
      } else {
        saved = await createDatasource(organizationId, useCaseId, {
          ...values,
          source_crs: normalizeSourceCrsValue(values.source_crs),
        });
        setCreatedDatasourceId(saved.id);
      }

      await saveDatasourceMappings(
        organizationId,
        useCaseId,
        saved.id,
        values.mappings
      );

      toast.success(messages.datasourceEditor.datasourceSaved);
      onSaved?.(saved);
    } catch {
      toast.error(messages.datasourceEditor.datasourceSaveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const fieldPathOptions = sampleFields.map((f) => f.path);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
        {/* ─── Perustiedot ─── */}
        <h2 className="text-base font-semibold">
          {messages.datasourceEditor.connectionSettingsTitle}
        </h2>

        <FormInput name="name" label={messages.datasourceEditor.connectorName} />

        <FormSelect
          name="status"
          label={messages.datasourceEditor.status}
          items={[
            { value: "draft", label: messages.datasourceEditor.draft },
            { value: "active", label: messages.datasourceEditor.active },
            { value: "disabled", label: messages.datasourceEditor.disabled },
          ]}
        />

        <div className="space-y-1.5">
          <Label htmlFor="ds-url">{messages.datasourceEditor.url}</Label>
          <div className="flex gap-2">
            <Input
              id="ds-url"
              className="flex-1"
              {...register("url")}
              placeholder="https://api.example.com/collection-points"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={connectionStatus === "testing"}
            >
              {connectionStatus === "testing"
                ? messages.datasourceEditor.testing
                : messages.datasourceEditor.testConnection}
            </Button>
          </div>
          {connectionStatus === "success" && (
            <p className="text-xs text-green-600">
              {messages.datasourceEditor.connectionOk}
            </p>
          )}
          {connectionError && (
            <p className="text-xs text-destructive">{connectionError}</p>
          )}
          {formState.errors.url && (
            <p className="text-xs text-destructive">
              {formState.errors.url.message}
            </p>
          )}
        </div>

        <FormSelect
          name="source_format"
          label={messages.datasourceEditor.sourceFormat}
          items={[
            { value: "json", label: "JSON" },
            { value: "geojson", label: "GeoJSON" },
            { value: "wfs", label: messages.datasourceEditor.wfsOption },
          ]}
        />

        {sourceFormat === "json" && (
          <FormInput name="data_path" label={messages.datasourceEditor.dataPath} />
        )}

        <FormSelect
          name="auth_type"
          label={messages.datasourceEditor.authentication}
          items={[
            { value: "none", label: messages.datasourceEditor.noAuth },
            { value: "api_key", label: messages.datasourceEditor.apiKeyHeader },
            { value: "basic", label: messages.datasourceEditor.basicAuth },
            { value: "query_param", label: messages.datasourceEditor.queryParam },
          ]}
        />

        {authType === "api_key" && (
          <>
            <FormInput name="auth_header" label={messages.datasourceEditor.headerName} />
            <FormInput name="auth_credential" label={messages.datasourceEditor.apiKey} />
          </>
        )}

        {authType === "basic" && (
          <FormInput name="auth_credential" label={messages.datasourceEditor.usernamePassword} />
        )}

        {authType === "query_param" && (
          <>
            <FormInput name="auth_header" label={messages.datasourceEditor.parameterName} />
            <FormInput name="auth_credential" label={messages.datasourceEditor.value} />
          </>
        )}

        <FormInput name="schedule" label={messages.datasourceEditor.schedule} />

        {/* ─── Koordinaatit ja nimikenttä ─── */}
        <h2 className="text-base font-semibold pt-2">
          {messages.datasourceEditor.coordinatesAndNameField}
        </h2>

        <fieldset
          disabled={mappingDisabled}
          className={
            mappingDisabled
              ? "space-y-6 opacity-50 pointer-events-none"
              : "space-y-6"
          }
        >
          <FormField
            control={control}
            name="name_source_field"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{messages.datasourceEditor.locationNameField}</FormLabel>
                <FormControl>
                  <FieldPathSelect
                    options={fieldPathOptions}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder={messages.datasourceEditor.selectSourceField}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="external_id_source_field"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{messages.datasourceEditor.externalIdField}</FormLabel>
                <FormControl>
                  <FieldPathSelect
                    options={fieldPathOptions}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder={messages.datasourceEditor.selectSourceField}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormSelect
            name="coordinate_type"
            label={messages.datasourceEditor.coordinateType}
            items={[
              { value: "latlon", label: messages.datasourceEditor.latLonFields },
              { value: "geojson", label: messages.datasourceEditor.geojsonGeometry },
            ]}
          />

          <FormField
            control={control}
            name="source_crs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{messages.datasourceEditor.coordinateSystem}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? "4326"}
                    placeholder="4326"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  {messages.datasourceEditor.coordinateSystemLongHelp}
                </p>
                {sourceFormat === "wfs" && (
                  <p className="text-xs text-muted-foreground">
                    {messages.datasourceEditor.wfsCoordinateSystemHelp}
                  </p>
                )}
              </FormItem>
            )}
          />

          {coordinateType === "latlon" && (
            <>
              <FormField
                control={control}
                name="lat_source_field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{messages.datasourceEditor.latitudeField}</FormLabel>
                    <FormControl>
                      <FieldPathSelect
                        options={fieldPathOptions}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder={messages.datasourceEditor.selectSourceField}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="lon_source_field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{messages.datasourceEditor.longitudeField}</FormLabel>
                    <FormControl>
                      <FieldPathSelect
                        options={fieldPathOptions}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder={messages.datasourceEditor.selectSourceField}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}

          {coordinateType === "geojson" && (
            <FormField
              control={control}
              name="geometry_source_field"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>{messages.datasourceEditor.geometryField}</FormLabel>
                  <FormControl>
                    <FieldPathSelect
                      options={fieldPathOptions}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                        placeholder={messages.datasourceEditor.selectSourceField}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </fieldset>

        {/* ─── Kenttämäppäykset ─── */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-base font-semibold">{messages.datasourceEditor.fieldMappingsTitle}</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={mappingDisabled}
            onClick={() => appendMapping({ source_field: "", field_id: "" })}
          >
            {messages.datasourceEditor.addMapping}
          </Button>
        </div>

        <fieldset
          disabled={mappingDisabled}
          className={
            mappingDisabled
              ? "space-y-3 opacity-50 pointer-events-none"
              : "space-y-3"
          }
        >
          {mappingRows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {messages.datasourceEditor.noMappings}
            </p>
          )}
          {mappingRows.map((row, index) => (
            <div key={row.id} className="flex gap-2 items-end">
              <FormField
                control={control}
                name={`mappings.${index}.source_field`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-xs">{messages.datasourceEditor.sourceField}</FormLabel>
                    <FormControl>
                      <FieldPathSelect
                        options={fieldPathOptions}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder={messages.datasourceEditor.selectSourceField}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormSelect
                name={`mappings.${index}.field_id`}
                label={messages.datasourceEditor.targetField}
                className="flex-1"
                items={useCaseFields.map((f) => ({
                  value: f.id,
                  label: f.name,
                }))}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive mb-0.5"
                onClick={() => removeMapping(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </fieldset>

        {/* ─── Footer ─── */}
        <FormFooter isSubmitting={isSaving} isDirty={formState.isDirty} />
      </form>
    </Form>
  );
};

// ---------- Helper: path selector ----------

function FieldPathSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  if (options.length === 0) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  }
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
