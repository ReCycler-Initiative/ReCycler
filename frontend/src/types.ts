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

const FieldType = z.union([z.literal("multi_select"), z.literal("text_input")]);

const FieldValue = z.union([z.string(), z.array(z.string())]);

export const DbLocation = z.object({
  location_id: z.string().uuid(),
  location_name: z.string(),
  location_geom: z.null(),
  field_order: z.number(),
  field_name: z.string(),
  field_type: FieldType,
  field_values: FieldValue,
});

export const LocationProperties = z.object({
  id: z.string().uuid(),
  name: z.string(),
  fields: z.array(
    z.object({
      name: z.string(),
      type: FieldType,
      value: FieldValue,
    })
  ),
});

export const LocationGeoJson = z.object({
  type: z.literal("Feature"),
  geometry: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  properties: LocationProperties,
});
