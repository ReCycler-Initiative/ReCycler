"use client";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";

const CustomCheckbox = ({ label, name }: { label: string; name: string }) => {
  const { register, watch } = useFormContext();
  const checked: boolean = watch(name);

  return (
    <label
      data-checked={checked}
      className="border border-gray-700 py-2 px-2 text-center h-16 flex justify-center items-center bg-white rounded-sm data-[checked=true]:bg-gray-700 data-[checked=true]:text-white"
    >
      <input
        {...register(name)}
        checked={checked || false}
        className="hidden"
        type="checkbox"
      />
      <span className="checkbox-mark"></span>
      {label}
    </label>
  );
};

// const wasteTypes: string[] = [
//   "Energiajätettä",
//   "Kartonkia",
//   "Lamppuja",
//   "Lasia",
//   "Muovia",
//   "Paperia",
//   "Pienmetallia",
//   "Puuta",
//   "Sekajätettä",
//   "Tekstiiliä",
// ];

// const moreWasteTypes: string[] = [
//   "Ajoneuvoakut (lyijy)",
//   "Kannettavat akut ja paristot",
//   "Kyllästetty puu",
//   "Muu jäte",
//   "Poistotekstiiliä",
//   "Puutarhajätettä",
//   "Rakennus- ja purkujätettä",
//   "Sähkölaitteita",
//   "Vaarallinen jäte",
// ];

const wasteTypes: string[] = [
  "Energiajäte",
  "Kartonki",
  "Lamppu",
  "Lasi",
  "Muovi",
  "Paperi",
  "Pienmetalli",
  "Puu",
  "Sekajäte",
  "Tekstiili",
];

const moreWasteTypes: string[] = [
  "Ajoneuvoakut (lyijy)",
  "Kannettavat akut ja paristot",
  "Kyllästetty puu",
  "Muu jäte",
  "Poistotekstiili",
  "Puutarhajäte",
  "Rakennus- ja purkujäte",
  "Sähkölaite",
  "Vaarallinen jäte",
];

const MaterialsPage = () => {
  const [showMore, setShowMore] = useState(false);
  const form = useForm();
  const materials: [string, boolean][] = Object.entries(
    form.watch("materials", [])
  );
  const selectedMaterials = materials.filter(([, value]) => value);

  return (
    <Form {...form}>
      <Container>
        <h1 className="text-xl font-bold mb-6">Mitäs tänään kierrätetään?</h1>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {wasteTypes.map((type, i) => (
            <CustomCheckbox key={i} label={type} name={`materials.${type}`} />
          ))}
          {showMore &&
            moreWasteTypes.map((type, i) => (
              <CustomCheckbox key={i} label={type} name={`materials.${type}`} />
            ))}
        </div>
        <div className="flex justify-center mb-28">
          <Button
            className="flex flex-col"
            onClick={() => setShowMore(!showMore)}
            variant="secondary"
          >
            {showMore && (
              <span>
                <ChevronUpIcon />
              </span>
            )}
            {showMore ? "Vähemmän materiaaleja" : "Lisää materiaaleja"}
            {!showMore && (
              <span>
                <ChevronDownIcon />
              </span>
            )}
          </Button>
        </div>
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
