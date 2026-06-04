import { isSupportedSourceCrsValue, normalizeSourceCrsValue } from "@/lib/datasource";
import { z } from "zod";

export type CollectionSpot = {
  id: number;
  name: string;
  address: string;
  additional_details?: string;
  description_en?: string;
  description_fi?: string;
  opening_hours_en?: string;
  opening_hours_fi: string;
  postal_code: string;
  post_office: string;
  materials: string;
};

export type Material = {
  code: number;
  name: string;
};

export const LocalizedText = z.object({
  fi: z.string(),
  en: z.string(),
});

export type Modify<T, R> = Omit<T, keyof R> & R;

export type ChatResponse = {
  reply: string;
  suggestedCodes: number[];
  suggestedFieldValues: Record<string, number[]>;
  preparationTips: { materialName: string; tip: string }[];
};

export const FieldType = z.union([
  z.literal("multi_select"),
  z.literal("text_input"),
  z.literal("address"),
  z.literal("opening_hours"),
]);

export const FieldValue = z.array(z.string());

export const FieldOptions = z.object({
  choices: z.array(z.string()).optional(),
  choiceColors: z.record(z.string()).optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
});

export const Field = z.object({
  field_type: FieldType,
  name: z.string(),
  order: z.number().nullable(),
  options: FieldOptions.nullable().optional(),
  required: z.boolean().optional(),
});

export const FieldRecord = Field.extend({
  id: z.string().uuid(),
  use_case_id: z.string().uuid(),
});

export const Point = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const Geometry = z.object({
  type: z.string(),
}).passthrough();

export const DbLocation = z.object({
  field_id: z.string().uuid().nullable(),
  field_name: z.string().nullable(),
  field_order: z.number().nullable(),
  field_type: FieldType.nullable(),
  field_values: FieldValue.nullable(),
  location_address: z.string().nullable().optional(),
  location_geom: Point,
  location_source_geom: Geometry.nullable().optional(),
  location_id: z.string().uuid(),
  location_name: z.string(),
  location_post_office: z.string().nullable().optional(),
  location_postal_code: z.string().nullable().optional(),
});

export const LocationProperties = z.object({
  address: z.string().optional(),
  datasource_name: z.string().optional(),
  id: z.string().uuid(),
  name: z.string(),
  fields: z.array(
    Field.extend({
      id: z.string().uuid(),
      value: FieldValue,
    })
  ),
  post_office: z.string().optional(),
  postal_code: z.string().optional(),
  source_type: z.enum(["manual", "datasource"]).optional(),
  source_geometry: Geometry.optional(),
});

export const LocationGeoJson = z.object({
  type: z.literal("Feature"),
  geometry: Point,
  properties: LocationProperties,
});

export const LocationGeoJsonCollection = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(LocationGeoJson),
});

export const LocationDetailField = z.object({
  id: z.string().uuid(),
  name: z.string(),
  field_type: FieldType,
  options: FieldOptions.nullable().optional(),
  required: z.boolean().optional(),
  order: z.number().nullable(),
  value: FieldValue,
});

export const LocationDetail = z.object({
  type: z.literal("Feature"),
  geometry: Point,
  properties: z.object({
    address: z.string().optional(),
    datasource_name: z.string().optional(),
    id: z.string().uuid(),
    name: z.string(),
    fields: z.array(LocationDetailField),
    post_office: z.string().optional(),
    postal_code: z.string().optional(),
    source_type: z.enum(["manual", "datasource"]).optional(),
  }),
});

export const NewOrganization = z.object({
  name: z.string(),
});

export const NewUseCase = z.object({
  description: z.string().max(2000),
  name: z.string().max(255),
});

