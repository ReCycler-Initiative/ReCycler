"use client";

import GeocoderControl from "@/components/geocoder-control";
import { getCollectionSpots } from "@/services/api";
import { cn } from "@/utils/shadcn";
import { Loader2Icon } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import Map, {
  CircleLayer,
  FullscreenControl,
  GeolocateControl,
  ScaleControl,
  Layer,
  NavigationControl,
  Source,
  SymbolLayer,
  useControl,
  Popup,
} from "react-map-gl";
import logo from "./recycler-logo.png";
import { ControlScaffold } from "@/components/control-scaffolding";

const layerStyle: CircleLayer = {
  id: "point",
  type: "circle",
  source: "collection_spots",
  paint: {
    "circle-radius": 10,
    "circle-color": "#007cbf",
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
      "#51bbd6",
      100,
      "#f1f075",
      750,
      "#f28cb1",
    ],
    "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
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

const unclustered: CircleLayer = {
  id: "unclustered-point",
  type: "circle",
  source: "collection_spots",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#11b4da",
    "circle-radius": 4,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff",
  },
};

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geojson, setGeojson] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getCollectionSpots();
      setGeojson(response);
    };

    fetchData();
  }, []);

  console.log(details?.geometry?.coordinates);

  return (
    <div className="flex flex-col h-screen">
      <header
        className={cn("hidden pb-2 pl-1 border-b border-gray-400", {
          block: mapLoaded,
        })}
      >
        <Image src={logo} alt="Recycler logo" width={150} />
        {/* <button
          onClick={() => {
            if (geojson) {
              setGeojson({
                ...geojson,
                features: geojson.features.filter(
                  (g: any) => g.properties.name === "Aluejätepiste"
                ),
              });
            }
          }}
          type="button"
        >
          Näytä pahavi
        </button> */}
      </header>
      <main className="h-full">
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: 27.678117958246627,
            latitude: 62.892607388617456,
            zoom: 14,
          }}
          onLoad={() => setMapLoaded(true)}
          style={{ background: "#424bb3ff" }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          interactiveLayerIds={["point"]}
          onClick={(e) => {
            if (e.features) {
              setDetails(e.features[0]);
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
              />
              <Layer {...layerStyle} />
              <Layer {...clusters} />
              <Layer {...clusterCount} />
              <Layer {...unclustered} />
              <GeolocateControl position="bottom-right" />
              <FullscreenControl position="top-right" />
              <NavigationControl position="top-right" />
              <ScaleControl position="bottom-left" />
              <GeocoderControl
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
                position="top-left"
              />
              <ControlScaffold />
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
                </Popup>
              )}
            </>
          )}
        </Map>
        {!mapLoaded && (
          <div className="fixed flex inset-0 items-center justify-center flex-col gap-6 text-white">
            <Loader2Icon className="animate-spin" />
            Ladataan Recycler
          </div>
        )}
      </main>
    </div>
  );
}
