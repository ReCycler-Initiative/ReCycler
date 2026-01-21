"use client";

import { useState } from "react";
import { AdminList } from "@/components/admin/admin-list";
import { AdminMapView, LocationMarker } from "@/components/admin/admin-map-view";
import { SplitMapLayout } from "@/components/admin/split-map-layout";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";

// Mock data with coordinates for demonstration
const mockLocations: (LocationMarker & { title: string })[] = [
  { id: "1", name: "Rinki-ekopiste Keskusta", title: "Rinki-ekopiste Keskusta", longitude: 23.7610, latitude: 61.4978 },
  { id: "2", name: "Rinki-ekopiste Kaleva", title: "Rinki-ekopiste Kaleva", longitude: 23.7920, latitude: 61.5010 },
  { id: "3", name: "Rinki-ekopiste Hervanta", title: "Rinki-ekopiste Hervanta", longitude: 23.8500, latitude: 61.4500 },
];

const LocationsPage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      fullWidth
    >
      <SplitMapLayout
        map={
          <AdminMapView
            locations={mockLocations}
            selectedId={selectedId}
            onMarkerClick={setSelectedId}
          />
        }
      >
        <AdminList
          items={mockLocations.map((location) => ({
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
    </PageTemplate>
  );
};

export default LocationsPage;
