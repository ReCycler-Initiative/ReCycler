"use client";

import { AdminList } from "@/components/admin/admin-list";
import { PageTemplate } from "@/components/admin/page-template";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";

const mockLocations = [
  { id: "1", title: "Rinki-ekopiste Keskusta" },
  { id: "2", title: "Rinki-ekopiste Kaleva" },
  { id: "3", title: "Rinki-ekopiste Hervanta" },
];

const LocationsPage = () => {
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
    >
      <AdminList
        items={mockLocations.map((location) => ({
          ...location,
          actions: (
            <Button asChild variant="outline" size="sm">
              <Link href={`locations/${location.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Muokkaa
              </Link>
            </Button>
          ),
        }))}
        emptyMessage="Tällä organisaatiolla ei ole vielä kohteita."
      />
    </PageTemplate>
  );
};

export default LocationsPage;
