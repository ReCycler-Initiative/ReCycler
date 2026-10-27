"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLocation, getFields, getLocation, getLocationTypes, updateLocation } from "@/services/api";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { localizeMaterialNameCandidate } from "@/lib/material-translations";
import { ChoiceInfo, ChoiceInfoDialog } from "@/components/choice-info-dialog";
import { AddressFieldInput, formatAddressValues } from "@/components/admin/address-field-input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/** Cross product of vectors (b-a) and (c-a) */
function cross(a: [number, number], b: [number, number], c: [number, number]): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

/** True if point p lies on segment [a, b] (collinear & within bounding box) */
function onSegment(a: [number, number], b: [number, number], p: [number, number]): boolean {
  return (
    Math.min(a[0], b[0]) <= p[0] &&
    p[0] <= Math.max(a[0], b[0]) &&
    Math.min(a[1], b[1]) <= p[1] &&
    p[1] <= Math.max(a[1], b[1])
  );
}

/** True if segment (p1,p2) properly intersects segment (p3,p4) */
function segmentsIntersect(
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  p4: [number, number]
): boolean {
  const d1 = cross(p3, p4, p1);
  const d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3);
  const d4 = cross(p1, p2, p4);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  if (d1 === 0 && onSegment(p3, p4, p1)) return true;
  if (d2 === 0 && onSegment(p3, p4, p2)) return true;
  if (d3 === 0 && onSegment(p1, p2, p3)) return true;
  if (d4 === 0 && onSegment(p1, p2, p4)) return true;
  return false;
}

/**
 * Returns true if the polygon defined by `nodes` has any self-intersecting edges.
 * Checks all non-adjacent edge pairs (O(n²)).
 */
