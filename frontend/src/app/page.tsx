"use client";

import { cn } from "@/utils/shadcn";
import { Loader2Icon } from "lucide-react";
import Map from "react-map-gl";
import { useState } from "react";

import "mapbox-gl/dist/mapbox-gl.css";

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <>
      <header
        className={cn(
          "hidden fixed px-4 py-4 w-full top-0 z-50 items-center text-2xl text-black uppercase",
          { flex: mapLoaded }
        )}
      >
        <p>Recycler</p>
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
        />
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
