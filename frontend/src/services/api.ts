import axios from "axios";

export const getCollectionSpots = async () =>
  axios.get("api/collection_spots").then((response) => response.data);
