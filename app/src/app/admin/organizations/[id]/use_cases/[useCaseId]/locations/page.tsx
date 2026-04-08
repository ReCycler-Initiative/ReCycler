"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AdminList } from "@/components/admin/admin-list";
import {
  AdminMapView,
  LocationMarker,
} from "@/components/admin/admin-map-view";
import { SplitMapLayout } from "@/components/admin/split-map-layout";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, X } from "lucide-react";
import Link from "next/link";
import { createLocation, getLocations } from "@/services/api";

const LocationsPage = () => {
  const params = useParams<{ id: string; useCaseId: string }>();
  const organizationId = params.id;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [addMode, setAddMode] = useState(false);
  const [draftLngLat, setDraftLngLat] = useState<
    { longitude: number; latitude: number } | null
  >(null);
  const [draftName, setDraftName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["locations", organizationId, params.useCaseId],
    queryFn: () => getLocations(organizationId, params.useCaseId),
  });

  const createMutation = useMutation({
    mutationFn: (args: {
      lngLat: { longitude: number; latitude: number };
      name: string;
    }) => {
      return createLocation(organizationId, params.useCaseId, {
        name: args.name.trim(),
        longitude: args.lngLat.longitude,
        latitude: args.lngLat.latitude,
      });
    },
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({
        queryKey: ["locations", organizationId, params.useCaseId],
      });
      setDialogOpen(false);
      setDraftLngLat(null);
      setDraftName("");
      setAddMode(false);
      if (created?.properties?.id) setSelectedId(created.properties.id);
    },
  });

  // Transform GeoJSON data to LocationMarker format
  const locations: (LocationMarker & { title: string })[] = useMemo(
    () =>
      data?.features.map((feature) => ({
        id: feature.properties.id,
        name: feature.properties.name,
        title: feature.properties.name,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
      })) ?? [],
    [data]
  );

  return (
    <PageTemplate
      title="Kohteet"
      actions={
        <Button
          type="button"
          onClick={() => setAddMode((v) => !v)}
          disabled={createMutation.isPending}
          variant={addMode ? "outline" : "default"}
        >
          {addMode ? (
            <>
              <X className="h-4 w-4" />
              Peruuta lisääminen
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Lisää kohde
            </>
          )}
        </Button>
      }
      mode="fullScreen"
    >
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Ladataan kohteita...</p>
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center h-96">
          <p className="text-destructive">Virhe kohteiden lataamisessa</p>
        </div>
      )}

      {!isLoading && !isError && (
        <SplitMapLayout
          map={
            <AdminMapView
              locations={locations}
              selectedId={selectedId}
              onMarkerClick={setSelectedId}
              addMode={addMode}
              onMapClick={(lngLat) => {
                if (!addMode) return;

                const now = new Date();
                const defaultName = `Uusi kohde ${now
                  .toISOString()
                  .slice(0, 16)
                  .replace("T", " ")}`;

                setDraftLngLat(lngLat);
                setDraftName(defaultName);
                setDialogOpen(true);
              }}
            />
          }
        >
          <AdminList
            items={locations.map((location) => ({
              id: location.id,
              title: location.title,
              actions: (
                <Button asChild variant="outline" size="icon">
                  <Link href={`locations/${location.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Muokkaa</span>
                  </Link>
                </Button>
              ),
            }))}
            emptyMessage="Tällä organisaatiolla ei ole vielä kohteita."
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </SplitMapLayout>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setDraftLngLat(null);
            setDraftName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lisää kohde</DialogTitle>
          </DialogHeader>

          {draftLngLat && (
            <div className="text-xs text-gray-600">
              Sijainti: {draftLngLat.latitude.toFixed(6)}, {draftLngLat.longitude.toFixed(6)}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location-name">Kohteen nimi</Label>
            <input
              id="location-name"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Esim. Uusi palvelupiste"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={createMutation.isPending}
            >
              Peruuta
            </Button>
            <Button
              type="button"
              disabled={
                createMutation.isPending || !draftLngLat || !draftName.trim()
              }
              onClick={() => {
                if (!draftLngLat) return;
                createMutation.mutate({ lngLat: draftLngLat, name: draftName });
              }}
            >
              {createMutation.isPending ? "Tallennetaan…" : "Tallenna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
};

export default LocationsPage;
