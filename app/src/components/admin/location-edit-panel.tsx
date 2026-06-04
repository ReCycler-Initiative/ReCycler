"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLocation, getFields, getLocation, updateLocation } from "@/services/api";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import {
  MapboxAddressResult,
  reverseGeocodeMapbox,
  searchMapboxAddresses,
} from "@/lib/mapbox-geocoding";
import { localizeMaterialNameCandidate } from "@/lib/material-translations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronRight,
  Crosshair,
  Loader2,
  LocateFixed,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
};

type EditProps = {
  mode: "edit";
  locationId: string;
  onSaved: () => void;
  onDelete?: () => void;
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
  const queryClient = useQueryClient();

  const locationId = props.mode === "edit" ? props.locationId : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["location", organizationId, useCaseId, locationId],
    queryFn: () => getLocation(organizationId, useCaseId, locationId!),
    enabled: props.mode === "edit",
  });

  const { data: fieldsDefinitions } = useQuery({
    queryKey: ["fields", organizationId, useCaseId],
    queryFn: () => getFields(organizationId, useCaseId),
    staleTime: Infinity,
  });

  const [name, setName] = useState("");
  const [longitude, setLongitude] = useState(
    props.mode === "add" ? String(props.lngLat?.longitude ?? "") : ""
  );
  const [latitude, setLatitude] = useState(
    props.mode === "add" ? String(props.lngLat?.latitude ?? "") : ""
  );
  const [addressQuery, setAddressQuery] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [addressResults, setAddressResults] = useState<MapboxAddressResult[]>([]);
  const [addressLookupMessage, setAddressLookupMessage] = useState<string | null>(null);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string[]>>({});
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [pendingGeocode, setPendingGeocode] = useState<{
    fieldId: string;
    values: [string, string, string];
  } | null>(null);
  const [addressDetailsOpen, setAddressDetailsOpen] = useState(true);
  const [expandedFieldIds, setExpandedFieldIds] = useState<Record<string, boolean>>({});

  const toggleFieldSection = (fieldId: string) => {
    setExpandedFieldIds((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const geocodeFromCoordinates = async (fieldId: string, lng: number, lat: number) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    setIsGeocodingAddress(true);
    try {
      const r = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=address&language=fi&access_token=${token}`
      );
      const json = await r.json();
      const feature = json.features?.[0];
      if (!feature) {
        toast.error("Osoitetta ei löytynyt");
        return;
      }
      const street = feature.address
        ? `${feature.text} ${feature.address}`
        : (feature.text ?? "");
      const postalCode =
        feature.context?.find((c: { id: string; text: string }) => c.id.startsWith("postcode"))?.text ?? "";
      const city =
        feature.context?.find((c: { id: string; text: string }) => c.id.startsWith("place"))?.text ?? "";
      setPendingGeocode({ fieldId, values: [street, postalCode, city] });
    } catch {
      toast.error("Osoitteen haku epäonnistui");
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  const applyAddressResult = (
    result: MapboxAddressResult,
    updateCoordinates = true
  ) => {
    setAddress(result.address);
    setPostalCode(result.postalCode);
    setPostOffice(result.postOffice);
    setAddressQuery(result.label || result.address);
    setAddressResults([]);
    setAddressLookupMessage(null);

    if (updateCoordinates) {
      setLongitude(String(result.longitude));
      setLatitude(String(result.latitude));
      onCoordinatesChange?.({
        longitude: result.longitude,
        latitude: result.latitude,
      });
    }
  };

  const selectAddressResult = (result: MapboxAddressResult) => {
    applyAddressResult(result, true);
  };

  const resolveAddressFromCoordinates = async () => {
    const lng = Number.parseFloat(longitude);
    const lat = Number.parseFloat(latitude);

    if (Number.isNaN(lng) || Number.isNaN(lat)) {
      setAddressLookupMessage(messages.adminLocationPanel.addressLookupFailed);
      return;
    }

    setIsResolvingAddress(true);
    setAddressLookupMessage(null);
    setAddressResults([]);

    try {
      const result = await reverseGeocodeMapbox(lng, lat, locale);
      if (!result) {
        setAddressLookupMessage(messages.adminLocationPanel.noAddressFound);
        return;
      }

      applyAddressResult(result, false);
    } catch {
      setAddressLookupMessage(messages.adminLocationPanel.addressLookupFailed);
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const handleAddressSearch = async () => {
    if (!addressQuery.trim()) {
      setAddressResults([]);
      setAddressLookupMessage(null);
      return;
    }

    setIsSearchingAddress(true);
    setAddressLookupMessage(null);

    try {
      const results = await searchMapboxAddresses(addressQuery, locale);
      setAddressResults(results);
      if (results.length === 0) {
        setAddressLookupMessage(messages.adminLocationPanel.noAddressFound);
      }
    } catch {
      setAddressResults([]);
      setAddressLookupMessage(messages.adminLocationPanel.addressLookupFailed);
    } finally {
      setIsSearchingAddress(false);
    }
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
    if (
      isResolvingAddress ||
      isSearchingAddress ||
      addressResults.length > 0 ||
      addressLookupMessage
    ) {
      setAddressDetailsOpen(true);
    }
  }, [addressLookupMessage, addressResults.length, isResolvingAddress, isSearchingAddress]);

  useEffect(() => {
    if (props.mode !== "edit" || !data) return;
    setName(data.properties.name);
    setLongitude(String(data.geometry.coordinates[0]));
    setLatitude(String(data.geometry.coordinates[1]));
    setAddress(data.properties.address ?? "");
    setPostalCode(data.properties.postal_code ?? "");
    setPostOffice(data.properties.post_office ?? "");
    setAddressQuery(data.properties.address ?? "");
    const initial: Record<string, string[]> = {};
    for (const f of data.properties.fields) {
      initial[f.id] = f.value;
    }
    setFieldValues(initial);
  }, [data, props.mode]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (props.mode === "add") {
        const created = await createLocation(organizationId, useCaseId, {
          address: address.trim() || undefined,
          fieldValues: Object.entries(fieldValues).map(([fieldId, values]) => ({
            fieldId,
            values,
          })),
          name: name.trim(),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          post_office: postOffice.trim() || undefined,
          postal_code: postalCode.trim() || undefined,
        });
        return created;
      }
      return updateLocation(organizationId, useCaseId, locationId!, {
        address: address.trim() || undefined,
        name: name.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        post_office: postOffice.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
        fieldValues: Object.entries(fieldValues).map(([fieldId, values]) => ({
          fieldId,
          values,
        })),
      });
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
  });

  const isValid =
    name.trim().length > 0 &&
    !isNaN(parseFloat(longitude)) &&
    !isNaN(parseFloat(latitude));

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
      address: data.properties.address ?? "",
      postalCode: data.properties.postal_code ?? "",
      postOffice: data.properties.post_office ?? "",
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
      address,
      postalCode,
      postOffice,
      fieldValues: normalizeFieldValues(fieldValues),
    });
  }, [address, fieldValues, latitude, longitude, name, postalCode, postOffice, props.mode]);

  const isDirty = props.mode === "add" || (
    initialFormState !== null && currentFormState !== null && initialFormState !== currentFormState
  );

  const isLoading_ = props.mode === "edit" && isLoading;
  const isError_ = props.mode === "edit" && isError;
  const isReady = props.mode === "add" || (!isLoading_ && !isError_ && !!data);

  const title =
    props.mode === "add"
      ? messages.adminLocationPanel.addLocation
      : isLoading_
      ? messages.adminLocationPanel.loading
      : (data?.properties.name ?? messages.adminLocationPanel.editLocation);

  return (
    <>
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden">
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
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">{messages.adminLocationPanel.loading}</p>
          </div>
        )}
        {isError_ && (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-destructive">{messages.adminLocationPanel.loadError}</p>
          </div>
        )}
        {isReady && (
          <div className="p-4 space-y-5">
            {props.mode === "edit" && data?.properties.source_type && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
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

            <div className="rounded-lg border border-gray-200 bg-gray-50/60">
              <button
                type="button"
                onClick={() => setAddressDetailsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                aria-expanded={addressDetailsOpen}
              >
                <div>
                  <p className="text-sm font-medium">{messages.adminLocationPanel.addressDetails}</p>
                  <p className="text-xs text-muted-foreground">
                    {address || postalCode || postOffice
                      ? [address, postalCode, postOffice].filter(Boolean).join(", ")
                      : messages.adminLocationPanel.addressDetailsEmpty}
                  </p>
                </div>
                {addressDetailsOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>

              {addressDetailsOpen && (
                <div className="space-y-4 border-t border-gray-200 bg-white px-3 py-3">
                  <div className="space-y-2">
                    <Label htmlFor="panel-address-search">{messages.adminLocationPanel.addressSearch}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="panel-address-search"
                        value={addressQuery}
                        onChange={(e) => setAddressQuery(e.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void handleAddressSearch();
                          }
                        }}
                        placeholder={messages.adminLocationPanel.addressSearchPlaceholder}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSearchingAddress || !addressQuery.trim()}
                        onClick={() => void handleAddressSearch()}
                      >
                        {isSearchingAddress ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          messages.adminLocationPanel.addressSearch
                        )}
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isResolvingAddress}
                      onClick={() => void resolveAddressFromCoordinates()}
                    >
                      {isResolvingAddress ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {messages.adminLocationPanel.resolvingAddress}
                        </span>
                      ) : (
                        messages.adminLocationPanel.suggestAddressFromCoordinates
                      )}
                    </Button>

                    {isSearchingAddress && (
                      <p className="text-xs text-muted-foreground">
                        {messages.adminLocationPanel.searchingAddress}
                      </p>
                    )}

                    {addressLookupMessage && (
                      <p className="text-xs text-muted-foreground">{addressLookupMessage}</p>
                    )}

                    {addressResults.length > 0 && (
                      <div className="rounded-md border border-gray-200 bg-white">
                        {addressResults.map((result) => (
                          <button
                            key={`${result.longitude}:${result.latitude}:${result.label}`}
                            type="button"
                            onClick={() => selectAddressResult(result)}
                            className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-gray-50"
                          >
                            {result.label || result.address}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="panel-address">{messages.adminLocationPanel.address}</Label>
                    <Input
                      id="panel-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="panel-postal-code">{messages.adminLocationPanel.postalCode}</Label>
                      <Input
                        id="panel-postal-code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="panel-post-office">{messages.adminLocationPanel.postOffice}</Label>
                      <Input
                        id="panel-post-office"
                        value={postOffice}
                        onChange={(e) => setPostOffice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(fieldsDefinitions ?? []).map((field) => {
              const existingField = data?.properties.fields.find((f) => f.id === field.id);
              const choices = existingField?.options?.choices ?? field.options?.choices ?? [];
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
                          {selectedCount > 0
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
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {field.field_type === "address" && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                className="flex-1"
                                value={(fieldValues[field.id] ?? [])[0] ?? ""}
                                placeholder="Katuosoite"
                                onChange={(e) =>
                                  setFieldValues((prev) => {
                                    const cur = prev[field.id] ?? ["", "", ""];
                                    return { ...prev, [field.id]: [e.target.value, cur[1] ?? "", cur[2] ?? ""] };
                                  })
                                }
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                title="Hae osoite koordinaateista"
                                disabled={isGeocodingAddress || isNaN(parseFloat(longitude)) || isNaN(parseFloat(latitude))}
                                onClick={() => {
                                  geocodeFromCoordinates(field.id, parseFloat(longitude), parseFloat(latitude));
                                }}
                              >
                                {isGeocodingAddress
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <LocateFixed className="h-4 w-4" />}
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={(fieldValues[field.id] ?? [])[1] ?? ""}
                                placeholder="Postinumero"
                                onChange={(e) =>
                                  setFieldValues((prev) => {
                                    const cur = prev[field.id] ?? ["", "", ""];
                                    return { ...prev, [field.id]: [cur[0] ?? "", e.target.value, cur[2] ?? ""] };
                                  })
                                }
                              />
                              <Input
                                value={(fieldValues[field.id] ?? [])[2] ?? ""}
                                placeholder="Postitoimipaikka"
                                onChange={(e) =>
                                  setFieldValues((prev) => {
                                    const cur = prev[field.id] ?? ["", "", ""];
                                    return { ...prev, [field.id]: [cur[0] ?? "", cur[1] ?? "", e.target.value] };
                                  })
                                }
                              />
                            </div>
                          </div>
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

            {onToggleRelocate && (
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={() => {
                    if (!relocateMode) onToggleRelocate();
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
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
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
                      }}
                    >
                      {messages.adminLocationPanel.restoreOriginal}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={onConfirmRelocate}
                    >
                      {messages.adminLocationPanel.finishUpdate}
                    </Button>
                  </div>
                )}
              </div>
            )}
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

      {/* Geocode confirmation dialog */}
      <Dialog open={!!pendingGeocode} onOpenChange={(open) => { if (!open) setPendingGeocode(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.adminLocationPanel.updateAddressConfirmTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {messages.adminLocationPanel.updateAddressConfirmDescription}
            </p>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-1">
              <p className="font-medium">{pendingGeocode?.values[0]}</p>
              <p className="text-muted-foreground">
                {pendingGeocode?.values[1]}{pendingGeocode?.values[1] && pendingGeocode?.values[2] ? " " : ""}{pendingGeocode?.values[2]}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingGeocode(null)}>
              {messages.editor.cancel}
            </Button>
            <Button
              onClick={() => {
                if (!pendingGeocode) return;
                setFieldValues((prev) => ({ ...prev, [pendingGeocode.fieldId]: pendingGeocode.values }));
                setPendingGeocode(null);
              }}
            >
              {messages.adminLocationPanel.updateAddress}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
