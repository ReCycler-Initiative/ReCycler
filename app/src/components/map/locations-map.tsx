"use client";

import GeocoderControl from "@/components/geocoder-control";
import { MapStyleControl } from "@/components/map-style-control";
import { MaterialsPageContent } from "@/components/materials-page";
import { SelectedMaterialsControl } from "@/components/selected-materials-control";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import OnboardingHint from "@/components/ui/onboarding-hint";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { Material } from "@/types";
import { useUser } from "@auth0/nextjs-auth0";
import { Loader2Icon, MapPinned } from "lucide-react";
import { GeolocateControl as TGeolocateControl } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  getLocalizedMaterialName,
  localizeMaterialNameCandidate,
  localizeMaterials,
} from "@/lib/material-translations";
import {
  usePathname,
  useParams,
  useRouter,
  useSearchParams
} from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFields } from "@/services/api";
import Map, {
  CircleLayer,
  FullscreenControl,
  GeolocateControl,
  Layer,
  MapboxGeoJSONFeature,
  MapRef,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
  SymbolLayer,
  useMap,
} from "react-map-gl";

// Custom icon loader for collection points
const CollectionPointIcon = () => {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;

    const loadIcon = () => {
      // Load icon only once per style
      if (map.hasImage("collection-point")) return;
      map.loadImage("/images/collection-point.png", (error, image) => {
        if (error) throw error;
        if (!image) return;
        if (!map.hasImage("collection-point")) {
          map.addImage("collection-point", image);
        }
      });
    };

    const onStyleImageMissing = () => loadIcon();

    loadIcon();
    map.on("styleimagemissing", onStyleImageMissing);
    return () => {
      map.off("styleimagemissing", onStyleImageMissing);
    };
  }, [map]);

  return null;
};

const getLocalizedOpeningHours = (
  properties: Record<string, unknown> | undefined,
  locale: string
) => {
  if (!properties) return undefined;

  if (locale === "en") {
    return (properties.opening_hours_en as string | undefined) ??
      (properties.opening_hours_fi as string | undefined);
  }

  return (properties.opening_hours_fi as string | undefined) ??
    (properties.opening_hours_en as string | undefined);
};

const getLocalizedDescription = (
  properties: Record<string, unknown> | undefined,
  locale: string
) => {
  if (!properties) return undefined;

  if (locale === "en") {
    return (properties.description_en as string | undefined) ??
      (properties.additional_details as string | undefined) ??
      (properties.description_fi as string | undefined);
  }

  return (properties.description_fi as string | undefined) ??
    (properties.additional_details as string | undefined) ??
    (properties.description_en as string | undefined);
};

// Bounding box to restrict map movement to Finland
const finlandBounds = [
  [10.0, 54.0], // Southwest corner
  [40.0, 75.0], // Northeast corner
];

// Style for rendering point features (icons)
const layerStyle: SymbolLayer = {
  id: "point",
  type: "symbol",
  source: "collection_spots",
  layout: {
    "icon-image": "collection-point",
    "icon-size": 0.1,
  },
};

// Style for highlighting features that match all selected materials
const highlighLayer: CircleLayer = {
  id: "point2",
  type: "circle",
  source: "collection_spots",
  paint: {
    "circle-color": "#f1f075",
    "circle-radius": [
      "case",
      ["==", ["get", "has_all_materials"], true],
      25,
      0,
    ],
    "circle-stroke-width": 1,
    "circle-stroke-color": "#FFD700",
    "circle-stroke-opacity": 1,
  },
};

// Style for cluster circles
const clusters: CircleLayer = {
  id: "clusters",
  type: "circle",
  source: "collection_spots",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#f28cb1",
      100,
      "#f1f075",
      750,
      "#51bbd6",
    ],
    "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-opacity": 0.5,
  },
};

// Style for displaying cluster counts (numbers inside clusters)
const clusterCount: SymbolLayer = {
  id: "cluster-count",
  type: "symbol",
  source: "collection_spots",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-size": 12,
  },
};

