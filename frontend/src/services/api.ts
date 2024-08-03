export const getCollectionSpots = async () => {
  const response = await fetch(`api/collection_spots`);
  return response.json();
};
