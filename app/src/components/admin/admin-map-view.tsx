"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Map, {
  Marker,
  MapRef,
  NavigationControl,
  FullscreenControl,
  Source,
  Layer,
  FillLayer,
  LineLayer,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export interface LocationMarker {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
}

export interface AdminMapViewProps {
  locations: LocationMarker[];
  geoJson?: GeoJSON.FeatureCollection<GeoJSON.Geometry> | null;
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  addMode?: boolean;
  onMapClick?: (lngLat: { longitude: number; latitude: number }) => void;
  ghostMarker?: { longitude: number; latitude: number };
  draftMarker?: { longitude: number; latitude: number };
  /** When set, map is in polygon-draw mode: clicks add nodes to polygonNodes */
  polygonNodes?: [number, number][];
  onPolygonNodeAdd?: (lngLat: [number, number]) => void;
  className?: string;
}

// Bounding box to restrict map movement to Finland
const finlandBounds: [[number, number], [number, number]] = [
  [10.0, 54.0], // Southwest corner
  [40.0, 75.0], // Northeast corner
];

const areaFillLayer: FillLayer = {
  id: "admin-source-areas-fill",
  type: "fill",
  source: "admin-collection-shapes",
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

const areaOutlineLayer: LineLayer = {
  id: "admin-source-areas-line",
  type: "line",
  source: "admin-collection-shapes",
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

const shapeInteractionLayer: LineLayer = {
  id: "admin-source-shapes-hitbox",
  type: "line",
  source: "admin-collection-shapes",
  filter: [
    "any",
    ["==", ["geometry-type"], "Polygon"],
    ["==", ["geometry-type"], "MultiPolygon"],
    ["==", ["geometry-type"], "LineString"],
    ["==", ["geometry-type"], "MultiLineString"],
  ],
  paint: {
    "line-color": "#000000",
    "line-width": 16,
    "line-opacity": 0,
  },
};

const selectedAreaFillLayer: FillLayer = {
  id: "admin-selected-source-area-fill",
  type: "fill",
  source: "admin-collection-shapes",
  filter: [
    "any",
    ["==", ["geometry-type"], "Polygon"],
    ["==", ["geometry-type"], "MultiPolygon"],
  ],
  paint: {
    "fill-color": "#facc15",
    "fill-opacity": 0.42,
  },
};

const selectedPolygonOutlineLayer: LineLayer = {
  id: "admin-selected-source-polygon-line",
  type: "line",
  source: "admin-collection-shapes",
  filter: [
    "any",
    ["==", ["geometry-type"], "Polygon"],
    ["==", ["geometry-type"], "MultiPolygon"],
  ],
  paint: {
    "line-color": "#f59e0b",
    "line-width": 5,
    "line-opacity": 1,
  },
};

const selectedLineHighlightLayer: LineLayer = {
  id: "admin-selected-source-line",
  type: "line",
  source: "admin-selected-shapes",
  filter: [
    "any",
    ["==", ["geometry-type"], "LineString"],
    ["==", ["geometry-type"], "MultiLineString"],
  ],
  paint: {
    "line-color": "#f59e0b",
    "line-width": 7,
    "line-opacity": 1,
  },
};

function buildShapeCollection(
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry>
): GeoJSON.FeatureCollection<GeoJSON.Geometry> {
  return {
    type: "FeatureCollection",
    features: geoJson.features.flatMap((feature) => {
      const sourceGeometry = (feature.properties as Record<string, unknown> | undefined)
        ?.source_geometry as GeoJSON.Geometry | undefined;

      if (!sourceGeometry || sourceGeometry.type === "Point") {
        return [];
      }

      return [{
        type: "Feature" as const,
        geometry: sourceGeometry,
        properties: {
          id: feature.properties?.id,
          name: feature.properties?.name,
        },
      }];
    }),
  };
}

function buildSelectedShapeCollection(
  geoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry>,
  selectedId: string | null | undefined
): GeoJSON.FeatureCollection<GeoJSON.Geometry> | null {
  if (!selectedId) return null;

  const selectedFeatures = buildShapeCollection(geoJson).features.filter(
    (feature) => feature.properties?.id === selectedId
  );

  if (selectedFeatures.length === 0) return null;

  return {
    type: "FeatureCollection",
    features: selectedFeatures,
  };
}

export const AdminMapView = ({
  locations,
  geoJson,
  selectedId,
  onMarkerClick,
  addMode,
  onMapClick,
  ghostMarker,
  draftMarker,
  polygonNodes,
  onPolygonNodeAdd,
  className,
}: AdminMapViewProps) => {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const locationsRef = useRef(locations);
  locationsRef.current = locations;
  const prevSelectedId = useRef<string | null | undefined>(null);
  const prevDraftMarker = useRef<{ longitude: number; latitude: number } | undefined>(undefined);
  const lastAutoFitKeyRef = useRef<string | null>(null);
  const shapeGeoJson = geoJson ? buildShapeCollection(geoJson) : null;
  const selectedShapeGeoJson = geoJson
    ? buildSelectedShapeCollection(geoJson, selectedId)
    : null;

  // Build a GeoJSON FeatureCollection for the in-progress polygon draw.
  // When >= 3 nodes: render a closed polygon outline + semi-transparent fill.
  // When 2 nodes: render an open line.
  // Always render node circles.
  const polygonDrawGeoJson: GeoJSON.FeatureCollection<GeoJSON.Geometry> | null =
    polygonNodes && polygonNodes.length >= 2
      ? {
          type: "FeatureCollection",
          features: [
            polygonNodes.length >= 3
              ? {
                  // Closed ring: append first node to close visually
                  type: "Feature" as const,
                  geometry: {
                    type: "Polygon" as const,
                    coordinates: [[...polygonNodes, polygonNodes[0]]],
                  },
                  properties: {},
                }
              : {
                  type: "Feature" as const,
                  geometry: {
                    type: "LineString" as const,
                    coordinates: polygonNodes,
                  },
                  properties: {},
                },
            ...polygonNodes.map((coord) => ({
              type: "Feature" as const,
              geometry: { type: "Point" as const, coordinates: coord },
              properties: {},
            })),
          ],
        }
      : polygonNodes && polygonNodes.length === 1
      ? {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature" as const,
              geometry: { type: "Point" as const, coordinates: polygonNodes[0] },
              properties: {},
            },
          ],
        }
      : null;

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.getCanvas().style.cursor = (addMode || !!polygonNodes) ? "crosshair" : "";
    return () => {
      map.getCanvas().style.cursor = "";
    };
  }, [addMode, polygonNodes]);

  // Fly to selected location only when selectedId actually changes
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    if (selectedId === prevSelectedId.current) return;
    prevSelectedId.current = selectedId;

    const location = locationsRef.current.find((l) => l.id === selectedId);
    if (location) {
      mapRef.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 14,
        duration: 500,
      });
    }
  }, [selectedId]);

  // Fly to draft marker only on first placement
  useEffect(() => {
    if (!draftMarker || !mapRef.current) return;
    if (prevDraftMarker.current) { prevDraftMarker.current = draftMarker; return; }
    prevDraftMarker.current = draftMarker;
    mapRef.current.flyTo({
      center: [draftMarker.longitude, draftMarker.latitude],
      zoom: 15,
      duration: 400,
    });
  }, [draftMarker]);

  // Auto-fit map to the current locations so the view isn't stuck on all of Finland.
  useEffect(() => {
    if (selectedId) return;
    if (!mapLoaded) return;

    const map = mapRef.current?.getMap();
    if (!map) return;

    const points = locations
      .map((l) => [l.longitude, l.latitude] as const)
      .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));

    if (points.length === 0) return;

    let minLng = points[0][0];
    let maxLng = points[0][0];
    let minLat = points[0][1];
    let maxLat = points[0][1];
    for (const [lng, lat] of points) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    const key = `${points.length}:${minLng.toFixed(6)},${minLat.toFixed(6)}:${maxLng.toFixed(6)},${maxLat.toFixed(6)}`;
    if (lastAutoFitKeyRef.current === key) return;
    lastAutoFitKeyRef.current = key;

    if (points.length === 1) {
      mapRef.current?.flyTo({
        center: [points[0][0], points[0][1]],
        zoom: 14,
        duration: 500,
      });
      return;
    }

    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 60,
        duration: 500,
        maxZoom: 16,
      }
    );
  }, [locations, selectedId, mapLoaded]);

  const handleMarkerClick = useCallback(
    (id: string) => {
      onMarkerClick?.(id);
    },
    [onMarkerClick]
  );

  return (
    <div className={cn("h-full w-full", className)}>
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 24.94,
          latitude: 64.0,
          zoom: 5,
        }}
        mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE_DETAIL as string}
        interactiveLayerIds={[
          "admin-source-shapes-hitbox",
          "admin-source-areas-fill",
          "admin-source-areas-line",
          "admin-selected-source-area-fill",
          "admin-selected-source-polygon-line",
          "admin-selected-source-line",
        ]}
        onLoad={() => setMapLoaded(true)}
        maxBounds={finlandBounds}
        onClick={(e) => {
          // Polygon draw mode: add a node
          if (polygonNodes !== undefined) {
            onPolygonNodeAdd?.([e.lngLat.lng, e.lngLat.lat]);
            return;
          }

          const clickedShape = e.features?.find((feature) => {
            const featureId = feature.properties?.id;
            return typeof featureId === "string" && featureId.length > 0;
          });

          if (clickedShape && !addMode) {
            onMarkerClick?.(clickedShape.properties!.id as string);
            return;
          }

          if (!addMode) return;
          onMapClick?.({ longitude: e.lngLat.lng, latitude: e.lngLat.lat });
        }}
        style={{ width: "100%", height: "100%", borderRadius: "0.75rem" }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {shapeGeoJson && shapeGeoJson.features.length > 0 && (
          <Source id="admin-collection-shapes" type="geojson" data={shapeGeoJson}>
            <Layer {...shapeInteractionLayer} />
            <Layer {...areaFillLayer} />
            <Layer {...areaOutlineLayer} />
          </Source>
        )}

        {selectedShapeGeoJson && selectedShapeGeoJson.features.length > 0 && (
          <Source id="admin-selected-shapes" type="geojson" data={selectedShapeGeoJson}>
            <Layer
              {...selectedAreaFillLayer}
              source="admin-selected-shapes"
            />
            <Layer
              {...selectedPolygonOutlineLayer}
              source="admin-selected-shapes"
            />
            <Layer {...selectedLineHighlightLayer} />
          </Source>
        )}

        {polygonDrawGeoJson && (
          <Source id="admin-polygon-draw" type="geojson" data={polygonDrawGeoJson}>
            {/* Semi-transparent fill when polygon is closed (>= 3 nodes) */}
            <Layer
              id="admin-polygon-draw-fill"
              type="fill"
              source="admin-polygon-draw"
              filter={["==", ["geometry-type"], "Polygon"]}
              paint={{ "fill-color": "#f59e0b", "fill-opacity": 0.15 }}
            />
            {/* Outline for both line (2 nodes) and polygon (>= 3 nodes) */}
            <Layer
              id="admin-polygon-draw-line"
              type="line"
              source="admin-polygon-draw"
              filter={["any", ["==", ["geometry-type"], "LineString"], ["==", ["geometry-type"], "Polygon"]]}
              paint={{ "line-color": "#f59e0b", "line-width": 2, "line-dasharray": [2, 2] }}
            />
            <Layer
              id="admin-polygon-draw-nodes"
              type="circle"
              source="admin-polygon-draw"
              filter={["==", ["geometry-type"], "Point"]}
              paint={{ "circle-radius": 5, "circle-color": "#f59e0b", "circle-stroke-width": 2, "circle-stroke-color": "#fff" }}
            />
          </Source>
        )}

        {draftMarker && (
          <Marker
            longitude={draftMarker.longitude}
            latitude={draftMarker.latitude}
            anchor="bottom"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white border-2 border-emerald-600 scale-125 shadow-lg">
              <MapPin className="h-6 w-6" />
            </div>
          </Marker>
        )}

        {ghostMarker && (
          <Marker
            longitude={ghostMarker.longitude}
            latitude={ghostMarker.latitude}
            anchor="bottom"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-gray-500 bg-gray-300 text-gray-600 opacity-80">
              <MapPin className="h-4 w-4" />
            </div>
          </Marker>
        )}

        {locations.map((location) => (
          <Marker
            key={location.id}
            longitude={location.longitude}
            latitude={location.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(location.id);
            }}
          >
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all",
                selectedId === location.id
                  ? "bg-primary text-primary-foreground scale-125 shadow-lg"
                  : "bg-white text-gray-700 border-2 border-gray-300 hover:border-primary hover:scale-110"
              )}
            >
              <MapPin className="h-4 w-4" />
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
};
