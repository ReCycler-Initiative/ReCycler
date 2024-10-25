"use client";

import Container from "@/components/container";
import { Materials } from "@/components/materials";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import { useForm } from "react-hook-form";

const MaterialsPage = () => {
  const form = useForm();
  const materials: [string, boolean][] = Object.entries(
    form.watch("materials", [])
  );
  const selectedMaterials = materials.filter(([, value]) => value);

  return (
    <Form {...form}>
      <Container className="max-w-2xl pt-7 lg:pt-14">
        <h1 className="text-xl font-medium mb-4 font-sans">
          Mitäs tänään kierrätetään?
        </h1>
        <div className="mb-28 lg:mb-6">
          <Materials />
        </div>
      </Container>
      <div className="fixed lg:static bottom-0 bg-white lg:bg-transparent border lg:border-none p-4 lg:p-0 left-0 right-0 border-gray-400 flex flex-col items-center gap-y-4">
        Materiaaleja valittu {selectedMaterials.length} kpl
        <Button asChild className="w-full max-w-96" size="lg">
          <Link
            href={`results?materials=${encodeURIComponent(selectedMaterials.map(([key]) => key).join(","))}`}
          >
            Näytä kierrätyspisteet
          </Link>
        </Button>
      </div>
    </Form>
  );
};

export default MaterialsPage;
