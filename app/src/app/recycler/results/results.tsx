"use client";

import Container from "@/components/container";
import GeocoderControl from "@/components/geocoder-control";
import { MapStyleControl } from "@/components/map-style-control";
import { Materials } from "@/components/materials";
import { SelectedMaterialsControl } from "@/components/selected-materials-control";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Form } from "@/components/ui/form";
import { getCollectionSpots } from "@/services/api";
import { Material } from "@/types";
import { Loader2Icon, MapPinned } from "lucide-react";
import { GeolocateControl as TGeolocateControl } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import OnboardingHint from "@/components/ui/onboarding-hint";

// Custom icon loader for collection points
const CollectionPointIcon = () => {
  const { current: map } = useMap();

  useEffect(() => {
    if (!map) return;

    const loadIcon = () => {
      // Load icon only once per style
      if (map.hasImage("collection-point")) return;
      map.loadImage("../images/collection-point.png", (error, image) => {
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

// Helper to filter features based on selected materials
const filterFeaturesBySelectedMaterials = (
  materials: number[],
  collectionSpots: GeoJSON.FeatureCollection<GeoJSON.Geometry>
): GeoJSON.FeatureCollection<GeoJSON.Geometry> => {
  if (materials.length === 0) {
    return collectionSpots;
  }

  const features = collectionSpots.features
    ?.filter((feature: any) => {
      const featureMaterials = JSON.parse(
        feature.properties.materials
      ) as Material[];
      return featureMaterials.some((material) =>
        materials.includes(material.code)
      );
    })
    .map((feature: any) => {
      const featureMaterials = JSON.parse(
        feature.properties.materials
      ) as Material[];

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

export default function Result() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [styleLoaded, setStyleLoaded] = useState(true);
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

  // Whether to show geolocation onboarding hint at startup
  const [showGeoHint, setShowGeoHint] = useState(true);

  // Setup form state for material selection
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

  const formMaterials = useWatch({
    control: form.control,
    name: "materials",
    defaultValue: {},
  });

  // Load collection points from API
  useEffect(() => {
    const fetchData = async () => {
      const response = await getCollectionSpots();
      setGeojson(response);
    };
    fetchData();
  }, []);

  const geolocateControlRef = useRef<TGeolocateControl>(null);

  const initialGeolocate = useRef(true); // first camera ease only
  const [isTracking, setTracking] = useState(false);
  const awaitingPermission = useRef(false); // set true when user clicks the geo button
  const didGeolocateOnce = useRef(false); // stop retries after first success
  const retryTimer = useRef<number | null>(null); // retry loop id

  // Camera: do a single initial ease to user position
  const handleGeolocateChange = useCallback((position: GeolocationPosition) => {
    if (!initialGeolocate.current) return;
    mapRef.current?.easeTo({
      center: [position.coords.longitude, position.coords.latitude],
      zoom: 15,
      duration: 500,
    });
    initialGeolocate.current = false;
    didGeolocateOnce.current = true;
    awaitingPermission.current = false;
    if (retryTimer.current) {
      window.clearInterval(retryTimer.current);
      retryTimer.current = null;
    }
  }, []);

  // If the style is reloaded while we are in tracking mode, retrigger geolocation
  useEffect(() => {
    if (styleLoaded && isTracking) {
      geolocateControlRef.current?.trigger();
    }
  }, [styleLoaded, isTracking]);

  // Re-trigger automatically when permission flips to granted after the prompt
  useEffect(() => {
    let perm: any | null = null;
    (async () => {
      try {
        // @ts-ignore
        perm = await navigator.permissions?.query({
          name: "geolocation" as PermissionName,
        });
        if (!perm) return;
        const handle = () => {
          if (perm!.state === "granted" && awaitingPermission.current && !didGeolocateOnce.current) {
            geolocateControlRef.current?.trigger();
          }
        };
        perm.onchange = handle;
      } catch {
        // Permissions API not supported
      }
    })();
    return () => {
      if (perm) perm.onchange = null;
    };
  }, []);

  // Pointer cursor + style load handling
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const showPointer = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const hidePointer = () => {
      map.getCanvas().style.cursor = "";
    };
    const onStyleLoad = () => setStyleLoaded(true);

    map.on("mouseenter", "point", showPointer);
    map.on("mouseleave", "point", hidePointer);
    map.on("style.load", onStyleLoad);

    return () => {
      map.off("mouseenter", "point", showPointer);
      map.off("mouseleave", "point", hidePointer);
      map.off("style.load", onStyleLoad);
    };
  }, []);

  // Cleanup retry interval on unmount
  useEffect(() => {
    return () => {
      if (retryTimer.current) {
        window.clearInterval(retryTimer.current);
        retryTimer.current = null;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("map-unloaded"));
      }
    };
  }, []);

  // Fallback: run native geolocation once on button click to guarantee a result
  const requestNativeOnce = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (didGeolocateOnce.current) return;
        handleGeolocateChange(pos);
      },
      // if permission denied or temporarily blocked, we'll rely on retry + permission onchange
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }, [handleGeolocateChange]);

  // Start a short retry loop after user click; stops on success
  const startRetryLoop = useCallback(() => {
    if (retryTimer.current) return;
    // Try to re-trigger Mapbox control a few times after permission dialog closes
    let attempts = 0;
    retryTimer.current = window.setInterval(() => {
      if (didGeolocateOnce.current || attempts > 8) {
        if (retryTimer.current) {
          window.clearInterval(retryTimer.current);
          retryTimer.current = null;
        }
        return;
      }
      geolocateControlRef.current?.trigger();
      attempts += 1;
    }, 500);
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
          onLoad={() => {
            setMapLoaded(true);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("map-loaded"));
            }
          }}
          mapStyle={
            mapStyle === "detail"
              ? (process.env.NEXT_PUBLIC_MAPBOX_STYLE_DETAIL as string)
              : (process.env.NEXT_PUBLIC_MAPBOX_STYLE_SATELLITE as string)
          }
          interactiveLayerIds={["point"]}
          onClick={(e) => {
            if (e.features) {
              const feature = e.features[0];
              if (
                !feature?.properties?.cluster &&
                feature?.geometry &&
                feature?.geometry.type === "Point"
              ) {
                setDetails(feature);
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
            onTrackUserLocationStart={() => {
              setTracking(true);
              awaitingPermission.current = true; // user clicked the button
              didGeolocateOnce.current = false;
              // run both Mapbox trigger (implicit) + native fallback + retry safety net
              requestNativeOnce();
              startRetryLoop();
            }}
            // IMPORTANT: do not flip tracking off here; Mapbox emits End on minor interactions
            onTrackUserLocationEnd={() => {
              // keep UI state; let the user decide to turn tracking off explicitly
            }}
            onError={() => {
              // if error due to permission denied, wait for permission change and retry loop keeps running
              awaitingPermission.current = true;
            }}
            positionOptions={{ enableHighAccuracy: true }}
            position="bottom-right"
            trackUserLocation
            showUserHeading
          />

          {/* Onboarding hint anchored to the geolocate control */}
          {showGeoHint && <OnboardingHint storageKey="onboarded:geo" />}

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
            placeholder="Etsi"
            bbox={[19.0, 59.0, 32.0, 71.0]}
          />

          {geojson && (
            <>
              {styleLoaded && (
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
                  <Layer {...highlighLayer} />
                  <Layer {...layerStyle} />
                  <Layer {...clusters} />
                  <Layer {...clusterCount} />
                </Source>
              )}
              <CollectionPointIcon />
              {details && (
                <Popup
                  key={new Date().getTime()}
                  longitude={(details.geometry as GeoJSON.Point).coordinates[0]}
                  latitude={(details.geometry as GeoJSON.Point).coordinates[1]}
                  onClose={() => setDetails(null)}
                  anchor="bottom"
                  maxWidth="360px"
                  className="[&_.mapboxgl-popup-content]:min-w-52 [&_.mapboxgl-popup-content]:p-0! [&_.mapboxgl-popup-close-button]:hidden"
                >
                  <div className="p-3 border-b">
                    <h2 className="text-base font-semibold mb-1">
                      {details.properties?.name}
                    </h2>
                    <div className="flex gap-2 justify-between">
                      <address className="text-sm text-gray-900 not-italic flex flex-col leading-5 ">
                        {details.properties?.address}
                        <span>
                          {details.properties?.postal_code}{" "}
                          {details.properties?.post_office}
                        </span>
                      </address>
                    </div>
                  </div>
                  {details.properties?.opening_hours_fi && (
                    <div className="p-3 border-b">
                      <h3 className="sr-only">Opening hours</h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: details.properties?.opening_hours_fi,
                        }}
                      />
                    </div>
                  )}
                  <ul className="text-sm p-3 leading-6 list-disc columns-2">
                    {details.properties &&
                      JSON.parse(details.properties.materials)
                        .sort((a: Material, b: Material) =>
                          a.name.localeCompare(b.name)
                        )
                        .map((material: Material) => (
                          <li key={material.code} className="ml-4">
                            {material.name}
                          </li>
                        ))}
                  </ul>
                  <div className="text-center border-t">
                    <Button
                      className="text-[#ff1312] text-sm w-full"
                      variant="ghost"
                      asChild
                    >
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${(details.geometry as GeoJSON.Point).coordinates[1]},${(details.geometry as GeoJSON.Point).coordinates[0]}`}
                        target="_blank"
                      >
                        <span>Open in Google Maps</span>
                        <MapPinned className="ml-2" size={18} />
                      </a>
                    </Button>
                  </div>
                </Popup>
              )}
            </>
          )}
        </Map>

        {!mapLoaded && (
          <div className="fixed flex inset-0 items-center justify-center flex-col gap-6 text-black">
            <Loader2Icon className="animate-spin" />
            Ladataan kierrätyspisteet kartalle
          </div>
        )}

        {/* Drawer for selecting materials */}
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
              <DrawerTitle className="text-center">
                Selected materials
              </DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[500px] overflow-y-scroll max-w-2xl mx-auto">
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