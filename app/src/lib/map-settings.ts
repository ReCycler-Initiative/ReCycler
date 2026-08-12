import { UseCaseMapSettings } from "@/types";

type PartialUseCaseMapSettings = Partial<
  Omit<UseCaseMapSettings, "onboarding">
> & {
  onboarding?: {
    enabled?: boolean;
    steps?: Partial<UseCaseMapSettings["onboarding"]["steps"]>;
    content?: {
      search?: Partial<UseCaseMapSettings["onboarding"]["content"]["search"]>;
      location?: Partial<UseCaseMapSettings["onboarding"]["content"]["location"]>;
      map_style?: Partial<UseCaseMapSettings["onboarding"]["content"]["map_style"]>;
      filter?: Partial<UseCaseMapSettings["onboarding"]["content"]["filter"]>;
      complete?: Partial<UseCaseMapSettings["onboarding"]["content"]["complete"]>;
    };
  };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const sanitizeCoordinate = ([lng, lat]: [number, number]): [number, number] => [
  clamp(lng, -180, 180),
  clamp(lat, -90, 90),
];

const sanitizeBounds = (
  bounds: UseCaseMapSettings["max_bounds"]
): UseCaseMapSettings["max_bounds"] => {
  const [rawSw, rawNe] = bounds;
  const [swLng, swLat] = sanitizeCoordinate(rawSw);
  const [neLng, neLat] = sanitizeCoordinate(rawNe);

  return [
    [Math.min(swLng, neLng), Math.min(swLat, neLat)],
    [Math.max(swLng, neLng), Math.max(swLat, neLat)],
  ];
};

const sanitizeGeocoderBbox = (
  bbox: UseCaseMapSettings["geocoder_bbox"]
): UseCaseMapSettings["geocoder_bbox"] => {
  const minLng = clamp(Math.min(bbox[0], bbox[2]), -180, 180);
  const maxLng = clamp(Math.max(bbox[0], bbox[2]), -180, 180);
  const minLat = clamp(Math.min(bbox[1], bbox[3]), -90, 90);
  const maxLat = clamp(Math.max(bbox[1], bbox[3]), -90, 90);

  return [minLng, minLat, maxLng, maxLat];
};

export const DEFAULT_USE_CASE_MAP_SETTINGS: UseCaseMapSettings = {
  initial_center: [24.94, 64.0],
  initial_zoom: 4,
  max_bounds: [
    [10.0, 54.0],
    [40.0, 75.0],
  ],
  geocoder_bbox: [19.0, 59.0, 32.0, 71.0],
  enable_geolocation: true,
  enable_satellite_toggle: true,
  enable_navigation_controls: true,
  enable_fullscreen_control: true,
  enable_search: true,
  onboarding: {
    enabled: true,
    steps: {
      search: true,
      location: true,
      map_style: true,
      filter: true,
      complete: true,
    },
    content: {
      search: {},
      location: {},
      map_style: {},
      filter: {},
      complete: {},
    },
  },
};

export const resolveUseCaseMapSettings = (
  mapSettings: PartialUseCaseMapSettings | null | undefined
): UseCaseMapSettings => {
  if (!mapSettings) {
    return DEFAULT_USE_CASE_MAP_SETTINGS;
  }

  const initialCenter =
    mapSettings.initial_center ?? DEFAULT_USE_CASE_MAP_SETTINGS.initial_center;
  const initialZoom =
    mapSettings.initial_zoom ?? DEFAULT_USE_CASE_MAP_SETTINGS.initial_zoom;
  const maxBounds =
    mapSettings.max_bounds ?? DEFAULT_USE_CASE_MAP_SETTINGS.max_bounds;

  const sanitizedBounds = sanitizeBounds(maxBounds);
  const fallbackGeocoderBbox: UseCaseMapSettings["geocoder_bbox"] = [
    sanitizedBounds[0][0],
    sanitizedBounds[0][1],
    sanitizedBounds[1][0],
    sanitizedBounds[1][1],
  ];

  return {
    initial_center: sanitizeCoordinate(initialCenter),
    initial_zoom: clamp(initialZoom, 0, 22),
    max_bounds: sanitizedBounds,
    geocoder_bbox: mapSettings.geocoder_bbox
      ? sanitizeGeocoderBbox(mapSettings.geocoder_bbox)
      : fallbackGeocoderBbox,
    enable_geolocation:
      mapSettings.enable_geolocation ??
      DEFAULT_USE_CASE_MAP_SETTINGS.enable_geolocation,
    enable_satellite_toggle:
      mapSettings.enable_satellite_toggle ??
      DEFAULT_USE_CASE_MAP_SETTINGS.enable_satellite_toggle,
    enable_navigation_controls:
      mapSettings.enable_navigation_controls ??
      DEFAULT_USE_CASE_MAP_SETTINGS.enable_navigation_controls,
    enable_fullscreen_control:
      mapSettings.enable_fullscreen_control ??
      DEFAULT_USE_CASE_MAP_SETTINGS.enable_fullscreen_control,
    enable_search:
      mapSettings.enable_search ??
      DEFAULT_USE_CASE_MAP_SETTINGS.enable_search,
    onboarding: {
      enabled:
        mapSettings.onboarding?.enabled ??
        DEFAULT_USE_CASE_MAP_SETTINGS.onboarding.enabled,
      steps: {
        search:
          mapSettings.onboarding?.steps?.search ??
          DEFAULT_USE_CASE_MAP_SETTINGS.onboarding.steps.search,
        location:
          mapSettings.onboarding?.steps?.location ??
          DEFAULT_USE_CASE_MAP_SETTINGS.onboarding.steps.location,
        map_style:
          mapSettings.onboarding?.steps?.map_style ??
          DEFAULT_USE_CASE_MAP_SETTINGS.onboarding.steps.map_style,
        filter:
          mapSettings.onboarding?.steps?.filter ??
          DEFAULT_USE_CASE_MAP_SETTINGS.onboarding.steps.filter,
        complete:
          mapSettings.onboarding?.steps?.complete ??
          DEFAULT_USE_CASE_MAP_SETTINGS.onboarding.steps.complete,
      },
      content: {
        search: mapSettings.onboarding?.content?.search ?? {},
        location: mapSettings.onboarding?.content?.location ?? {},
        map_style: mapSettings.onboarding?.content?.map_style ?? {},
        filter: mapSettings.onboarding?.content?.filter ?? {},
        complete: mapSettings.onboarding?.content?.complete ?? {},
      },
    },
  };
};
