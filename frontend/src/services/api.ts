import { ChatResponse, Material } from "@/types";
import axios from "axios";

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

export const getLocations = () =>
  axios
    .get("api/organizations/3c546d07-7ed4-425f-bb2f-a7fb4541de40/locations")
    .then((response) => response.data);
