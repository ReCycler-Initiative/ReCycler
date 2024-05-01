"use client";

import { MapStyleControl } from "@/components/control-button";
import GeocoderControl from "@/components/geocoder-control";
import { getCollectionSpots } from "@/services/api";
import { cn } from "@/utils/shadcn";
import { Loader2Icon } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Map, {
  CircleLayer,
  FullscreenControl,
  GeolocateControl,
  Layer,
  MapRef,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
  SymbolLayer,
  useMap,
} from "react-map-gl";
import logo from "./recycler-logo.png";

const CollectionPointIcon = () => {
  const { current: map } = useMap();

  useEffect(() => {
    if (map) {
      const loadIcon = () => {
        map.loadImage("collection-point.png", (error, image) => {
          if (error) throw error;

          if (map.hasImage("collection-point")) {
            return;
          }

          if (image) {
            map.addImage("collection-point", image);
          }
        });
      };

      map.on("styleimagemissing", () => {
        loadIcon();
      });

      return () => {
        map.off("styleimagemissing", loadIcon);
      };
    }
  }, [map]);

  return null;
};

const layerStyle: SymbolLayer = {
  id: "point",
  type: "symbol",
  source: "collection_spots",
  layout: {
    "icon-image": "collection-point",
    "icon-size": 0.1,
  },
};

const clusters: CircleLayer = {
  id: "clusters",
  type: "circle",
  source: "collection_spots",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#73cff4",
      100,
      "#f1f075",
      750,
      "#f28cb1",
    ],
    "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-opacity": 0.5,
  },
};

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

// const unclustered: CircleLayer = {
//   id: "unclustered-point",
//   type: "circle",
//   source: "collection_spots",
//   filter: ["!", ["has", "point_count"]],
//   paint: {
//     "circle-color": "#11b4da",
//     "circle-radius": 4,
//     "circle-stroke-width": 1,
//     "circle-stroke-color": "#fff",
//   },
// };

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geojson, setGeojson] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [mapStyle, setStyle] = useState<"detail" | "satellite">("detail");
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getCollectionSpots();
      setGeojson(response);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      const showPointer = () => {
        map.getCanvas().style.cursor = "pointer";
      };

      const hidePointer = () => {
        map.getCanvas().style.cursor = "";
      };

      map.on("mouseenter", "point", showPointer);
      map.on("mouseleave", "point", hidePointer);
      return () => {
        map.off("mouseenter", "point", showPointer);
        map.off("mouseleave", "point", hidePointer);
      };
    }
  }, [mapLoaded, geojson]);

  return (
    <div className="flex flex-col h-screen">
      <header
        className={cn("hidden pb-2 pl-1 border-b border-gray-400", {
          block: mapLoaded,
        })}
      >
        <Image src={logo} alt="Recycler logo" width={150} />
      </header>
      <main className="h-full">
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: 27.678117958246627,
            latitude: 62.892607388617456,
            zoom: 14,
          }}
          onLoad={() => setMapLoaded(true)}
          style={{ background: "#424bb3ff" }}
          mapStyle={
            mapStyle === "detail"
              ? process.env.NEXT_PUBLIC_MAPBOX_STYLE
              : "mapbox://styles/niilahti/clmt6xzzj00kq01qnb79e9a2l"
          }
          interactiveLayerIds={["point"]}
          onClick={(e) => {
            if (e.features) {
              const feature = e.features[0];
              if (!feature?.properties?.cluster) {
                setDetails(e.features[0]);
              }
            }
          }}
        >
          {geojson && (
            <>
              <Source
                id="collection_spots"
                type="geojson"
                data={geojson}
                cluster
                clusterMaxZoom={14}
                clusterRadius={50}
              >
                <Layer {...layerStyle} />
                <Layer {...clusters} />
                <Layer {...clusterCount} />
              </Source>
              <CollectionPointIcon />
              {/* <Layer {...unclustered} /> */}
              <MapStyleControl
                onToggle={(selected) => {
                  setStyle(selected ? "satellite" : "detail");
                }}
                selected={mapStyle === "satellite"}
              />
              <GeolocateControl position="bottom-right" />
              <NavigationControl position="top-right" />
              <FullscreenControl position="top-right" />
              <ScaleControl position="bottom-left" />
              <GeocoderControl
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
                position="top-left"
              />
              {details && (
                <Popup
                  key={new Date().getTime()}
                  longitude={details.geometry.coordinates[0]}
                  latitude={details.geometry.coordinates[1]}
                  onClose={() => setDetails(null)}
                  anchor="bottom"
                  maxWidth="300px"
                  className="[&_.mapboxgl-popup-content]:px-4 [&_.mapboxgl-popup-content]:py-2 [&_.mapboxgl-popup-close-button]:right-1.5"
                >
                  <h2 className="text-base font-bold">
                    {details.properties.name}
                  </h2>
                  <address>{details.properties.address}</address>
                  <materials style={{ fontStyle: 'italic' }}>
                  {details.properties.materials.replace("{", "").replace("}", "").replace(/"/g, "")}
                  </materials>
                </Popup>
              )}
            </>
          )}
        </Map>
        {!mapLoaded && (
          <div className="fixed flex inset-0 items-center justify-center flex-col gap-6 text-white">
            <Loader2Icon className="animate-spin" />
            Loading ReCycler
          </div>
        )}
      </main>
    </div>
  );
}
