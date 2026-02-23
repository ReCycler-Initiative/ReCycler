"use client";

import LocationsMap from "@/components/map/locations-map";
import { getLocations } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Result() {
  const params = useParams<{ id: string }>();
  const [geojson, setGeojson] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      let response = await getLocations(params.id);
      setGeojson(response);
    };
    fetchData();
  }, []);

  return <LocationsMap geoJson={geojson} />;
}
