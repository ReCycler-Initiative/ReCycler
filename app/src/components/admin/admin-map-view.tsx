"use client";

import { useEffect, useRef, useCallback } from "react";
import Map, {
  Marker,
  MapRef,
  NavigationControl,
  FullscreenControl,
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
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  className?: string;
}

// Bounding box to restrict map movement to Finland
const finlandBounds: [[number, number], [number, number]] = [
  [10.0, 54.0], // Southwest corner
  [40.0, 75.0], // Northeast corner
];

export const AdminMapView = ({
  locations,
  selectedId,
  onMarkerClick,
  className,
}: AdminMapViewProps) => {
  const mapRef = useRef<MapRef>(null);

  // Fly to selected location when it changes
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;

    const location = locations.find((l) => l.id === selectedId);
    if (location) {
      mapRef.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 14,
        duration: 500,
      });
    }
  }, [selectedId, locations]);

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
        maxBounds={finlandBounds}
        style={{ width: "100%", height: "100%", borderRadius: "0.75rem" }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

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
