import {
  ChatResponse,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  Datasource,
  DatasourceFieldMapping,
  DatasourceRun,
  DatasourceTestResult,
  FieldRecord,
  LocationDetail,
  LocationGeoJsonCollection,
  Material,
  ObjectRecord,
  Organization,
  UseCase,
} from "@/types";
import { Locale } from "@/i18n/messages";
import axios from "axios";
import { z } from "zod";

export const getCollectionSpots = async (): Promise<
  GeoJSON.FeatureCollection<GeoJSON.Geometry>
> => axios.get("/api/collection_spots").then((response) => response.data);

export const getMaterials = (locale?: Locale): Promise<Array<Material>> =>
  axios
    .get("/api/materials", {
      params: locale ? { locale } : undefined,
    })
    .then((response) => response.data);

export const chat = async ({
  message,
  history,
  imageBase64,
  imageMimeType,
  organizationId,
  useCaseId,
  locale,
  currentSelectedCodes,
  currentSelectedFieldValues,
}: {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  imageBase64?: string;
  imageMimeType?: string;
  organizationId?: string;
  useCaseId?: string;
  locale?: Locale;
  currentSelectedCodes?: number[];
  currentSelectedFieldValues?: Record<string, number[]>;
}): Promise<ChatResponse> =>
  axios
    .post("/api/chat", {
      message,
      history,
      imageBase64,
      imageMimeType,
      organizationId,
      useCaseId,
      locale,
      currentSelectedCodes,
      currentSelectedFieldValues,
    })
    .then((response) => response.data);

export const getLocations = (
  organizationId: string,
  useCaseId: string
): Promise<z.infer<typeof LocationGeoJsonCollection>> =>
  axios
    .get(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/locations`
    )
    .then((response) => response.data);

export const createLocation = (
  organizationId: string,
  useCaseId: string,
  body: {
    name: string;
    longitude: number;
    latitude: number;
    address?: string;
    postal_code?: string;
    post_office?: string;
    fieldValues?: { fieldId: string; values: string[] }[];
  }
): Promise<any> =>
  axios
    .post(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/locations`,
      body
    )
    .then((response) => response.data);

export const getLocation = (
  organizationId: string,
  useCaseId: string,
  locationId: string
): Promise<z.infer<typeof LocationDetail>> =>
  axios
    .get(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/locations/${locationId}`
    )
    .then((response) => response.data);

export const updateLocation = (
  organizationId: string,
  useCaseId: string,
  locationId: string,
  body: {
    name: string;
    longitude: number;
    latitude: number;
    address?: string;
    postal_code?: string;
    post_office?: string;
    fieldValues?: { fieldId: string; values: string[] }[];
  }
): Promise<void> =>
  axios
    .put(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/locations/${locationId}`,
      body
    )
    .then(() => undefined);