// Colored dot in top-right of icon: green=open, orange=closing soon, gray=closed
const openStatusLayer: CircleLayer = {
  id: "open-status",
  type: "circle",
  source: "collection_spots",
  filter: ["all", ["!", ["has", "point_count"]], ["!=", ["get", "open_status"], null]],
  paint: {
    "circle-color": [
      "case",
      ["==", ["get", "open_status"], "open"], "#22c55e",
      ["==", ["get", "open_status"], "closing_soon"], "#f97316",
      "#9ca3af",
    ],
    "circle-radius": 5,
    "circle-stroke-width": 1.5,
    "circle-stroke-color": "#ffffff",
    "circle-translate": [16, -16],
  },
};

const areaFillLayer: Layer = {
  id: "source-areas-fill",
  type: "fill",
  source: "collection_shapes",
  filter: [
    "any",
    ["==", ["geometry-type"], "Polygon"],
    ["==", ["geometry-type"], "MultiPolygon"],
  ],
  paint: {
    "fill-color": "#ef4444",
    "fill-opacity": 0.2,
  },
};

const areaOutlineLayer: Layer = {
  id: "source-areas-line",
  type: "line",
  source: "collection_shapes",
  filter: [
    "any",
    ["==", ["geometry-type"], "Polygon"],
    ["==", ["geometry-type"], "MultiPolygon"],
    ["==", ["geometry-type"], "LineString"],
    ["==", ["geometry-type"], "MultiLineString"],
  ],
  paint: {
    "line-color": "#b91c1c",
    "line-width": 3,
    "line-opacity": 0.9,
  },
};

const selectedAreaFillLayer: Layer = {
  id: "selected-source-areas-fill",
  type: "fill",
  source: "selected_shapes",
  filter: [
    "any",
    ["==", ["geometry-type"], "Polygon"],
    ["==", ["geometry-type"], "MultiPolygon"],
  ],
  paint: {
    "fill-color": "#facc15",
    "fill-opacity": 0.38,
  },
};

const selectedAreaOutlineLayer: Layer = {
  id: "selected-source-areas-line",
  type: "line",
  source: "selected_shapes",
  filter: [
    "any",
    ["==", ["geometry-type"], "Polygon"],
    ["==", ["geometry-type"], "MultiPolygon"],
    ["==", ["geometry-type"], "LineString"],
    ["==", ["geometry-type"], "MultiLineString"],
  ],
  paint: {
    "line-color": "#f59e0b",
    "line-width": 5,
    "line-opacity": 1,
  },
};

const selectedPointLayer: CircleLayer = {
  id: "selected-point",
  type: "circle",
  source: "selected_point",
  paint: {
    "circle-color": "#fde68a",
    "circle-radius": 18,
    "circle-stroke-width": 3,
    "circle-stroke-color": "#f59e0b",
    "circle-opacity": 0.95,
  },
};

type PopupField = { id: string; name: string; field_type: string; order: number | null; value: string[] };