export const UseCase = NewUseCase.merge(
  z.object({
    id: z.string().uuid(),
    created_at: z.coerce.date().optional(),
    content: z.object({
      intro: z.object({
        title: LocalizedText,
        cta: LocalizedText,
        skip: LocalizedText,
        text: LocalizedText,
      }),
      filters: z.object({
        title: LocalizedText,
        cta: LocalizedText,
        text: LocalizedText,
        tab_ai: LocalizedText,
        tab_manual: LocalizedText,
      }),
    }),
    updated_at: z.coerce.date().optional(),
  })
);

export const CreateOrganizationRequest = z.object({
  organization: NewOrganization,
  useCase: NewUseCase,
});

export const Organization = NewOrganization.merge(
  z.object({
    auth0_id: z.string(),
    id: z.string().uuid(),
  })
);

export const CreateOrganizationResponse = z.object({
  organization: Organization,
  useCase: UseCase,
});

export const DatasourceStatus = z.enum(["draft", "active", "disabled"]);
export const DatasourceSourceFormat = z.enum(["json", "geojson", "wfs"]);
export const DatasourceAuthType = z.enum(["none", "api_key", "basic", "query_param"]);
export const DatasourceCoordinateType = z.enum(["latlon", "geojson"]);
export const DatasourceSourceCrs = z
  .string()
  .trim()
  .refine(
    (value) => isSupportedSourceCrsValue(value),
    "Invalid source CRS. Use an EPSG code such as 4326 or EPSG:3067."
  )
  .transform((value) => normalizeSourceCrsValue(value));

export const Datasource = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string(),
  use_case_id: z.string().uuid(),
  status: DatasourceStatus.default("draft"),
  source_format: DatasourceSourceFormat.default("json"),
  auth_type: DatasourceAuthType.default("none"),
  auth_header: z.string().nullable().optional(),
  /** Never returned from the API — only auth_credentials_configured + auth_credentials_last4 */
  auth_credentials_configured: z.boolean().optional(),
  auth_credentials_last4: z.string().nullable().optional(),
  data_path: z.string().nullable().optional(),
  name_source_field: z.string().nullable().optional(),
  external_id_source_field: z.string().nullable().optional(),
  coordinate_type: DatasourceCoordinateType.default("latlon"),
  source_crs: DatasourceSourceCrs.default("4326"),
  import_point_geometries: z.boolean().default(true),
  import_non_point_geometries: z.boolean().default(true),
  generate_point_from_non_point_geometries: z.boolean().default(true),
  lat_source_field: z.string().nullable().optional(),
  lon_source_field: z.string().nullable().optional(),
  geometry_source_field: z.string().nullable().optional(),
  schedule: z.string().nullable().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export type Datasource = z.infer<typeof Datasource>;

export const DatasourceFieldMapping = z.object({
  id: z.string().uuid(),
  datasource_id: z.string().uuid(),
  source_field: z.string(),
  field_id: z.string().uuid(),
  created_at: z.coerce.date().optional(),
});

export type DatasourceFieldMapping = z.infer<typeof DatasourceFieldMapping>;

export const DatasourceRunStatus = z.enum(["running", "completed", "failed"]);

export const DatasourceRun = z.object({
  id: z.string().uuid(),
  datasource_id: z.string().uuid(),
  status: DatasourceRunStatus,
  started_at: z.coerce.date(),
  finished_at: z.coerce.date().nullable().optional(),
  rows_synced: z.number().nullable().optional(),
  rows_deleted: z.number().nullable().optional(),
  rows_skipped: z.number().nullable().optional(),
  rows_failed: z.number().nullable().optional(),
  error_message: z.string().nullable().optional(),
  created_at: z.coerce.date().optional(),
  /** Joined from datasources table */
  datasource_name: z.string().optional(),
});

export type DatasourceRun = z.infer<typeof DatasourceRun>;

export const SampleField = z.object({
  path: z.string(),
  sampleValue: z.string(),
});

export const DatasourceTestResult = z.object({
  sample_fields: z.array(SampleField),
  detected_source_crs: z.string().nullable().optional(),
  resolved_url: z.string().url().nullable().optional(),
});

export type DatasourceTestResult = z.infer<typeof DatasourceTestResult>;