function polygonSelfIntersects(nodes: [number, number][]): boolean {
  if (nodes.length < 4) return false; // a triangle can never self-intersect
  const n = nodes.length;
  for (let i = 0; i < n; i++) {
    const a = nodes[i];
    const b = nodes[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      // Skip adjacent edges (they share an endpoint)
      if (i === 0 && j === n - 1) continue;
      const c = nodes[j];
      const d = nodes[(j + 1) % n];
      if (segmentsIntersect(a, b, c, d)) return true;
    }
  }
  return false;
}
import {
  ChevronDown,
  ChevronRight,
  Crosshair,
  InfoIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AddProps = {
  mode: "add";
  lngLat?: { longitude: number; latitude: number };
  onSaved: (newId: string) => void;
  /** In polygon draw mode, the nodes accumulated so far */
  polygonNodes?: [number, number][];
  onPolygonNodesChange?: (nodes: [number, number][]) => void;
  /** Completed polygon parts (for MultiPolygon) */
  polygonParts?: [number, number][][];
  onPolygonPartsChange?: (parts: [number, number][][]) => void;
  locationTypeMode?: "point" | "polygon";
  onLocationTypeModeChange?: (type: "point" | "polygon") => void;
};

type EditProps = {
  mode: "edit";
  locationId: string;
  onSaved: () => void;
  onDelete?: () => void;
  polygonNodes?: [number, number][];
  onPolygonNodesChange?: (nodes: [number, number][]) => void;
  /** Completed polygon parts (for MultiPolygon) */
  polygonParts?: [number, number][][];
  onPolygonPartsChange?: (parts: [number, number][][]) => void;
  locationTypeMode?: "point" | "polygon";
  onLocationTypeModeChange?: (type: "point" | "polygon") => void;
};

export type LocationEditPanelProps = {
  organizationId: string;
  useCaseId: string;
  onClose: () => void;
  onCoordinatesChange?: (lngLat: { longitude: number; latitude: number } | null) => void;
  relocateMode?: boolean;
  onToggleRelocate?: () => void;
  onConfirmRelocate?: () => void;
  onCancelRelocate?: () => void;
  pickedLngLat?: { longitude: number; latitude: number };
} & (AddProps | EditProps);

export const LocationEditPanel = (props: LocationEditPanelProps) => {
  const { locale } = useLocale();
  const messages = useMessages();
  const {
    organizationId,
    useCaseId,
    onClose,
    onCoordinatesChange,
    relocateMode,
    onToggleRelocate,
    onConfirmRelocate,
    onCancelRelocate,
    pickedLngLat,
  } = props;

  const polygonNodes = useMemo(() => props.polygonNodes ?? [], [props.polygonNodes]);
  const onPolygonNodesChange = props.onPolygonNodesChange;
  const polygonParts = useMemo(() => props.polygonParts ?? [], [props.polygonParts]);
  const onPolygonPartsChange = props.onPolygonPartsChange;
  const locationTypeMode = props.locationTypeMode ?? "point";
  const onLocationTypeModeChange = props.onLocationTypeModeChange;
  const queryClient = useQueryClient();

  const locationId = props.mode === "edit" ? props.locationId : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["location", organizationId, useCaseId, locationId],
    queryFn: () => getLocation(organizationId, useCaseId, locationId!),
    enabled: props.mode === "edit",
  });

  const { data: fieldsDefinitions, isLoading: isFieldsLoading } = useQuery({
    queryKey: ["fields", organizationId, useCaseId],
    queryFn: () => getFields(organizationId, useCaseId),
    staleTime: Infinity,
  });

  // New locations get the use case's first location type
  const { data: locationTypes } = useQuery({
    queryKey: ["location-types", organizationId, useCaseId],
    queryFn: () => getLocationTypes(organizationId, useCaseId),
    enabled: props.mode === "add",
  });

  const locationType =
    props.mode === "edit"
      ? data?.properties.location_type_id && data.properties.location_type_name
        ? { id: data.properties.location_type_id, name: data.properties.location_type_name }
        : undefined
      : locationTypes?.[0];

  const [name, setName] = useState("");
  const [longitude, setLongitude] = useState(
    props.mode === "add" ? String(props.lngLat?.longitude ?? "") : ""
  );
  const [latitude, setLatitude] = useState(
    props.mode === "add" ? String(props.lngLat?.latitude ?? "") : ""
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string[]>>({});
  const [expandedFieldIds, setExpandedFieldIds] = useState<Record<string, boolean>>({});
  const [infoChoice, setInfoChoice] = useState<ChoiceInfo | null>(null);

  const toggleFieldSection = (fieldId: string) => {
    setExpandedFieldIds((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  // Snapshot coords when relocate activates so cancel can restore them
  const savedLngLat = useRef<{ longitude: string; latitude: string } | null>(null);
  const prevRelocateMode = useRef(false);
  useEffect(() => {
    if (relocateMode && !prevRelocateMode.current) {
      savedLngLat.current = { longitude, latitude };
    }
    prevRelocateMode.current = !!relocateMode;
  });

  useEffect(() => {
    if (!pickedLngLat) return;
    setLongitude(String(pickedLngLat.longitude));
    setLatitude(String(pickedLngLat.latitude));
    onCoordinatesChange?.(pickedLngLat);
  }, [onCoordinatesChange, pickedLngLat]);

  useEffect(() => {
    if (props.mode !== "edit" || !data) return;
    setName(data.properties.name);
    setLongitude(String(data.geometry.coordinates[0]));
    setLatitude(String(data.geometry.coordinates[1]));
    const initial: Record<string, string[]> = {};
    for (const f of data.properties.fields) {
      initial[f.id] = f.value;
    }
    setFieldValues(initial);

    // Populate polygon nodes and parts from existing source_geometry
    const sg = data.properties.source_geometry;
    if (sg && (sg.type === "Polygon" || sg.type === "MultiPolygon")) {
      if (sg.type === "MultiPolygon") {
        const coordinates = (sg as unknown as GeoJSON.MultiPolygon).coordinates;
        // Load all rings as parts
        const parts = coordinates.map((polygon) => {
          const ring = polygon[0] as [number, number][];
          // Drop closing duplicate node
          return ring.length > 1 &&
            ring[0][0] === ring[ring.length - 1][0] &&
            ring[0][1] === ring[ring.length - 1][1]
            ? ring.slice(0, -1)
            : ring;
        });
        onPolygonPartsChange?.(parts);
        onPolygonNodesChange?.([]);
      } else {
        // Polygon: load first ring as current nodes, rest as parts
        const ring = (sg as unknown as GeoJSON.Polygon).coordinates[0] as [number, number][];
        const nodes: [number, number][] =
          ring.length > 1 &&
          ring[0][0] === ring[ring.length - 1][0] &&
          ring[0][1] === ring[ring.length - 1][1]
            ? ring.slice(0, -1)
            : ring;
        onPolygonNodesChange?.(nodes);
        onPolygonPartsChange?.([]);
      }
      onLocationTypeModeChange?.("polygon");
    } else {
      onPolygonNodesChange?.([]);
      onPolygonPartsChange?.([]);
      onLocationTypeModeChange?.("point");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, props.mode]);

  const mutation = useMutation({
    mutationFn: async () => {
      // Helper to build source_geometry from nodes and parts
      const buildSourceGeometry = () => {
        if (locationTypeMode !== "polygon") return undefined;
        
        // Collect all completed parts + current nodes (if any)
        const allParts: [number, number][][] = [];
        for (const part of polygonParts) {
          allParts.push([...part, part[0]]); // Close ring
        }
        if (polygonNodes.length >= 3) {
          allParts.push([...polygonNodes, polygonNodes[0]]); // Close current ring
        }
        
        if (allParts.length === 0) return undefined;
        if (allParts.length === 1) {
          return { type: "Polygon" as const, coordinates: allParts };
        }
        return { type: "MultiPolygon" as const, coordinates: allParts.map((ring) => [ring]) };
      };

      if (props.mode === "add") {
        const source_geometry = buildSourceGeometry();

        const created = await createLocation(organizationId, useCaseId, {
          fieldValues: Object.entries(fieldValues).map(([fieldId, values]) => ({
            fieldId,
            values,
          })),
          name: name.trim(),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          source_geometry,
        });
        return created;
      }
      // Edit mode
      const editSourceGeometry = buildSourceGeometry();
      const editPayload: {
        name: string;
        latitude: number;
        longitude: number;
        source_geometry?: any;
        fieldValues?: { fieldId: string; values: string[] }[];
      } = {
        name: name.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      // Only include source_geometry if it's defined (not null/undefined)
      if (editSourceGeometry) {
        editPayload.source_geometry = editSourceGeometry;
      }

      // Only include fieldValues if there are any
      const fieldValuesArray = Object.entries(fieldValues).map(([fieldId, values]) => ({
        fieldId,
        values,
      }));
      if (fieldValuesArray.length > 0) {
        editPayload.fieldValues = fieldValuesArray;
      }

      return updateLocation(organizationId, useCaseId, locationId!, editPayload);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["locations", organizationId, useCaseId],
      });
      if (props.mode === "add") {
        toast.success(messages.adminLocationPanel.locationAdded);
        props.onSaved(result?.properties?.id ?? "");
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["location", organizationId, useCaseId, locationId],
        });
        toast.success(messages.adminLocationPanel.locationSaved);
        props.onSaved();
      }
    },
    onError: () => {
      toast.error(messages.adminLocationPanel.saveFailed);
    },
  });

  const polygonInvalid =
    locationTypeMode === "polygon" &&
    polygonNodes.length >= 4 &&
    polygonSelfIntersects(polygonNodes);

  const polygonVertexGroups = useMemo(
    () => [
      ...polygonParts,
      ...(polygonNodes.length >= 3 ? [polygonNodes] : []),
    ],
    [polygonNodes, polygonParts]
  );

  const hasPolygonGeometry = polygonVertexGroups.length > 0;

  const isValid =
    name.trim().length > 0 &&
    !polygonInvalid &&
    (locationTypeMode === "polygon"
      ? hasPolygonGeometry
      : !isNaN(parseFloat(longitude)) && !isNaN(parseFloat(latitude)));

  // Compute centroid of all polygon vertices (current ring + completed parts) and keep coords in sync.
  useEffect(() => {
    if (locationTypeMode !== "polygon" || polygonVertexGroups.length === 0) return;
    const vertices = polygonVertexGroups.flat();
    const lng = vertices.reduce((sum, coord) => sum + coord[0], 0) / vertices.length;
    const lat = vertices.reduce((sum, coord) => sum + coord[1], 0) / vertices.length;
    setLongitude(String(lng));
    setLatitude(String(lat));
    onCoordinatesChange?.({ longitude: lng, latitude: lat });
  }, [locationTypeMode, onCoordinatesChange, polygonVertexGroups]);

  const normalizeFieldValues = (values: Record<string, string[]>) =>
    Object.fromEntries(
      Object.entries(values).sort(([left], [right]) => left.localeCompare(right))
    );

  const initialFormState = useMemo(() => {
    if (props.mode === "add") {
      return null;
    }

    if (!data) {
      return null;
    }

    return JSON.stringify({
      name: data.properties.name ?? "",
      longitude: String(data.geometry.coordinates[0]),
      latitude: String(data.geometry.coordinates[1]),
      fieldValues: normalizeFieldValues(
        Object.fromEntries(data.properties.fields.map((field) => [field.id, field.value]))
      ),
    });
  }, [data, props.mode]);

  const currentFormState = useMemo(() => {
    if (props.mode === "add") {
      return null;
    }

    return JSON.stringify({
      name,
      longitude,
      latitude,
      fieldValues: normalizeFieldValues(fieldValues),
    });
  }, [fieldValues, latitude, longitude, name, props.mode]);

  const isDirty = props.mode === "add" || (
    initialFormState !== null && currentFormState !== null && initialFormState !== currentFormState
  );

  const isLoading_ = (props.mode === "edit" && isLoading) || isFieldsLoading;
  const isError_ = props.mode === "edit" && isError;
  const isReady = !isLoading_ && (props.mode === "add" || (!isError_ && !!data));

  const parsedLongitude = Number.parseFloat(longitude);
  const parsedLatitude = Number.parseFloat(latitude);
  const coordinates =
    Number.isNaN(parsedLongitude) || Number.isNaN(parsedLatitude)
      ? null
      : { longitude: parsedLongitude, latitude: parsedLatitude };

  const relocateSaveDisabled =
    mutation.isPending ||
    !name.trim().length ||
    Number.isNaN(Number.parseFloat(longitude)) ||
    Number.isNaN(Number.parseFloat(latitude));

  const handleRestoreRelocate = () => {
    if (savedLngLat.current) {
      setLongitude(savedLngLat.current.longitude);
      setLatitude(savedLngLat.current.latitude);
      const lng = Number.parseFloat(savedLngLat.current.longitude);
      const lat = Number.parseFloat(savedLngLat.current.latitude);
      if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
        onCoordinatesChange?.({ longitude: lng, latitude: lat });
      }
    }
    onCancelRelocate?.();
  };

  const handleFinishRelocate = () => {
    if (relocateSaveDisabled) return;
    mutation.mutate(undefined, {
      onSuccess: () => {
        onConfirmRelocate?.();
      },
      onError: () => {
        onCancelRelocate?.();
      },
    });
  };

  const title =
    props.mode === "add"
      ? messages.adminLocationPanel.addLocation
      : isLoading_
      ? messages.adminLocationPanel.loading
      : (data?.properties.name ?? messages.adminLocationPanel.editLocation);

  return (
    <>
    <div className="location-edit-panel flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 shrink-0">
        <h2 className="text-sm font-semibold truncate flex-1">{title}</h2>
        {props.mode === "edit" && props.onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={messages.adminLocationPanel.moreActions}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={props.onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                {messages.adminLocationPanel.deleteLocation}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={messages.adminLocationPanel.close}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {isLoading_ && (
          <div className="flex items-center justify-center gap-2 h-32 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">{messages.adminLocationPanel.loading}</p>
          </div>
        )}
        {isError_ && (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-destructive">{messages.adminLocationPanel.loadError}</p>
          </div>
        )}
        {isReady && (
          <div className="p-4 space-y-5">
            {(locationType || (props.mode === "edit" && data?.properties.source_type)) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 space-y-3">
                {locationType && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {messages.adminLocationPanel.locationType}
                    </p>
                    <Link
                      href={`/admin/organizations/${organizationId}/use_cases/${useCaseId}/location-types/${locationType.id}/edit?${new URLSearchParams({
                        returnTo: `/admin/organizations/${organizationId}/use_cases/${useCaseId}/locations${locationId ? `?location=${locationId}` : ""}`,
                      })}`}
                      className="mt-1 block text-sm text-foreground underline underline-offset-2 hover:text-muted-foreground"
                    >
                      {locationType.name}
                    </Link>
                  </div>
                )}
                {props.mode === "edit" && data?.properties.source_type && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {messages.adminLocationPanel.source}
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {data.properties.source_type === "datasource"
                        ? (data.properties.datasource_name ?? messages.admin.datasources)
                        : messages.adminLocationPanel.sourceManual}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Location type selector – add and edit modes */}
            <div className="space-y-1.5">
              <Label>{messages.adminLocationPanel.locationTypeLabel}</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLocationTypeModeChange?.("point");
                    onPolygonNodesChange?.([]);
                  }}
                  className={`location-type-btn flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                    locationTypeMode === "point"
                      ? "location-type-btn-active"
                      : "location-type-btn-inactive"
                  }`}
                >
                  {messages.adminLocationPanel.locationTypePoint}
                </button>
                <button
                  type="button"
                  onClick={() => onLocationTypeModeChange?.("polygon")}
                  className={`location-type-btn flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                    locationTypeMode === "polygon"
                      ? "location-type-btn-active"
                      : "location-type-btn-inactive"
                  }`}
                >
                  {messages.adminLocationPanel.locationTypePolygon}
                </button>
              </div>
            </div>

            {/* Relocate – move the centre point on the map */}
            {onToggleRelocate && (
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={() => {
                    if (!relocateMode) {
                      // Switch to point mode so polygon draw doesn't capture map clicks
                      if (locationTypeMode === "polygon") {
                        onLocationTypeModeChange?.("point");
                      }
                      onToggleRelocate();
                    }
                  }}
                  variant={relocateMode ? "default" : "outline"}
                  className="h-auto w-full justify-start gap-2 px-3 py-2 text-left whitespace-normal"
                >
                  <Crosshair className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 leading-snug">
                    {relocateMode
                      ? messages.adminLocationPanel.chooseLocationOnMap
                      : messages.adminLocationPanel.updateLocationOnMap}
                  </span>
                </Button>

                {relocateMode && (
                  <div className="flex flex-col gap-2 min-w-0 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 min-w-0 whitespace-normal text-center"
                      onClick={handleRestoreRelocate}
                    >
                      {messages.adminLocationPanel.restoreOriginal}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 min-w-0 whitespace-normal text-center"
                      disabled={relocateSaveDisabled}
                      onClick={handleFinishRelocate}
                    >
                      {messages.adminLocationPanel.finishUpdate}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Polygon draw controls */}
            {locationTypeMode === "polygon" && (
              <div className="polygon-draw-panel space-y-2 rounded-lg border p-3">
                <p className="polygon-draw-hint text-xs">{messages.adminLocationPanel.polygonDrawHint}</p>
                <p className="polygon-draw-count text-xs font-medium">
                  {messages.adminLocationPanel.polygonNodeCount.replace(
                    "{count}",
                    String(polygonNodes.length)
                  )}
                </p>
                {polygonParts.length > 0 && (
                  <p className="polygon-draw-count text-xs font-medium">
                    {messages.adminLocationPanel.polygonPartCount.replace(
                      "{count}",
                      String(polygonParts.length)
                    )}
                  </p>
                )}
                <div className="flex gap-2 min-w-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-0 truncate locations-outline-button"
                    disabled={polygonNodes.length < 1}
                    onClick={() => onPolygonNodesChange?.(polygonNodes.slice(0, -1))}
                  >
                    <span className="truncate">{messages.adminLocationPanel.polygonUndo}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-0 truncate locations-outline-button"
                    disabled={polygonNodes.length < 1}
                    onClick={() => onPolygonNodesChange?.([])}  
                  >
                    <span className="truncate">{messages.adminLocationPanel.polygonClear}</span>
                  </Button>
                </div>
                {polygonParts.length > 0 && (
                  <div className="flex gap-2 min-w-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-0 truncate locations-outline-button"
                      onClick={() => onPolygonPartsChange?.(polygonParts.slice(0, -1))}
                    >
                      <span className="truncate">{messages.adminLocationPanel.polygonRemoveLastPart}</span>
                    </Button>
                  </div>
                )}
                {polygonNodes.length >= 3 && (
                  <div className="flex gap-2 min-w-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-0 truncate locations-outline-button"
                      disabled={polygonInvalid}
                      onClick={() => {
                        // Close current part and add to polygonParts
                        onPolygonPartsChange?.([...polygonParts, polygonNodes]);
                        onPolygonNodesChange?.([]);
                      }}
                    >
                      <span className="truncate">{messages.adminLocationPanel.polygonClosePart}</span>
                    </Button>
                  </div>
                )}
                {polygonNodes.length >= 3 && !polygonInvalid && (
                  <p className="polygon-draw-hint text-xs">{messages.adminLocationPanel.polygonCenterHint}</p>
                )}
                {polygonInvalid && (
                  <p className="polygon-draw-error text-xs font-medium">{messages.adminLocationPanel.polygonSelfIntersects}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="panel-location-name">{messages.adminLocationPanel.name}</Label>
              <Input
                id="panel-location-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={messages.adminLocationPanel.namePlaceholder}
                autoFocus={props.mode === "add"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{messages.adminLocationPanel.coordinates}</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="panel-longitude" className="text-xs text-muted-foreground">
                    Longitude
                  </Label>
                  <Input
                    id="panel-longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => {
                      const nextLongitude = e.target.value;
                      setLongitude(nextLongitude);
                      const lng = Number.parseFloat(nextLongitude);
                      const lat = Number.parseFloat(latitude);
                      if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
                        onCoordinatesChange?.({ longitude: lng, latitude: lat });
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="panel-latitude" className="text-xs text-muted-foreground">
                    Latitude
                  </Label>
                  <Input
                    id="panel-latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => {
                      const nextLatitude = e.target.value;
                      setLatitude(nextLatitude);
                      const lng = Number.parseFloat(longitude);
                      const lat = Number.parseFloat(nextLatitude);
                      if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
                        onCoordinatesChange?.({ longitude: lng, latitude: lat });
                      }
                    }}
                  />
                </div>
              </div>
              {!longitude.trim() || !latitude.trim() ? (
                <p className="text-xs text-muted-foreground">
                  {messages.adminLocationPanel.chooseLocationOnMap}
                </p>
              ) : null}
            </div>

            {(fieldsDefinitions ?? []).map((field) => {
              const existingField = data?.properties.fields.find((f) => f.id === field.id);
              const choices = existingField?.options?.choices ?? field.options?.choices ?? [];
              const choiceInfo = existingField?.options?.choiceInfo ?? field.options?.choiceInfo ?? {};
              const placeholder = existingField?.options?.placeholder ?? field.options?.placeholder ?? "";
              const required = existingField?.required ?? field.required;
              const selectedCount = (fieldValues[field.id] ?? []).filter(Boolean).length;
              const isCollapsible =
                field.field_type === "multi_select" ||
                field.field_type === "address" ||
                field.field_type === "opening_hours";
              const isExpanded = expandedFieldIds[field.id] ?? false;
              return (
              <div key={field.id} className="space-y-2">
                {isCollapsible ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50/60">
                    <button
                      type="button"
                      onClick={() => toggleFieldSection(field.id)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                      aria-expanded={isExpanded}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {field.name}
                          {required && <span className="text-destructive ml-1">*</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {field.field_type === "address"
                            ? formatAddressValues(fieldValues[field.id] ?? []) ||
                              messages.adminLocationPanel.addressDetailsEmpty
                            : selectedCount > 0
                            ? messages.adminLocationPanel.selectedCount.replace("{count}", String(selectedCount))
                            : messages.adminLocationPanel.noSelections}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="space-y-2 border-t border-gray-200 bg-white px-3 py-3">
                        {field.field_type === "multi_select" && (
                          <div className="space-y-1.5">
                            {choices.map((choice) => {
                              const checked = (fieldValues[field.id] ?? []).includes(choice);
                              return (
                                <div key={choice} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`${field.id}-${choice}`}
                                    checked={checked}
                                    onCheckedChange={(v) =>
                                      setFieldValues((prev) => {
                                        const current = prev[field.id] ?? [];
                                        return {
                                          ...prev,
                                          [field.id]: v
                                            ? [...current, choice]
                                            : current.filter((c) => c !== choice),
                                        };
                                      })
                                    }
                                  />
                                  <label
                                    htmlFor={`${field.id}-${choice}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {localizeMaterialNameCandidate(choice, locale)}
                                  </label>
                                  {choiceInfo[choice] && (
                                    <button
                                      type="button"
                                      className="text-muted-foreground hover:text-foreground"
                                      aria-label={messages.adminLocationPanel.choiceInfoAria}
                                      title={messages.adminLocationPanel.choiceInfoAria}
                                      onClick={() => setInfoChoice({ choice, text: choiceInfo[choice] })}
                                    >
                                      <InfoIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {field.field_type === "address" && (
                          <AddressFieldInput
                            values={fieldValues[field.id] ?? []}
                            onChange={(values) =>
                              setFieldValues((prev) => ({ ...prev, [field.id]: values }))
                            }
                            coordinates={coordinates}
                            onLocate={
                              locationTypeMode === "point"
                                ? (lngLat) => {
                                    setLongitude(String(lngLat.longitude));
                                    setLatitude(String(lngLat.latitude));
                                    onCoordinatesChange?.(lngLat);
                                  }
                                : undefined
                            }
                          />
                        )}

                        {field.field_type === "opening_hours" && (() => {
                          const DAYS = [
                            { key: "ma", label: "Maanantai" },
                            { key: "ti", label: "Tiistai" },
                            { key: "ke", label: "Keskiviikko" },
                            { key: "to", label: "Torstai" },
                            { key: "pe", label: "Perjantai" },
                            { key: "la", label: "Lauantai" },
                            { key: "su", label: "Sunnuntai" },
                          ];
                          const entries: Record<string, { open: string; close: string } | null> = {};
                          for (const raw of (fieldValues[field.id] ?? [])) {
                            const parts = raw.split("|");
                            if (parts.length === 2 && parts[1] === "closed") entries[parts[0]] = null;
                            else if (parts.length === 3) entries[parts[0]] = { open: parts[1], close: parts[2] };
                          }
                          const setDay = (key: string, val: { open: string; close: string } | null) => {
                            const next = { ...entries, [key]: val };
                            setFieldValues((prev) => ({
                              ...prev,
                              [field.id]: Object.entries(next).map(([k, v]) =>
                                v ? `${k}|${v.open}|${v.close}` : `${k}|closed`
                              ),
                            }));
                          };
                          return (
                            <div className="space-y-2">
                              {DAYS.map(({ key, label }) => {
                                const val = entries[key];
                                const isOpen = val !== null && val !== undefined;
                                return (
                                  <div key={key} className="flex items-center gap-2">
                                    <Checkbox
                                      id={`${field.id}-${key}`}
                                      checked={isOpen}
                                      onCheckedChange={(v) =>
                                        setDay(key, v ? { open: "08:00", close: "20:00" } : null)
                                      }
                                    />
                                    <label
                                      htmlFor={`${field.id}-${key}`}
                                      className="text-sm w-24 shrink-0 cursor-pointer"
                                    >
                                      {label}
                                    </label>
                                    {isOpen && (
                                      <>
                                        <Input
                                          type="time"
                                          className="w-28 text-sm"
                                          value={val!.open}
                                          onChange={(e) => setDay(key, { open: e.target.value, close: val!.close })}
                                        />
                                        <span className="text-sm text-muted-foreground">–</span>
                                        <Input
                                          type="time"
                                          className="w-28 text-sm"
                                          value={val!.close}
                                          onChange={(e) => setDay(key, { open: val!.open, close: e.target.value })}
                                        />
                                      </>
                                    )}
                                    {!isOpen && (
                                      <span className="text-sm text-muted-foreground">Suljettu</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Label>
                      {field.name}
                      {required && <span className="text-destructive ml-1">*</span>}
                    </Label>

                    {field.field_type === "text_input" && (
                      <Input
                        value={(fieldValues[field.id] ?? [])[0] ?? ""}
                        placeholder={placeholder}
                        onChange={(e) =>
                          setFieldValues((prev) => ({
                            ...prev,
                            [field.id]: e.target.value ? [e.target.value] : [],
                          }))
                        }
                      />
                    )}
                  </>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {isReady && (
        <div className="shrink-0 border-t border-gray-200 p-4">
          {mutation.isError && (
            <p className="text-xs text-destructive mb-2">
              {messages.adminLocationPanel.saveFailed}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={mutation.isPending}
              onClick={onClose}
            >
              {messages.adminLocationPanel.cancel}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={!isValid || mutation.isPending || !isDirty}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? messages.adminLocationPanel.saving : messages.adminLocationPanel.save}
            </Button>
          </div>
        </div>
      )}
    </div>

      <ChoiceInfoDialog info={infoChoice} onClose={() => setInfoChoice(null)} />
    </>
  );
};