const parseFeatureFields = (rawFields: unknown): PopupField[] => {
  if (!rawFields) return [];
  if (Array.isArray(rawFields)) return rawFields as PopupField[];
  if (typeof rawFields !== "string") return [];
  try {
    const parsed = JSON.parse(rawFields);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Returns "open", "closing_soon" (within 60 min), "closed", or null (no data for today)
const getOpenStatus = (values: string[]): "open" | "closing_soon" | "closed" | null => {
  const DAY_KEYS = ["su", "ma", "ti", "ke", "to", "pe", "la"]; // JS getDay() order
  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const entry = values.find((v) => v.startsWith(dayKey + "|"));
  if (!entry) return null;
  const parts = entry.split("|");
  if (parts[1] === "closed") return "closed";
  if (parts.length < 3) return null;
  const [openH, openM] = parts[1].split(":").map(Number);
  const [closeH, closeM] = parts[2].split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  if (currentMinutes < openMinutes || currentMinutes >= closeMinutes) return "closed";
  if (currentMinutes >= closeMinutes - 60) return "closing_soon";
  return "open";
};

// Helper to filter features based on selected materials
const parseFeatureMaterials = (rawMaterials: unknown): Material[] => {
  if (!rawMaterials) {
    return [];
  }

  if (Array.isArray(rawMaterials)) {
    return rawMaterials as Material[];
  }

  if (typeof rawMaterials !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(rawMaterials);
    return Array.isArray(parsed) ? (parsed as Material[]) : [];
  } catch {
    return [];
  }
};

const filterFeaturesBySelectedMaterials = (
  materials: number[],
  collectionSpots: GeoJSON.FeatureCollection<GeoJSON.Geometry>
): GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
  if (materials.length === 0) {
    return collectionSpots;
  }

  const features = collectionSpots.features
    ?.filter((feature: any) => {
      const featureMaterials = parseFeatureMaterials(
        feature.properties?.materials
      );
      return featureMaterials.some((material) =>
        materials.includes(material.code)
      );
    })
    .map((feature: any) => {
      const featureMaterials = parseFeatureMaterials(
        feature.properties?.materials
      );

      return {
        ...feature,
        properties: {
          ...feature.properties,
          has_all_materials: materials.every((material) =>
            featureMaterials.map((f) => f.code).includes(material)
          ),
        },
      };
    });

  return {
    ...collectionSpots,
    features,
  };
};

// Filter features by field-based selections — indices resolved to string values via fieldChoices
const filterFeaturesByFieldValues = (
  fieldFilters: Record<string, number[]>,
  fieldChoices: Record<string, string[]>,
  collectionSpots: GeoJSON.FeatureCollection<GeoJSON.Geometry>
): GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
  const activeFilters = Object.entries(fieldFilters).filter(([, indices]) => indices.length > 0);
  if (activeFilters.length === 0) return collectionSpots;

  const features = collectionSpots.features?.filter((feature: any) => {
    const fields = parseFeatureFields(feature.properties?.fields);
    return activeFilters.every(([fieldId, selectedIndices]) => {
      const field = fields.find((f) => f.id === fieldId);
      if (!field) return false;
      const choices = fieldChoices[fieldId] ?? [];
      const selectedValues = selectedIndices.map((i) => choices[i]).filter(Boolean);
      return selectedValues.some((v) => field.value.includes(v));
    });
  });

  return { ...collectionSpots, features };
};

// Apply both legacy material filter and field-based filter (AND between the two)
// Also computes is_open property from opening_hours fields for map marker styling
const applyAllFilters = (
  materials: number[],
  fieldFilters: Record<string, number[]>,
  fieldChoices: Record<string, string[]>,
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry>
): GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
  const afterMaterials = filterFeaturesBySelectedMaterials(materials, geoJson);
  const afterFields = filterFeaturesByFieldValues(fieldFilters, fieldChoices, afterMaterials);

  // Annotate each feature with is_open based on opening_hours field
  const features = afterFields.features?.map((feature: any) => {
    const fields = parseFeatureFields(feature.properties?.fields);
    const ohField = fields.find((f) => f.field_type === "opening_hours");
    const openStatus = ohField && ohField.value.length > 0 ? getOpenStatus(ohField.value) : null;
    return {
      ...feature,
      properties: {
        ...feature.properties,
        open_status: openStatus,
      },
    };
  });

  return { ...afterFields, features };
};

const buildShapeCollection = (
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry>
): GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
  const features = geoJson.features.flatMap((feature) => {
    const sourceGeometry = (feature.properties as Record<string, unknown> | undefined)
      ?.source_geometry as GeoJSON.Geometry | undefined;

    if (!sourceGeometry || sourceGeometry.type === "Point") {
      return [];
    }

    const pointGeometry = feature.geometry;
    if (pointGeometry.type !== "Point") {
      return [];
    }

    return [{
      type: "Feature" as const,
      geometry: sourceGeometry,
      properties: {
        ...feature.properties,
        popup_lon: pointGeometry.coordinates[0],
        popup_lat: pointGeometry.coordinates[1],
      },
    }];
  });

  return {
    type: "FeatureCollection",
    features,
  };
};

const buildSelectedShapeCollection = (
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry>,
  selectedId: string | null | undefined
): GeoJSON.FeatureCollection<GeoJSON.Geometry> | null => {
  if (!selectedId) return null;

  const features = buildShapeCollection(geoJson).features.filter(
    (feature) => feature.properties?.id === selectedId
  );

  if (features.length === 0) return null;

  return {
    type: "FeatureCollection",
    features,
  };
};

