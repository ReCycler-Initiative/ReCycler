export const getCollectionSpots = async () => {
  const response = await fetch("http://127.0.0.1:5000/api/collection_spots");
  return response.json();
};
