import {
  ChatResponse,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  FieldRecord,
  LocationDetail,
  LocationGeoJsonCollection,
  Material,
  Organization,
  UseCase,
} from "@/types";
import axios from "axios";
import { z } from "zod";

export const getCollectionSpots = async (): Promise<
  GeoJSON.FeatureCollection<GeoJSON.Geometry>
> => axios.get("/api/collection_spots").then((response) => response.data);

export const getMaterials = (): Promise<Array<Material>> =>
  axios.get("/api/materials").then((response) => response.data);

export const chat = async ({
  message,
  history,
  imageBase64,
  imageMimeType,
  organizationId,
  useCaseId,
}: {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  imageBase64?: string;
  imageMimeType?: string;
  organizationId?: string;
  useCaseId?: string;
}): Promise<ChatResponse> =>
  axios
    .post("/api/chat", { message, history, imageBase64, imageMimeType, useCaseId })
    .then((response) => response.data);

export const getLocations = (
  organizationId: string,
  useCaseId: string
): Promise<z.infer<typeof LocationGeoJsonCollection>> =>
  axios
    .get(`/api/organizations/${organizationId}/use_cases/${useCaseId}/locations`)
    .then((response) => response.data);

export const createLocation = (
  organizationId: string,
  useCaseId: string,
  body: { name: string; longitude: number; latitude: number }
): Promise<any> =>
  axios
    .post(`/api/organizations/${organizationId}/use_cases/${useCaseId}/locations`, body)
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
    .then((response) => response.data.map((org: any) => Organization.parse(org)));

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

export const getFields = (
  organizationId: string,
  useCaseId: string
): Promise<z.infer<typeof FieldRecord>[]> =>
  axios
    .get(
      `/api/organizations/${organizationId}/use_cases/${useCaseId}/fields`
    )
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

