"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLocation, updateLocation } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export interface LocationEditPanelProps {
  locationId: string;
  organizationId: string;
  useCaseId: string;
  onClose: () => void;
  onSaved: () => void;
}

export const LocationEditPanel = ({
  locationId,
  organizationId,
  useCaseId,
  onClose,
  onSaved,
}: LocationEditPanelProps) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["location", organizationId, useCaseId, locationId],
    queryFn: () => getLocation(organizationId, useCaseId, locationId),
  });

  const [name, setName] = useState("");
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");

  useEffect(() => {
    if (!data) return;
    setName(data.properties.name);
    setLongitude(String(data.geometry.coordinates[0]));
    setLatitude(String(data.geometry.coordinates[1]));
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      updateLocation(organizationId, useCaseId, locationId, {
        name: name.trim(),
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["locations", organizationId, useCaseId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["location", organizationId, useCaseId, locationId],
      });
      onSaved();
    },
  });

  const isValid =
    name.trim().length > 0 &&
    !isNaN(parseFloat(longitude)) &&
    !isNaN(parseFloat(latitude));

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 shrink-0">
        <h2 className="text-sm font-semibold truncate flex-1">
          {isLoading ? "Ladataan..." : (data?.properties.name ?? "Muokkaa kohdetta")}
        </h2>
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
        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Ladataan...</p>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-destructive">Virhe kohteen lataamisessa</p>
          </div>
        )}

        {!isLoading && !isError && data && (
          <div className="p-4 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="edit-location-name">Nimi</Label>
              <Input
                id="edit-location-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kohteen nimi"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Koordinaatit</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="edit-longitude" className="text-xs text-muted-foreground">
                    Longitude
                  </Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-latitude" className="text-xs text-muted-foreground">
                    Latitude
                  </Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!isLoading && !isError && data && (
        <div className="shrink-0 border-t border-gray-200 p-4">
          {mutation.isError && (
            <p className="text-xs text-destructive mb-2">
              Tallennus epäonnistui. Yritä uudelleen.
            </p>
          )}
          <Button
            type="button"
            className="w-full"
            disabled={!isValid || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Tallennetaan..." : "Tallenna"}
          </Button>
        </div>
      )}
    </div>
  );
};