const buildSelectedPointCollection = (
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry>,
  selectedId: string | null | undefined
): GeoJSON.FeatureCollection<GeoJSON.Geometry> | null => {
  if (!selectedId) return null;

  const features = geoJson.features.filter(
    (feature) => feature.properties?.id === selectedId && feature.geometry.type === "Point"
  );

  if (features.length === 0) return null;

  return {
    type: "FeatureCollection",
    features,
  };
};

type PopupState = {
  feature: MapboxGeoJSONFeature;
  longitude: number;
  latitude: number;
};

type LocationsMapProps = {
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> | null;
};

export default function LocationsMap({ geoJson }: LocationsMapProps) {
  const { locale } = useLocale();
  const messages = useMessages();
  const { user } = useUser();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [styleLoaded, setStyleLoaded] = useState(true);
  const [details, setDetails] = useState<PopupState | null>(null);
  const [mapStyle, setStyle] = useState<"detail" | "satellite">("detail");
  const mapRef = useRef<MapRef>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ organizationId?: string; useCaseId?: string }>();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const currentResultsHref = searchParamsKey ? `${pathname}?${searchParamsKey}` : pathname;
  const materialsParam = searchParams.get("materials") ?? "";
  const selectedMaterials = useMemo(
    () => materialsParam.split(",").filter(Boolean).map((code) => +code),
    [materialsParam]
  );

  // Parse field_<fieldId> URL params into a Record (values are indices)
  const selectedFieldFilters = useMemo<Record<string, number[]>>(() => {
    const filters: Record<string, number[]> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith("field_")) {
        const fieldId = key.slice("field_".length);
        filters[fieldId] = value.split(",").filter(Boolean).map(Number);
      }
    });
    return filters;
  }, [searchParams]);

  const { data: fieldsData } = useQuery({
    queryKey: ["fields", params.organizationId, params.useCaseId],
    queryFn: () => getFields(params.organizationId!, params.useCaseId!),
    enabled: !!(params.organizationId && params.useCaseId),
    staleTime: Infinity,
  });

  const fieldChoices: Record<string, string[]> = {};
  for (const f of fieldsData ?? []) {
    if (f.field_type === "multi_select") {
      fieldChoices[f.id] = f.options?.choices ?? [];
    }
  }

  const [showMaterials, setShowMaterials] = useState(false);
  const [pendingResultsHref, setPendingResultsHref] = useState(currentResultsHref);
  const previousSearchParamsKey = useRef(searchParamsKey);
  const selectedLocationId =
    typeof details?.feature.properties?.id === "string"
      ? details.feature.properties.id
      : null;
  const filteredGeoJson = useMemo(() => {
    if (!geoJson) return null;
    return applyAllFilters(
      selectedMaterials,
      selectedFieldFilters,
      fieldChoices,
      geoJson
    );
  }, [fieldChoices, geoJson, selectedFieldFilters, selectedMaterials]);
  const shapeGeoJson = useMemo(() => {
    if (!filteredGeoJson) return null;
    return buildShapeCollection(filteredGeoJson);
  }, [filteredGeoJson]);
  const selectedShapeGeoJson = useMemo(() => {
    if (!filteredGeoJson) return null;
    return buildSelectedShapeCollection(filteredGeoJson, selectedLocationId);
  }, [filteredGeoJson, selectedLocationId]);
  const selectedPointGeoJson = useMemo(() => {
    if (!filteredGeoJson) return null;
    return buildSelectedPointCollection(filteredGeoJson, selectedLocationId);
  }, [filteredGeoJson, selectedLocationId]);

  useEffect(() => {
    setPendingResultsHref(currentResultsHref);
  }, [currentResultsHref]);

  useEffect(() => {
    if (previousSearchParamsKey.current !== searchParamsKey) {
      setShowMaterials(false);
      previousSearchParamsKey.current = searchParamsKey;
    }
  }, [searchParamsKey]);

  const geolocateControlRef = useRef<TGeolocateControl>(null);

  // Track whether we've issued the first programmatic trigger
  const initialGeolocate = useRef(true); // first camera ease only

  const onMapLoad = useCallback(() => {
    const map = mapRef.current!;
    const showPointer = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const hidePointer = () => {
      map.getCanvas().style.cursor = "";
    };

    const onStyleLoad = () => setStyleLoaded(true);

    map.on("mouseenter", "point", showPointer);
    map.on("mouseleave", "point", hidePointer);
    map.on("mouseenter", "source-areas-fill", showPointer);
    map.on("mouseleave", "source-areas-fill", hidePointer);
    map.on("mouseenter", "source-areas-line", showPointer);
    map.on("mouseleave", "source-areas-line", hidePointer);
    map.on("style.load", onStyleLoad);

    geolocateControlRef.current?.trigger();
    setMapLoaded(true);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("map-loaded"));
    }
  }, []);

  // Camera: do a single initial ease to user position, then let GeolocateControl own the camera
  const handleGeolocateChange = useCallback((position: GeolocationPosition) => {
    if (!initialGeolocate.current) return;
    mapRef.current?.easeTo({
      center: [position.coords.longitude, position.coords.latitude],
      zoom: 15,
      duration: 500,
    });
    initialGeolocate.current = false;
  }, []);

  // On unmount, notify TitleBar
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("map-unloaded"));
      }
    };
  }, []);

  return (
    <Suspense>
      <div className="flex flex-1">
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: 24.94,
            latitude: 64.0,
            zoom: 4,
          }}
          onLoad={onMapLoad}
          mapStyle={
            mapStyle === "detail"
              ? (process.env.NEXT_PUBLIC_MAPBOX_STYLE_DETAIL as string)
              : (process.env.NEXT_PUBLIC_MAPBOX_STYLE_SATELLITE as string)
          }
          interactiveLayerIds={[
            "point",
            "source-areas-fill",
            "source-areas-line",
            "selected-source-areas-fill",
            "selected-source-areas-line",
          ]}
          onClick={(e) => {
            if (e.features) {
              const feature = e.features[0];
              if (!feature?.properties?.cluster && feature?.geometry) {
                const popupLon = Number(feature.properties?.popup_lon);
                const popupLat = Number(feature.properties?.popup_lat);

                if (feature.geometry.type === "Point") {
                  setDetails({
                    feature,
                    longitude: feature.geometry.coordinates[0],
                    latitude: feature.geometry.coordinates[1],
                  });
                } else if (Number.isFinite(popupLon) && Number.isFinite(popupLat)) {
                  setDetails({
                    feature,
                    longitude: popupLon,
                    latitude: popupLat,
                  });
                }
              }
            }
          }}
          maxBounds={finlandBounds as any}
        >
          <MapStyleControl
            onToggle={(selected) => {
              // Toggle style and force styleLoaded=false so we know when it finishes
              setStyleLoaded(false);
              setStyle(selected ? "satellite" : "detail");
            }}
            selected={mapStyle === "satellite"}
          />

          <GeolocateControl
            ref={geolocateControlRef}
            onGeolocate={handleGeolocateChange}
            // IMPORTANT: do not flip tracking off here; Mapbox emits End on minor interactions
            onTrackUserLocationEnd={() => {
              // keep UI state; let the user decide to turn tracking off explicitly
            }}
            positionOptions={{ enableHighAccuracy: true }}
            position="bottom-right"
            trackUserLocation
            showUserHeading
          />

          <OnboardingHint />

          <SelectedMaterialsControl
            amount={
              selectedMaterials.length +
              Object.values(selectedFieldFilters).reduce((sum, vals) => sum + vals.length, 0)
            }
            onClick={() => setShowMaterials(true)}
          />
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />
          <ScaleControl position="bottom-left" />
          <GeocoderControl
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
            position="top-left"
            placeholder={messages.map.searchPlaceholder}
            bbox={[19.0, 59.0, 32.0, 71.0]}
          />

          {filteredGeoJson && (
            <>
              {styleLoaded && (
                <>
                  {shapeGeoJson && shapeGeoJson.features.length > 0 && (
                    <Source id="collection_shapes" type="geojson" data={shapeGeoJson}>
                      <Layer {...areaFillLayer} />
                      <Layer {...areaOutlineLayer} />
                    </Source>
                  )}
                  {selectedShapeGeoJson && selectedShapeGeoJson.features.length > 0 && (
                    <Source id="selected_shapes" type="geojson" data={selectedShapeGeoJson}>
                      <Layer {...selectedAreaFillLayer} />
                      <Layer {...selectedAreaOutlineLayer} />
                    </Source>
                  )}
                  {selectedPointGeoJson && selectedPointGeoJson.features.length > 0 && (
                    <Source id="selected_point" type="geojson" data={selectedPointGeoJson}>
                      <Layer {...selectedPointLayer} />
                    </Source>
                  )}
                  <Source
                    id="collection_spots"
                    type="geojson"
                    data={filteredGeoJson}
                    cluster
                    clusterMaxZoom={14}
                    clusterRadius={50}
                  >
                    <Layer {...highlighLayer} />
                    <Layer {...layerStyle} />
                    <Layer {...openStatusLayer} />
                    <Layer {...clusters} />
                    <Layer {...clusterCount} />
                  </Source>
                </>
              )}
              <CollectionPointIcon />
              {details && (
                <Popup
                  key={new Date().getTime()}
                  longitude={details.longitude}
                  latitude={details.latitude}
                  onClose={() => setDetails(null)}
                  anchor="bottom"
                  maxWidth="360px"
                  className="[&_.mapboxgl-popup-content]:min-w-52 [&_.mapboxgl-popup-content]:p-0! [&_.mapboxgl-popup-close-button]:hidden"
                >
                  {(() => {
                    const openingHours = getLocalizedOpeningHours(
                      details.feature.properties as Record<string, unknown> | undefined,
                      locale
                    );
                    const description = getLocalizedDescription(
                      details.feature.properties as Record<string, unknown> | undefined,
                      locale
                    );

                    return (
                      <>
                  <div className="p-3 border-b">
                    <h2 className="text-base font-semibold mb-1">
                      {details.feature.properties?.name}
                    </h2>
                    {(details.feature.properties?.address || details.feature.properties?.postal_code || details.feature.properties?.post_office) && (
                      <div className="flex gap-2 justify-between">
                        <address className="text-sm text-gray-900 not-italic flex flex-col leading-5 ">
                          {details.feature.properties?.address}
                          <span>
                            {details.feature.properties?.postal_code}{" "}
                            {details.feature.properties?.post_office}
                          </span>
                        </address>
                      </div>
                    )}
                  </div>
                  {openingHours && (
                    <div className="p-3 border-b">
                      <h3 className="text-xs font-medium text-muted-foreground mb-1">
                        {messages.mapPopup.openingHours}
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: openingHours,
                        }}
                      />
                    </div>
                  )}
                  {parseFeatureMaterials(details.feature.properties?.materials).length > 0 && (
                    <div className="p-3 border-b">
                      <h3 className="text-xs font-medium text-muted-foreground mb-1">
                        {messages.mapPopup.materials}
                      </h3>
                      <ul className="text-sm leading-6 list-disc columns-2">
                        {localizeMaterials(parseFeatureMaterials(details.feature.properties?.materials), locale)
                          .sort((a: Material, b: Material) =>
                            a.name.localeCompare(b.name)
                          )
                          .map((material: Material) => (
                            <li key={material.code} className="ml-4">
                              {material.name}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                  {description && (
                    <div className="p-3 border-b">
                      <h3 className="text-xs font-medium text-muted-foreground mb-1">
                        {messages.mapPopup.additionalDetails}
                      </h3>
                      <p className="text-sm whitespace-pre-line">{description}</p>
                    </div>
                  )}
                  {(() => {
                    const ohField = parseFeatureFields(details.feature.properties?.fields)
                      .find((f) => f.field_type === "opening_hours");
                    if (!ohField || ohField.value.length === 0) return null;
                    const status = getOpenStatus(ohField.value);
                    if (status === null) return null;
                    const cfg = {
                      open: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50", label: "Auki nyt" },
                      closing_soon: { dot: "bg-orange-400", text: "text-orange-700", bg: "bg-orange-50", label: "Sulkeutuu pian" },
                      closed: { dot: "bg-gray-400", text: "text-gray-500", bg: "bg-gray-50", label: "Suljettu" },
                    }[status];
                    return (
                      <div className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-b ${cfg.text} ${cfg.bg}`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                        {cfg.label}
                      </div>
                    );
                  })()}
                  {parseFeatureFields(details.feature.properties?.fields)
                    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
                    .filter((field) => field.value.length > 0)
                    .map((field) => (
                      <div key={field.id} className="p-3 border-b">
                        <h3 className="text-xs font-medium text-muted-foreground mb-1">{field.name}</h3>
                        {field.field_type === "multi_select" ? (
                          <ul className="text-sm leading-6 list-disc columns-2">
                            {[...field.value]
                              .sort((a, b) => a.localeCompare(b, "fi"))
                              .map((v) => (
                                <li key={v} className="ml-4">{localizeMaterialNameCandidate(v, locale)}</li>
                              ))}
                          </ul>
                        ) : field.field_type === "address" ? (
                          <div className="text-sm leading-5">
                            {field.value[0] && <p>{field.value[0]}</p>}
                            {(field.value[1] || field.value[2]) && (
                              <p>
                                {[field.value[1], field.value[2]].filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                        ) : field.field_type === "opening_hours" ? (
                          <div className="text-sm space-y-0.5">
                            {(() => {
                              const DAY_LABELS: Record<string, string> = {
                                ma: "Ma", ti: "Ti", ke: "Ke", to: "To", pe: "Pe", la: "La", su: "Su",
                              };
                              const DAY_ORDER = ["ma","ti","ke","to","pe","la","su"];
                              const parsed = field.value.reduce<Record<string, string | null>>((acc, raw) => {
                                const parts = raw.split("|");
                                if (parts.length === 2 && parts[1] === "closed") acc[parts[0]] = null;
                                else if (parts.length === 3) acc[parts[0]] = `${parts[1]}–${parts[2]}`;
                                return acc;
                              }, {});
                              return DAY_ORDER.filter((k) => k in parsed).map((k) => (
                                <div key={k} className="flex gap-2">
                                  <span className="w-6 shrink-0 text-muted-foreground">{DAY_LABELS[k]}</span>
                                  <span>{parsed[k] ?? "Suljettu"}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        ) : (
                          <p className="text-sm">{field.value.map((value) => localizeMaterialNameCandidate(value, locale)).join(", ")}</p>
                        )}
                      </div>
                    ))}
                  <div className="text-center border-t">
                    <Button
                      className="text-[#ff1312] text-sm w-full"
                      variant="ghost"
                      asChild
                    >
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${details.latitude},${details.longitude}`}
                        target="_blank"
                      >
                        <span>{messages.mapPopup.openInGoogleMaps}</span>
                        <MapPinned className="ml-2" size={18} />
                      </a>
                    </Button>
                  </div>
                      </>
                    );
                  })()}
                </Popup>
              )}
            </>
          )}
        </Map>

        {!mapLoaded && (
          <div className="fixed flex inset-0 items-center justify-center flex-col gap-6 text-black">
            <Loader2Icon className="animate-spin" />
            {messages.pageLoading.loadingMapLocations}
          </div>
        )}

        {/* Drawer for selecting materials */}
        <Drawer
          open={showMaterials}
          onOpenChange={(open) => {
            if (open) {
              setPendingResultsHref(currentResultsHref);
              setShowMaterials(true);
              return;
            }

            setShowMaterials(false);
            if (pendingResultsHref !== currentResultsHref) {
              router.push(pendingResultsHref);
            }
          }}
        >
          <DrawerContent>
            <DrawerHeader className="sr-only">
              <DrawerTitle>{messages.materials.pageTitle}</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[calc(80vh-2rem)] overflow-y-auto pb-4">
              <MaterialsPageContent
                initialSelectedCodes={selectedMaterials}
                initialSelectedFieldValues={selectedFieldFilters}
                organizationId={params.organizationId}
                useCaseId={params.useCaseId}
                resultsBasePath={pathname}
                embedded
                onResultsNavigate={() => setShowMaterials(false)}
                onResultsHrefChange={setPendingResultsHref}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </Suspense>
  );
}
