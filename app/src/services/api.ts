import {
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
  conversationId,
  message,
}: {
  conversationId: string;
  message: string;
}): Promise<string> =>
  axios
    .post("api/chat", { conversationId, message })
    .then((response) => response.data);

export const getLocations = (
  organizationId: string
): Promise<z.infer<typeof LocationGeoJsonCollection>> =>
  axios
    .get(`/api/organizations/${organizationId}/locations`)
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

export const getOrganizationById = (
  id: string
): Promise<z.infer<typeof Organization>> =>
  axios
    .get(`/api/organizations/${id}`)
    .then((response) => Organization.parse(response.data));
