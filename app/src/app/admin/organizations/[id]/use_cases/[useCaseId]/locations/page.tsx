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
import { LocationEditPanel } from "@/components/admin/location-edit-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteLocation, getLocations } from "@/services/api";

const LocationsPage = () => {
  const params = useParams<{ id: string; useCaseId: string }>();
  const organizationId = params.id;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [addMode, setAddMode] = useState(false);
  const [addDraft, setAddDraft] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  const [editId, setEditId] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    { id: string; name: string } | null
  >(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["locations", organizationId, params.useCaseId],
    queryFn: () => getLocations(organizationId, params.useCaseId),
  });

  const deleteMutation = useMutation({
    mutationFn: (locationId: string) =>
      deleteLocation(organizationId, params.useCaseId, locationId),
    onSuccess: async () => {
      const deletedId = deleteTarget?.id;
      await queryClient.invalidateQueries({
        queryKey: ["locations", organizationId, params.useCaseId],
      });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      if (deletedId && selectedId === deletedId) setSelectedId(null);
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
                setEditId(null);
                setAddDraft(lngLat);
              }}
            />
          }
          rightPanel={
            addDraft ? (
              <LocationEditPanel
                mode="add"
                lngLat={addDraft}
                organizationId={organizationId}
                useCaseId={params.useCaseId}
                onClose={() => { setAddDraft(null); setAddMode(false); }}
                onSaved={(newId) => {
                  setAddDraft(null);
                  setAddMode(false);
                  if (newId) setSelectedId(newId);
                }}
              />
            ) : editId ? (
              <LocationEditPanel
                mode="edit"
                locationId={editId}
                organizationId={organizationId}
                useCaseId={params.useCaseId}
                onClose={() => setEditId(null)}
                onSaved={() => setEditId(null)}
              />
            ) : undefined
          }
        >
          <AdminList
            items={locations.map((location) => ({
              id: location.id,
              title: location.title,
              actions: (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(location.id);
                      setEditId(location.id);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Muokkaa</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setDeleteTarget({ id: location.id, name: location.name });
                      setDeleteDialogOpen(true);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Poista</span>
                  </Button>
                </div>
              ),
            }))}
            emptyMessage="Tällä organisaatiolla ei ole vielä kohteita."
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </SplitMapLayout>
      )}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Poistetaanko kohde?</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-muted-foreground">
            {deleteTarget?.name
              ? `Oletko varma, että haluat poistaa kohteen "${deleteTarget.name}"? Tätä ei voi perua.`
              : "Oletko varma, että haluat poistaa tämän kohteen? Tätä ei voi perua."}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Peruuta
            </Button>
            <Button
              type="button"
              variant="destructive"
              isLoading={deleteMutation.isPending}
              disabled={!deleteTarget?.id || deleteMutation.isPending}
              onClick={() => {
                if (!deleteTarget?.id) return;
                deleteMutation.mutate(deleteTarget.id);
              }}
            >
              Poista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
};

export default LocationsPage;
