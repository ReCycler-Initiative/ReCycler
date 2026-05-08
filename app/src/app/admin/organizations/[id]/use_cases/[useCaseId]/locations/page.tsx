"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { useMessages } from "@/i18n/locale-provider";
import { deleteLocation, getLocations } from "@/services/api";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 15;

const LocationsPage = () => {
  const messages = useMessages();
  const params = useParams<{ id: string; useCaseId: string }>();
  const organizationId = params.id;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [addMode, setAddMode] = useState(false);
  const [addDraft, setAddDraft] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [relocateMode, setRelocateMode] = useState(false);
  const [pickedLngLat, setPickedLngLat] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

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
      setEditId(null);
      if (deletedId && selectedId === deletedId) setSelectedId(null);
      toast.success(messages.adminLocationPanel.locationDeleted);
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

  const filteredLocations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("fi");
    if (!normalizedQuery) return locations;

    return locations.filter((location) =>
      location.title.toLocaleLowerCase("fi").includes(normalizedQuery)
    );
  }, [locations, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLocations.length / ITEMS_PER_PAGE)
  );

  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLocations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredLocations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const selectLocation = (id: string) => {
    if (addMode) {
      if (addDraft) toast("Uuden kohteen luonti peruttu");
      setAddMode(false);
      setAddDraft(null);
    }

    const filteredIndex = filteredLocations.findIndex((location) => location.id === id);
    if (filteredIndex >= 0) {
      setCurrentPage(Math.floor(filteredIndex / ITEMS_PER_PAGE) + 1);
    }

    setSelectedId(id);
    setEditId(id);
  };

  // When relocating, replace the edited location's coords with pickedLngLat on the map
  const displayLocations = useMemo(() => {
    if (!pickedLngLat || !editId) return locations;
    return locations.map((l) =>
      l.id === editId
        ? { ...l, longitude: pickedLngLat.longitude, latitude: pickedLngLat.latitude }
        : l
    );
  }, [locations, pickedLngLat, editId]);

  // Ghost marker = original position of the location being relocated
  const ghostMarker = useMemo(() => {
    if (!relocateMode || !pickedLngLat || !editId) return undefined;
    const orig = locations.find((l) => l.id === editId);
    return orig ? { longitude: orig.longitude, latitude: orig.latitude } : undefined;
  }, [relocateMode, pickedLngLat, editId, locations]);

  return (
    <PageTemplate
      title={messages.adminLocations.title}
      actions={
        <Button
          type="button"
          onClick={() => {
            setAddMode((current) => {
              const next = !current;
              if (next) {
                setEditId(null);
                setSelectedId(null);
                setRelocateMode(false);
                setPickedLngLat(null);
              } else {
                setAddDraft(null);
              }
              return next;
            });
          }}
          variant={addMode ? "outline" : "default"}
        >
          {addMode ? (
            <>
              <X className="h-4 w-4" />
              {messages.adminLocations.cancelAdding}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              {messages.adminLocations.addLocation}
            </>
          )}
        </Button>
      }
      mode="fullScreen"
    >
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">{messages.adminLocations.loadingLocations}</p>
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center h-96">
          <p className="text-destructive">{messages.adminLocations.loadError}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <SplitMapLayout
          map={
            <AdminMapView
              locations={displayLocations}
              selectedId={selectedId}
              onMarkerClick={selectLocation}
              addMode={addMode || relocateMode}
              ghostMarker={ghostMarker}
              draftMarker={addDraft ?? undefined}
              onMapClick={(lngLat) => {
                if (relocateMode) {
                  setPickedLngLat(lngLat);
                  return;
                }
                if (!addMode) return;
                setEditId(null);
                setAddDraft(lngLat);
              }}
            />
          }
          rightPanel={
            addMode ? (
              <LocationEditPanel
                key={`add:${addDraft ? `${addDraft.longitude}:${addDraft.latitude}` : "empty"}`}
                mode="add"
                lngLat={addDraft ?? undefined}
                organizationId={organizationId}
                useCaseId={params.useCaseId}
                onCoordinatesChange={setAddDraft}
                onClose={() => { setAddDraft(null); setAddMode(false); }}
                onSaved={(newId) => {
                  setAddDraft(null);
                  setAddMode(false);
                  if (newId) setSelectedId(newId);
                }}
              />
            ) : editId ? (
              <LocationEditPanel
                key={`edit:${editId}`}
                mode="edit"
                locationId={editId}
                organizationId={organizationId}
                useCaseId={params.useCaseId}
                onCoordinatesChange={setPickedLngLat}
                onClose={() => { setEditId(null); setRelocateMode(false); setPickedLngLat(null); }}
                onSaved={() => { setRelocateMode(false); setPickedLngLat(null); }}
                onDelete={() => {
                  const loc = locations.find((l) => l.id === editId);
                  if (loc) setDeleteTarget({ id: loc.id, name: loc.name });
                  setDeleteDialogOpen(true);
                }}
                relocateMode={relocateMode}
                onToggleRelocate={() => setRelocateMode((v) => !v)}
                onConfirmRelocate={() => setRelocateMode(false)}
                onCancelRelocate={() => { setRelocateMode(false); setPickedLngLat(null); }}
                pickedLngLat={pickedLngLat ?? undefined}
              />
            ) : undefined
          }
        >
          <div className="space-y-4 p-1">
            <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={messages.adminLocations.searchPlaceholder}
                aria-label={messages.adminLocations.searchAriaLabel}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {filteredLocations.length === 0
                    ? messages.adminLocations.noSearchResults
                    : `${messages.adminLocations.showingResults} ${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredLocations.length)}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredLocations.length)} / ${filteredLocations.length}`}
                </span>
                <span>{messages.adminLocations.page} {currentPage} / {totalPages}</span>
              </div>
            </div>

            <AdminList
              items={paginatedLocations.map((location) => ({
                id: location.id,
                title: location.title,
                actions: undefined,
              }))}
              emptyMessage={
                searchQuery.trim()
                  ? messages.adminLocations.noSearchResults
                  : messages.adminLocations.noLocationsYet
              }
              selectedId={selectedId}
              onSelect={selectLocation}
            />

            {filteredLocations.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  {messages.adminLocations.previous}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {messages.adminLocations.page} {currentPage} / {totalPages}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                >
                  {messages.adminLocations.next}
                </Button>
              </div>
            )}
          </div>
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
            <DialogTitle>{messages.adminLocations.deleteConfirmTitle}</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-muted-foreground">
            {deleteTarget?.name
              ? messages.adminLocations.deleteConfirmNamed.replace("{name}", deleteTarget.name)
              : messages.adminLocations.deleteConfirmUnnamed}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {messages.adminLocationPanel.cancel}
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
              {messages.adminLocations.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
};

export default LocationsPage;
