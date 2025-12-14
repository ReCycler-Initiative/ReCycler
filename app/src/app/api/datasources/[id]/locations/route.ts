import axios from "axios";
import { NextResponse } from "next/server";
import z from "zod";

const Field = z.object({
  name: z.string(),
});

const DataSource = z.object({
  apiKey: z.string().optional(),
  authentication: z
    .enum(["API Key", "Basic Auth", "Bearer Token", "None"])
    .default("None"),
  dataPath: z.string().optional(),
  fields: z.array(Field),
  headers: z.record(z.string()).optional(),
  method: z.enum(["GET", "POST"]).default("GET"),
  name: z.string(),
  status: z.enum(["Active", "Draft"]).default("Draft"),
  url: z.string(),
});

type TField = z.infer<typeof Field>;
type TDataSource = z.infer<typeof DataSource>;

function inferZodType(value: unknown): z.ZodTypeAny {
  if (value === null || value === undefined) {
    return z.unknown().optional();
  }

  if (typeof value === "string") {
    return z.string();
  }

  if (typeof value === "number") {
    return z.number();
  }

  if (typeof value === "boolean") {
    return z.boolean();
  }

  if (Array.isArray(value)) {
    return z.array(z.unknown());
  }

  if (typeof value === "object") {
    return z.object({}).passthrough();
  }

  return z.unknown();
}

function createDynamicSchema(
  fields: TField[],
  sampleData: Record<string, unknown>
) {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    const value = sampleData[field.name];
    shape[field.name] = inferZodType(value);
  });

  return z.object(shape);
}

function getNestedProperty(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

async function fetchAndParseData(dataSource: TDataSource) {
  const response = await axios({
    method: dataSource.method,
    url: dataSource.url,
    headers: dataSource.headers,
  });

  const dataArray = dataSource.dataPath
    ? getNestedProperty(response.data, dataSource.dataPath)
    : response.data;

  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    throw new Error("No data found or data is not an array");
  }

  const sampleData = dataArray[0];

  const dataSchema = createDynamicSchema(dataSource.fields, sampleData);

  const validatedResults = dataArray.map((item: unknown) =>
    dataSchema.parse(item)
  );

  return validatedResults;
}

export async function GET() {
  const baseUrl = process.env.KIERRATYS_API_URL;
  const apiKey = process.env.KIERRATYS_API_KEY;

  const kierratysDataSource = DataSource.parse({
    name: "Kierratys",
    url: `${baseUrl}/collectionspots/?api_key=${apiKey}&format=json`,
    method: "GET",
    dataPath: "results",
    fields: [{ name: "name" }, { name: "id" }, { name: "municipality" }],
  });

  const result = await fetchAndParseData(kierratysDataSource);

  return NextResponse.json(result);
}
