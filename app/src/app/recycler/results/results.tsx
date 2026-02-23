"use client";

import LocationsMap from "@/components/map/locations-map";
import { getCollectionSpots } from "@/services/api";
import { useEffect, useState } from "react";

export default function Result() {
  const [geojson, setGeojson] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);
  // Load collection points from API
  useEffect(() => {
    const fetchData = async () => {
      const response = await getCollectionSpots();
      setGeojson(response);
    };
    fetchData();
  }, []);

  return <LocationsMap geoJson={geojson} />;
}
