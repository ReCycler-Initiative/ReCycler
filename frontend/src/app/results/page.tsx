"use client";

import Container from "@/components/container";
import GeocoderControl from "@/components/geocoder-control";
import { MapStyleControl } from "@/components/map-style-control";
import { Materials } from "@/components/materials";
import { SelectedMaterialsControl } from "@/components/selected-materials-control";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Form } from "@/components/ui/form";
import { getCollectionSpots } from "@/services/api";
import { Loader2Icon } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geojson, setGeojson] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [mapStyle, setStyle] = useState<"detail" | "satellite">("detail");
  const mapRef = useRef<MapRef>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMaterials = searchParams.get("materials")?.split(",").filter(Boolean) || [];
  const [showMaterials, setShowMaterials] = useState(false);
  const form = useForm({
    defaultValues: {
      materials: selectedMaterials.reduce(
        (acc, material) => {
          acc[material] = true;
          return acc;
        },
        {} as Record<string, boolean>
      ),
    },
  });

  const formMaterials = form.watch("materials", {});

  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set(
      "materials",
      Object.entries(formMaterials)
        .filter(([, value]) => value)
        .map(([key]) => key)
        .join(",")
    );
    const search = current.toString();
    const query = search ? `?${search}` : "";
  }, [formMaterials, router, searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      let response = await getCollectionSpots();
      let features = response.features.filter((feature: any) => {
        if (selectedMaterials.length === 0) {
          return true;
        }

        const featureMaterials: string[] = feature.properties.materials
          .replace("{", "")
          .replace("}", "")
          .replace(/"/g, "")
          .split(",");

        return featureMaterials.some((material) =>
          selectedMaterials.includes(material)
        );
      });
      setGeojson({
        ...response,
        features,
      });
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

  const geolocateControlRef = useRef<any>();

  useEffect(() => {
    console.log(geolocateControlRef.current);
    if (geolocateControlRef.current) {
      geolocateControlRef.current?.trigger();
    }
  }, [geolocateControlRef.current]);

  return (
    <div className="flex h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 25.748151,
          latitude: 61.92411,
          zoom: 5,
        }}
        onLoad={() => {
          setMapLoaded(true);
        }}
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
            <MapStyleControl
              onToggle={(selected) => {
                setStyle(selected ? "satellite" : "detail");
              }}
              selected={mapStyle === "satellite"}
            />
            <GeolocateControl
              ref={geolocateControlRef}
              position="bottom-right"
            />
            <SelectedMaterialsControl
              amount={selectedMaterials.length}
              onClick={() => setShowMaterials(true)}
            />
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
                <p style={{ fontStyle: "italic" }}>
                  {details.properties.materials
                    .replace("{", "")
                    .replace("}", "")
                    .replace(/"/g, "")}
                </p>
              </Popup>
            )}
          </>
        )}
      </Map>
      {!mapLoaded && (
        <div className="fixed flex inset-0 items-center justify-center flex-col gap-6 text-black">
          <Loader2Icon className="animate-spin" />
          Haetaan kierrätyspisteitä
        </div>
      )}
      <Drawer open={showMaterials} onOpenChange={setShowMaterials}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Valitut materiaalit</DrawerTitle>
          </DrawerHeader>
          <Form {...form}>
            <Container>
              <Materials />
            </Container>
          </Form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
