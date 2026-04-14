"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLocation, getLocation, updateLocation } from "@/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crosshair, MoreHorizontal, Trash2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AddProps = {
  mode: "add";
  lngLat: { longitude: number; latitude: number };
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
  relocateMode?: boolean;
  onToggleRelocate?: () => void;
  onConfirmRelocate?: () => void;
  onCancelRelocate?: () => void;
  pickedLngLat?: { longitude: number; latitude: number };
} & (AddProps | EditProps);

export const LocationEditPanel = (props: LocationEditPanelProps) => {
  const { organizationId, useCaseId, onClose, relocateMode, onToggleRelocate, onConfirmRelocate, onCancelRelocate, pickedLngLat } = props;
  const queryClient = useQueryClient();

  const locationId = props.mode === "edit" ? props.locationId : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["location", organizationId, useCaseId, locationId],
    queryFn: () => getLocation(organizationId, useCaseId, locationId!),
    enabled: props.mode === "edit",
  });

  const [name, setName] = useState("");
  const [longitude, setLongitude] = useState(
    props.mode === "add" ? String(props.lngLat.longitude) : ""
  );
  const [latitude, setLatitude] = useState(
    props.mode === "add" ? String(props.lngLat.latitude) : ""
  );

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
  }, [pickedLngLat]);

  useEffect(() => {
    if (props.mode !== "edit" || !data) return;
    setName(data.properties.name);
    setLongitude(String(data.geometry.coordinates[0]));
    setLatitude(String(data.geometry.coordinates[1]));
  }, [data, props.mode]);

  const mutation = useMutation({
    mutationFn: () => {
      if (props.mode === "add") {
        return createLocation(organizationId, useCaseId, {
          name: name.trim(),
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude),
        });
      }
      return updateLocation(organizationId, useCaseId, locationId!, {
        name: name.trim(),
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
      });
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["locations", organizationId, useCaseId],
      });
      if (props.mode === "add") {
        toast.success("Kohde lisätty");
        props.onSaved(result?.properties?.id ?? "");
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["location", organizationId, useCaseId, locationId],
        });
        toast.success("Kohde tallennettu");
        props.onSaved();
      }
    },
  });

  const isValid =
    name.trim().length > 0 &&
    !isNaN(parseFloat(longitude)) &&
    !isNaN(parseFloat(latitude));

  const isLoading_ = props.mode === "edit" && isLoading;
  const isError_ = props.mode === "edit" && isError;
  const isReady = props.mode === "add" || (!isLoading_ && !isError_ && !!data);

  const title =
    props.mode === "add"
      ? "Lisää kohde"
      : isLoading_
      ? "Ladataan..."
      : (data?.properties.name ?? "Muokkaa kohdetta");

  return (
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
                aria-label="Lisää toimintoja"
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
                Poista kohde
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Sulje"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {isLoading_ && (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Ladataan...</p>
          </div>
        )}
        {isError_ && (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-destructive">Virhe kohteen lataamisessa</p>
          </div>
        )}
        {isReady && (
          <div className="p-4 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="panel-location-name">Nimi</Label>
              <Input
                id="panel-location-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kohteen nimi"
                autoFocus={props.mode === "add"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Koordinaatit</Label>
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
                    onChange={(e) => setLongitude(e.target.value)}
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
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {onToggleRelocate && !relocateMode && (
              <button
                type="button"
                onClick={onToggleRelocate}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border transition-colors w-full border-gray-200 bg-white text-muted-foreground hover:text-foreground hover:border-gray-400"
              >
                <Crosshair className="h-4 w-4 shrink-0" />
                Päivitä sijainti valitsemalla kartalta uusi
              </button>
            )}

            {relocateMode && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-primary bg-primary text-primary-foreground">
                  <Crosshair className="h-4 w-4 shrink-0" />
                  <span>Klikkaa karttaa valitaksesi sijainti</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (savedLngLat.current) {
                        setLongitude(savedLngLat.current.longitude);
                        setLatitude(savedLngLat.current.latitude);
                      }
                      onCancelRelocate?.();
                    }}
                    className="flex-1 text-sm px-3 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Kumoa
                  </button>
                  <button
                    type="button"
                    onClick={onConfirmRelocate}
                    className="flex-1 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Vahvista sijainti
                  </button>
                </div>
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
              Tallennus epäonnistui. Yritä uudelleen.
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
              Peruuta
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={!isValid || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Tallennetaan..." : "Tallenna"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