export const deleteLocation = (
  organizationId: string,
  useCaseId: string,
  locationId: string
): Promise<void> =>
  axios
    .delete(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/locations/${locationId}`
    )
    .then(() => undefined);

export const createOrganization = async (
  request: z.infer<typeof CreateOrganizationRequest>
) =>
  axios
    .post("/api/organizations", request)
    .then((response) => CreateOrganizationResponse.parse(response.data));

export const getUseCases = (
  organizationId: string
): Promise<Array<z.infer<typeof UseCase>>> =>
  axios
    .get(`/api/organizations/${organizationId}/use_cases`)
    .then((response) => response.data);

export const getUseCaseById = (
  organizationId: string,
  useCaseId: string
): Promise<z.infer<typeof UseCase>> =>
  axios
    .get(`/api/organizations/${organizationId}/use_cases/${useCaseId}`)
    .then((response) => UseCase.parse(response.data));

export const updateUseCase = (
  organizationId: string,
  useCase: z.infer<typeof UseCase>
): Promise<z.infer<typeof UseCase>> =>
  axios
    .put(
      `/api/organizations/${organizationId}/use_cases/${useCase.id}`,
      useCase
    )
    .then((response) => UseCase.parse(response.data));

export const getOrganizationById = (
  id: string
): Promise<z.infer<typeof Organization>> =>
  axios
    .get(`/api/organizations/${id}`)
    .then((response) => Organization.parse(response.data));

export const updateOrganization = (
  organization: z.infer<typeof Organization>
): Promise<z.infer<typeof Organization>> =>
  axios
    .put(`/api/organizations/${organization.id}`, organization)
    .then((response) => Organization.parse(response.data));

export const checkOrganizationAccess = (
  organizationId: string
): Promise<{ hasAccess: boolean }> =>
  axios
    .get(`/api/organizations/${organizationId}/access`)
    .then((response) => response.data);

export const getUserOrganizations = (): Promise<
  Array<z.infer<typeof Organization>>
> =>
  axios
    .get("/api/users/me/organizations")
    .then((response) =>
      response.data.map((org: any) => Organization.parse(org))
    );

export type UseCaseTrainingMaterialListItem = {
  id: string;
  filename: string;
  mimeType: string;
  createdAt: string;
};

export const listUseCaseTrainingMaterials = (
  organizationId: string,
  useCaseId: string
): Promise<UseCaseTrainingMaterialListItem[]> =>
  axios
    .get(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/ai/training-materials`
    )
    .then((response) => response.data);

