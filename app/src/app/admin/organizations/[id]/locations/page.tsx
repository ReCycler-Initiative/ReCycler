"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AdminList } from "@/components/admin/admin-list";
import {
  AdminMapView,
  LocationMarker,
} from "@/components/admin/admin-map-view";
import { SplitMapLayout } from "@/components/admin/split-map-layout";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { getLocations } from "@/services/api";

const LocationsPage = () => {
  const params = useParams<{ id: string }>();
  const organizationId = params.id;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["locations", organizationId],
    queryFn: () => getLocations(organizationId),
  });

  // Transform GeoJSON data to LocationMarker format
  const locations: (LocationMarker & { title: string })[] =
    data?.features.map((feature) => ({
      id: feature.properties.id,
      name: feature.properties.name,
      title: feature.properties.name,
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1],
    })) ?? [];

  return (
    <PageTemplate
      title="Kohteet"
      actions={
        <Button asChild>
          <Link href="locations/new">
            <Plus className="h-4 w-4" />
            Lisää kohde
          </Link>
        </Button>
      }
      fullscreen
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
    </PageTemplate>
  );
};

export default LocationsPage;
