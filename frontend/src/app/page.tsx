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
  //Marker,
  //Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  Layer,
  NavigationControl,
  Source,
  SymbolLayer,
} from "react-map-gl";
import logo from "./recycler-logo.png";

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
  const [geojson, setGeojson] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getCollectionSpots();
      setGeojson(response);
    };

    fetchData();
  }, []);

  return (
    <>
      <header
        className={cn(
          "hidden fixed px-4 py-2 w-full top-0 z-50 items-center text-2xl text-black uppercase",
          { flex: mapLoaded }
        )}
      >
        <Image src={logo} alt="Recycler logo" width={150} />
      </header>
      <main>
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: 27.678117958246627,
            latitude: 62.892607388617456,
            zoom: 14,
          }}
          onLoad={() => setMapLoaded(true)}
          style={{ background: "#424bb3ff", width: "100vw", height: "100vh" }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
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
              <GeocoderControl
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
                position="top-right"
              />
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
    </>
  );
}
