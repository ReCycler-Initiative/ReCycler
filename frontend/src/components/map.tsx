"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import MapboxMap from "react-map-gl";

type MapProps = {
  onLoad: () => void;
};

export const Map = ({ onLoad }: MapProps) => (
  <MapboxMap
    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
    initialViewState={{
      longitude: 25.08992,
      latitude: 60.47369,
      zoom: 14,
    }}
    onLoad={onLoad}
    style={{ background: "#424bb3ff", width: "100vw", height: "100vh" }}
    mapStyle="mapbox://styles/mapbox/streets-v9"
  />
);
