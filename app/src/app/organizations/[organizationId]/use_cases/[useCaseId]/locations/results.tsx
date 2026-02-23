"use client";

import LocationsMap from "@/components/map/locations-map";
import { getLocations } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Result() {
  const params = useParams<{ organizationId: string; useCaseId: string }>();
  const [geojson, setGeojson] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      let response = await getLocations(params.organizationId, params.useCaseId);
      setGeojson(response);
    };
    fetchData();
  }, []);

  return <LocationsMap geoJson={geojson} />;
}
