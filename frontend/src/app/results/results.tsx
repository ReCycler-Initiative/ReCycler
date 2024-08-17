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
import { Material } from "@/types";
import { Loader2Icon } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
const finlandBounds = [
  [10.0, 54.0], // Southwest
  [40.0, 75.0], // Northeast
];

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

const filterFeaturesBySelectedMaterials = (
  materials: number[],
  collectionSpots: GeoJSON.FeatureCollection<GeoJSON.Geometry>
): GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
  if (materials.length === 0) {
    return collectionSpots;
  }

  let features = collectionSpots.features?.filter((feature: any) => {
    const featureMaterials = JSON.parse(
      feature.properties.materials
    ) as Material[];
    return featureMaterials.some((material) =>
      materials.includes(material.code)
    );
  });

  return {
    ...collectionSpots,
    features,
  };
};

export default function Result() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geojson, setGeojson] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);
  const [details, setDetails] = useState<MapboxGeoJSONFeature | null>(null);
  const [mapStyle, setStyle] = useState<"detail" | "satellite">("detail");
  const mapRef = useRef<MapRef>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedMaterials =
    searchParams
      .get("materials")
      ?.split(",")
      .filter(Boolean)
      .map((code) => +code) || [];
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
    const fetchData = async () => {
      let response = await getCollectionSpots();
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

  const geolocateControlRef = useRef<any>();

  useEffect(() => {
    console.log(geolocateControlRef.current);
    if (geolocateControlRef.current) {
      geolocateControlRef.current?.trigger();
    }
  }, [geolocateControlRef.current]);

  return (
    <Suspense>
      <div className="flex h-full">
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{
            longitude: 24.94, // Suomen keskelle hieman länteen
            latitude: 64.0, // Suomen keskelle hieman etelään
            zoom: 4, // Sopiva zoom-taso kattamaan laaja alue
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
              if (
                !feature?.properties?.cluster &&
                feature.geometry &&
                feature.geometry.type === "Point"
              ) {
                setDetails(feature);
              }
            }
          }}
          maxBounds={finlandBounds as any}
        >
          {geojson && (
            <>
              <Source
                id="collection_spots"
                type="geojson"
                data={filterFeaturesBySelectedMaterials(
                  selectedMaterials,
                  geojson
                )}
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
                bbox={[19.0, 59.0, 32.0, 71.0]} //Search only from Finland bounds
              />
              {details && (
                <Popup
                  key={new Date().getTime()}
                  longitude={(details.geometry as GeoJSON.Point).coordinates[0]}
                  latitude={(details.geometry as GeoJSON.Point).coordinates[1]}
                  onClose={() => setDetails(null)}
                  anchor="bottom"
                  maxWidth="320px"
                  className="[&_.mapboxgl-popup-content]:min-w-52 [&_.mapboxgl-popup-content]:px-0 [&_.mapboxgl-popup-content]:py-0 [&_.mapboxgl-popup-close-button]:right-1.5"
                >
                  <div className="px-5 py-4 border-b">
                    <h2 className="text-base font-semibold mb-1">
                      {details.properties?.name}
                    </h2>
                    <address className="text-sm not-italic">
                      {details.properties?.address}
                    </address>
                  </div>
                  <ul className="text-sm px-5 py-4 leading-6 list-disc grid grid-cols-2 gap-x-2">
                    {details.properties &&
                      JSON.parse(details.properties.materials)
                        .sort((a: Material, b: Material) =>
                          a.name.localeCompare(b.name)
                        )
                        .map((material: Material) => (
                          <li key={material.code} className="ml-4">{material.name}</li>
                        ))}
                  </ul>
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
        <Drawer
          open={showMaterials}
          onOpenChange={(open) => {
            if (!open) {
              const current = new URLSearchParams(
                Array.from(searchParams.entries())
              );
              current.set(
                "materials",
                Object.entries(formMaterials)
                  .filter(([, value]) => value)
                  .map(([key]) => key)
                  .join(",")
              );
              const search = current.toString();
              const query = search ? `?${search}` : "";

              router.push(pathname + query);
            }
            setShowMaterials(open);
          }}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Valitut materiaalit</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[500px] overflow-y-scroll">
              <Form {...form}>
                <Container>
                  <Materials />
                </Container>
              </Form>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </Suspense>
  );
}
