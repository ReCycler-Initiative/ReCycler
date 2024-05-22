"use client";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import hero from "./recycle.png";
import Image from "next/image";
import { RecycleIcon } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, useFormContext } from "react-hook-form";
import { Form, useFormField } from "@/components/ui/form";

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
        checked={checked || false}
        className="hidden"
        type="checkbox"
      />
      <span className="checkbox-mark"></span>
      {label}
    </label>
  );
};

const wasteTypes: string[] = [
  "Energiajätettä",
  "Kartonkia",
  "Lamppuja",
  "Lasia",
  "Muovia",
  "Paperia",
  "Pienmetallia",
  "Puuta",
  "Sekajätettä",
  "Tekstiiliä",
];

const moreWasteTypes: string[] = [
  "Ajoneuvoakut (lyijy)",
  "Kannettavat akut ja paristot",
  "Kyllästetty puu",
  "Muu jäte",
  "Poistotekstiiliä",
  "Puutarhajätettä",
  "Rakennus- ja purkujätettä",
  "Sähkölaitteita",
  "Vaarallinen jäte",
];

const MaterialsPage = () => {
  const [step, setStep] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const form = useForm();

  return (
    <Form {...form}>
      <Container>
        {step === 0 && (
          <>
            <h1 className="text-xl font-bold mb-6">
              Mitäs tänään kierrätetään?
            </h1>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {wasteTypes.map((type, i) => (
                <CustomCheckbox key={i} label={type} name={type} />
              ))}
              {showMore &&
                moreWasteTypes.map((type, i) => (
                  <CustomCheckbox key={i} label={type} name={type} />
                ))}
            </div>
            <div className="flex justify-center mb-20">
              <Button
                onClick={() => setShowMore(!showMore)}
                variant="secondary"
              >
                {showMore ? "Vähemmän materiaaleja" : "Lisää materiaaleja"}
              </Button>
            </div>
          </>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-bold">Mihinä meet?</h1>
            <div className="space-y-2">
              <Label htmlFor="location">Sijaintisi</Label>
              <Input id="location" />
            </div>
            <div className="bg-gray-300 flex justify-center items-center h-[300px]">
              Karttaa tähän?
            </div>
          </div>
        )}
      </Container>
      <div className="fixed bottom-0 bg-white border p-4 left-0 right-0 border-gray-400">
        {step === 0 && (
          <>
            {/* <Button className="w-full" onClick={() => setStep(1)} size="lg">
              Materiaalit valittu
            </Button> */}
            <Button asChild className="w-full" size="lg">
              <Link href="results">Etsi kierrätyspisteet</Link>
            </Button>
          </>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Button asChild className="w-full" size="lg">
              <Link href="results">Näytä lähimmät kierrätyspisteet</Link>
            </Button>
            <Button
              className="w-full"
              onClick={() => setStep(0)}
              size="lg"
              variant="secondary"
            >
              Takaisin
            </Button>
          </div>
        )}
      </div>
    </Form>
  );
};

export default MaterialsPage;
