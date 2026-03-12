import {
  ChatResponse,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
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


