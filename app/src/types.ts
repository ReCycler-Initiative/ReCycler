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

export const DbLocation = z.object({
  field_id: z.string().uuid().nullable(),
  field_name: z.string().nullable(),
  field_order: z.number().nullable(),
  field_type: FieldType.nullable(),
  field_values: FieldValue.nullable(),
  location_address: z.string().nullable().optional(),
  location_geom: Point,
  location_id: z.string().uuid(),
  location_name: z.string(),
  location_post_office: z.string().nullable().optional(),
  location_postal_code: z.string().nullable().optional(),
});

export const LocationProperties = z.object({
  address: z.string().optional(),
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
    id: z.string().uuid(),
    name: z.string(),
    fields: z.array(LocationDetailField),
    post_office: z.string().optional(),
    postal_code: z.string().optional(),
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

export const Datasource = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string(),
  use_case_id: z.string().uuid(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export type Datasource = z.infer<typeof Datasource>;

export const DatasourcePingStatus = z.object({
  status: z.number(),
  statusText: z.string(),
});
