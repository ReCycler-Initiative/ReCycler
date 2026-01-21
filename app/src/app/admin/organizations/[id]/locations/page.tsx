"use client";

import { useState } from "react";
import { AdminList } from "@/components/admin/admin-list";
import { AdminMapView, LocationMarker } from "@/components/admin/admin-map-view";
import { SplitMapLayout } from "@/components/admin/split-map-layout";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";

// Mock data with coordinates for demonstration (Tampere region)
const mockLocations: (LocationMarker & { title: string })[] = [
  { id: "1", name: "Rinki-ekopiste Keskusta", title: "Rinki-ekopiste Keskusta", longitude: 23.7610, latitude: 61.4978 },
  { id: "2", name: "Rinki-ekopiste Kaleva", title: "Rinki-ekopiste Kaleva", longitude: 23.7920, latitude: 61.5010 },
  { id: "3", name: "Rinki-ekopiste Hervanta", title: "Rinki-ekopiste Hervanta", longitude: 23.8500, latitude: 61.4500 },
  { id: "4", name: "Rinki-ekopiste Lielahti", title: "Rinki-ekopiste Lielahti", longitude: 23.6850, latitude: 61.5150 },
  { id: "5", name: "Rinki-ekopiste Tesoma", title: "Rinki-ekopiste Tesoma", longitude: 23.6320, latitude: 61.4820 },
  { id: "6", name: "Rinki-ekopiste Linnainmaa", title: "Rinki-ekopiste Linnainmaa", longitude: 23.8280, latitude: 61.5080 },
  { id: "7", name: "Rinki-ekopiste Härmälä", title: "Rinki-ekopiste Härmälä", longitude: 23.7450, latitude: 61.4680 },
  { id: "8", name: "Rinki-ekopiste Peltolammi", title: "Rinki-ekopiste Peltolammi", longitude: 23.7200, latitude: 61.4420 },
  { id: "9", name: "Rinki-ekopiste Multisilta", title: "Rinki-ekopiste Multisilta", longitude: 23.8100, latitude: 61.4350 },
  { id: "10", name: "Rinki-ekopiste Kaukajärvi", title: "Rinki-ekopiste Kaukajärvi", longitude: 23.8650, latitude: 61.4780 },
  { id: "11", name: "Rinki-ekopiste Messukylä", title: "Rinki-ekopiste Messukylä", longitude: 23.8350, latitude: 61.4920 },
  { id: "12", name: "Rinki-ekopiste Nekala", title: "Rinki-ekopiste Nekala", longitude: 23.7980, latitude: 61.4750 },
  { id: "13", name: "Rinki-ekopiste Rahola", title: "Rinki-ekopiste Rahola", longitude: 23.6680, latitude: 61.4950 },
  { id: "14", name: "Rinki-ekopiste Takahuhti", title: "Rinki-ekopiste Takahuhti", longitude: 23.8150, latitude: 61.5200 },
  { id: "15", name: "Rinki-ekopiste Atala", title: "Rinki-ekopiste Atala", longitude: 23.8720, latitude: 61.4620 },
  { id: "16", name: "Rinki-ekopiste Lamminpää", title: "Rinki-ekopiste Lamminpää", longitude: 23.6150, latitude: 61.4720 },
  { id: "17", name: "Rinki-ekopiste Ikuri", title: "Rinki-ekopiste Ikuri", longitude: 23.6480, latitude: 61.5050 },
  { id: "18", name: "Rinki-ekopiste Olkahinen", title: "Rinki-ekopiste Olkahinen", longitude: 23.8400, latitude: 61.5150 },
  { id: "19", name: "Rinki-ekopiste Vuores", title: "Rinki-ekopiste Vuores", longitude: 23.7850, latitude: 61.4280 },
  { id: "20", name: "Rinki-ekopiste Kämmenniemi", title: "Rinki-ekopiste Kämmenniemi", longitude: 23.7100, latitude: 61.5580 },
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
