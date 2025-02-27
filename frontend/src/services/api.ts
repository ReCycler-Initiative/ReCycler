import { LocationGeoJsonCollection, Material } from "@/types";
import axios from "axios";
import { z } from "zod";

export const getCollectionSpots = async (): Promise<
  GeoJSON.FeatureCollection<GeoJSON.Geometry>
> => axios.get("api/collection_spots").then((response) => response.data);

export const getMaterials = (): Promise<Array<Material>> =>
  axios.get("api/materials").then((response) => response.data);

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
