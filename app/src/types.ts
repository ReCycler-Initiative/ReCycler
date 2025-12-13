import { z } from "zod";

export type CollectionSpot = {
  id: number;
  name: string;
  address: string;
  opening_hours_fi: string;
  postal_code: string;
  post_office: string;
  materials: string;
};

export type Material = {
  code: number;
  name: string;
};

export type Modify<T, R> = Omit<T, keyof R> & R;

export type ChatResponse = {
  status: string;
  data: {
    conversation_id: string;
    response: string;
  };
};

export const FieldType = z.union([
  z.literal("multi_select"),
  z.literal("text_input"),
]);

export const FieldValue = z.union([z.string(), z.array(z.string())]);

export const FieldDataType = z.union([
  z.literal("array"),
  z.literal("boolean"),
  z.literal("number"),
  z.literal("string"),
]);

export const Field = z.object({
  data_type: FieldDataType,
  field_type: FieldType,
  name: z.string(),
  order: z.number(),
});

export const Point = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const DbLocation = z.object({
  field_data_type: FieldDataType,
  field_name: z.string(),
  field_order: z.number(),
  field_type: FieldType,
  field_values: FieldValue,
  location_geom: Point,
  location_id: z.string().uuid(),
  location_name: z.string(),
});

export const LocationProperties = z.object({
  id: z.string().uuid(),
  name: z.string(),
  fields: z.array(
    z.intersection(
      Field,
      z.object({
        value: FieldValue,
      })
    )
  ),
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
