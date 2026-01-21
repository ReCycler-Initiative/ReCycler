"use client";

import { useState } from "react";
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

// Mock data with coordinates for demonstration (Tampere region)
const mockLocations: (LocationMarker & { title: string })[] = [
  {
    id: "1",
    name: "Rinki-ekopiste Keskusta",
    title: "Rinki-ekopiste Keskusta",
    longitude: 23.761,
    latitude: 61.4978,
  },
  {
    id: "2",
    name: "Rinki-ekopiste Kaleva",
    title: "Rinki-ekopiste Kaleva",
    longitude: 23.792,
    latitude: 61.501,
  },
  {
    id: "3",
    name: "Rinki-ekopiste Hervanta",
    title: "Rinki-ekopiste Hervanta",
    longitude: 23.85,
    latitude: 61.45,
  },
  {
    id: "4",
    name: "Rinki-ekopiste Lielahti",
    title: "Rinki-ekopiste Lielahti",
    longitude: 23.685,
    latitude: 61.515,
  },
  {
    id: "5",
    name: "Rinki-ekopiste Tesoma",
    title: "Rinki-ekopiste Tesoma",
    longitude: 23.632,
    latitude: 61.482,
  },
  {
    id: "6",
    name: "Rinki-ekopiste Linnainmaa",
    title: "Rinki-ekopiste Linnainmaa",
    longitude: 23.828,
    latitude: 61.508,
  },
  {
    id: "7",
    name: "Rinki-ekopiste Härmälä",
    title: "Rinki-ekopiste Härmälä",
    longitude: 23.745,
    latitude: 61.468,
  },
  {
    id: "8",
    name: "Rinki-ekopiste Peltolammi",
    title: "Rinki-ekopiste Peltolammi",
    longitude: 23.72,
    latitude: 61.442,
  },
  {
    id: "9",
    name: "Rinki-ekopiste Multisilta",
    title: "Rinki-ekopiste Multisilta",
    longitude: 23.81,
    latitude: 61.435,
  },
  {
    id: "10",
    name: "Rinki-ekopiste Kaukajärvi",
    title: "Rinki-ekopiste Kaukajärvi",
    longitude: 23.865,
    latitude: 61.478,
  },
  {
    id: "11",
    name: "Rinki-ekopiste Messukylä",
    title: "Rinki-ekopiste Messukylä",
    longitude: 23.835,
    latitude: 61.492,
  },
  {
    id: "12",
    name: "Rinki-ekopiste Nekala",
    title: "Rinki-ekopiste Nekala",
    longitude: 23.798,
    latitude: 61.475,
  },
  {
    id: "13",
    name: "Rinki-ekopiste Rahola",
    title: "Rinki-ekopiste Rahola",
    longitude: 23.668,
    latitude: 61.495,
  },
  {
    id: "14",
    name: "Rinki-ekopiste Takahuhti",
    title: "Rinki-ekopiste Takahuhti",
    longitude: 23.815,
    latitude: 61.52,
  },
  {
    id: "15",
    name: "Rinki-ekopiste Atala",
    title: "Rinki-ekopiste Atala",
    longitude: 23.872,
    latitude: 61.462,
  },
  {
    id: "16",
    name: "Rinki-ekopiste Lamminpää",
    title: "Rinki-ekopiste Lamminpää",
    longitude: 23.615,
    latitude: 61.472,
  },
  {
    id: "17",
    name: "Rinki-ekopiste Ikuri",
    title: "Rinki-ekopiste Ikuri",
    longitude: 23.648,
    latitude: 61.505,
  },
  {
    id: "18",
    name: "Rinki-ekopiste Olkahinen",
    title: "Rinki-ekopiste Olkahinen",
    longitude: 23.84,
    latitude: 61.515,
  },
  {
    id: "19",
    name: "Rinki-ekopiste Vuores",
    title: "Rinki-ekopiste Vuores",
    longitude: 23.785,
    latitude: 61.428,
  },
  {
    id: "20",
    name: "Rinki-ekopiste Kämmenniemi",
    title: "Rinki-ekopiste Kämmenniemi",
    longitude: 23.71,
    latitude: 61.558,
  },
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