export const uploadUseCaseTrainingMaterial = async (
  organizationId: string,
  useCaseId: string,
  file: File
): Promise<UseCaseTrainingMaterialListItem> => {
  const formData = new FormData();
  formData.append("file", file);

  return axios
    .post(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/ai/training-materials`,
      formData
    )
    .then((response) => response.data);
};

export const deleteUseCaseTrainingMaterial = (
  organizationId: string,
  useCaseId: string,
  materialId: string
): Promise<void> =>
  axios
    .delete(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/ai/training-materials/${materialId}`
    )
    .then(() => undefined);

type FieldBody = {
  name: string;
  field_type: string;
  required: boolean;
  options?: {
    choices?: string[];
    placeholder?: string;
    helpText?: string;
  } | null;
};

export const getObjects = (
  organizationId: string,
  useCaseId: string
): Promise<z.infer<typeof ObjectRecord>[]> =>
  axios
    .get(`/api/organizations/${organizationId}/use_cases/${useCaseId}/objects`)
    .then((response) => z.array(ObjectRecord).parse(response.data));

export const getFields = (
  organizationId: string,
  useCaseId: string
): Promise<z.infer<typeof FieldRecord>[]> =>
  axios
    .get(`/api/organizations/${organizationId}/use_cases/${useCaseId}/fields`)
    .then((response) => z.array(FieldRecord).parse(response.data));

export const getField = (
  organizationId: string,
  useCaseId: string,
  fieldId: string
): Promise<z.infer<typeof FieldRecord>> =>
  axios
    .get(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/fields/${fieldId}`
    )
    .then((response) => FieldRecord.parse(response.data));

export const createField = (
  organizationId: string,
  useCaseId: string,
  data: FieldBody
): Promise<z.infer<typeof FieldRecord>> =>
  axios
    .post(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/fields`,
      data
    )
    .then((response) => FieldRecord.parse(response.data));

export const updateField = (
  organizationId: string,
  useCaseId: string,
  fieldId: string,
  data: FieldBody
): Promise<z.infer<typeof FieldRecord>> =>
  axios
    .put(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/fields/${fieldId}`,
      data
    )
    .then((response) => FieldRecord.parse(response.data));

export const deleteField = (
  organizationId: string,
  useCaseId: string,
  fieldId: string
): Promise<void> =>
  axios
    .delete(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/fields/${fieldId}`
    )
    .then(() => undefined);

export const reorderFields = (
  organizationId: string,
  useCaseId: string,
  order: { id: string; order: number }[]
): Promise<void> =>
  axios
    .patch(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/fields/reorder`,
      order
    )
    .then(() => undefined);

// ---------- Datasources ----------

type DatasourceBody = {
  name: string;
  url: string;
  status: "draft" | "active" | "disabled";
  source_format: "json" | "geojson" | "wfs";
  auth_type: "none" | "api_key" | "basic" | "query_param";
  auth_header?: string | null;
  auth_credential?: string | null;
  data_path?: string | null;
  name_source_field?: string | null;
  external_id_source_field?: string | null;
  coordinate_type: "latlon" | "geojson";
  source_crs?: string | null;
  import_point_geometries: boolean;
  import_non_point_geometries: boolean;
  generate_point_from_non_point_geometries: boolean;
  lat_source_field?: string | null;
  lon_source_field?: string | null;
  geometry_source_field?: string | null;
  schedule?: string | null;
};

const base = (orgId: string, ucId: string) =>
  `/api/organizations/${orgId}/use_cases/${ucId}/datasources`;

export const getDatasources = (
  organizationId: string,
  useCaseId: string
): Promise<Datasource[]> =>
  axios
    .get(base(organizationId, useCaseId))
    .then((r) => z.array(Datasource).parse(r.data));

export const getDatasource = (
  organizationId: string,
  useCaseId: string,
  datasourceId: string
): Promise<Datasource> =>
  axios
    .get(`${base(organizationId, useCaseId)}/${datasourceId}`)
    .then((r) => Datasource.parse(r.data));

export const createDatasource = (
  organizationId: string,
  useCaseId: string,
  data: DatasourceBody
): Promise<Datasource> =>
  axios
    .post(base(organizationId, useCaseId), data)
    .then((r) => Datasource.parse(r.data));

export const updateDatasource = (
  organizationId: string,
  useCaseId: string,
  datasourceId: string,
  data: DatasourceBody
): Promise<Datasource> =>
  axios
    .put(`${base(organizationId, useCaseId)}/${datasourceId}`, data)
    .then((r) => Datasource.parse(r.data));

export const deleteDatasource = (
  organizationId: string,
  useCaseId: string,
  datasourceId: string
): Promise<void> =>
  axios
    .delete(`${base(organizationId, useCaseId)}/${datasourceId}`)
    .then(() => undefined);

export const testDatasource = (
  organizationId: string,
  useCaseId: string,
  datasourceId: string,
  config: {
    url: string;
    source_format: "json" | "geojson" | "wfs";
    auth_type: "none" | "api_key" | "basic" | "query_param";
    auth_header?: string | null;
    auth_credential?: string | null;
    data_path?: string | null;
  }
): Promise<DatasourceTestResult> =>
  axios
    .post(`${base(organizationId, useCaseId)}/${datasourceId}/test`, config)
    .then((r) => DatasourceTestResult.parse(r.data));

export const getDatasourceMappings = (
  organizationId: string,
  useCaseId: string,
  datasourceId: string
): Promise<DatasourceFieldMapping[]> =>
  axios
    .get(`${base(organizationId, useCaseId)}/${datasourceId}/mappings`)
    .then((r) => z.array(DatasourceFieldMapping).parse(r.data));

export const saveDatasourceMappings = (
  organizationId: string,
  useCaseId: string,
  datasourceId: string,
  mappings: { source_field: string; field_id: string }[]
): Promise<DatasourceFieldMapping[]> =>
  axios
    .post(`${base(organizationId, useCaseId)}/${datasourceId}/mappings`, {
      mappings,
    })
    .then((r) => z.array(DatasourceFieldMapping).parse(r.data));

export const runDatasource = (
  organizationId: string,
  useCaseId: string,
  datasourceId: string
): Promise<DatasourceRun> =>
  axios
    .post(`${base(organizationId, useCaseId)}/${datasourceId}/run`)
    .then((r) => DatasourceRun.parse(r.data));

export const getDatasourceRuns = (
  organizationId: string,
  useCaseId: string,
  datasourceId: string
): Promise<DatasourceRun[]> =>
  axios
    .get(`${base(organizationId, useCaseId)}/${datasourceId}/runs`)
    .then((r) => z.array(DatasourceRun).parse(r.data));
