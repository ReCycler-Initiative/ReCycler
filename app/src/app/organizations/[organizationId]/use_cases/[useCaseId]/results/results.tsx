"use client";

import LocationsMap from "@/components/map/locations-map";
import { getLocations, getUseCaseById } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UseCaseMapSettings } from "@/types";

export default function Result() {
  const params = useParams<{ organizationId: string; useCaseId: string }>();
  const organizationId = params.organizationId;
  const useCaseId = params.useCaseId;
  const [geojson, setGeojson] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);
  const [mapSettings, setMapSettings] =
    useState<UseCaseMapSettings | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [locationsResponse, useCaseResponse] = await Promise.all([
        getLocations(organizationId, useCaseId),
        getUseCaseById(organizationId, useCaseId),
      ]);
      setGeojson(locationsResponse);
      setMapSettings(useCaseResponse.map_settings ?? null);
    };
    fetchData();
  }, [organizationId, useCaseId]);

  return <LocationsMap geoJson={geojson} mapSettings={mapSettings} />;
}
