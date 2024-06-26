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
      <Container>
        <h1 className="text-xl font-medium mb-4 font-sans">Mitäs tänään kierrätetään?</h1>
        <Materials />
      </Container>
      <div className="fixed bottom-0 bg-white border p-4 left-0 right-0 border-gray-400 flex flex-col items-center gap-y-4">
        Materiaaleja valittu {selectedMaterials.length} kpl
        <Button asChild className="w-full" size="lg">
          <Link
            href={`results?materials=${selectedMaterials.map(([key]) => key)}`}
          >
            Etsi kierrätyspisteet
          </Link>
        </Button>
      </div>
    </Form>
  );
};

export default MaterialsPage;
