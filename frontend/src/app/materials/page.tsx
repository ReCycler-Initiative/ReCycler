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

const HomePage = () => {
  const [step, setStep] = useState(0);
  const [showMore, setShowMore] = useState(false);
  return (
    <>
      {/* <div className="h-48 bg-gray-400 w-full border-b border-b-gray-400">
        <Image
          alt=""
          className="object-cover w-full h-full object-center"
          src={hero}
        />
      </div> */}
      <Container>
        {step === 0 && (
          <>
            <h1 className="text-xl font-bold mb-6">
              Mitäs tänään kierrätetään?
            </h1>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {wasteTypes.map((type, i) => (
                <div
                  key={i}
                  className="border border-gray-700 py-2 px-2 text-center h-16 flex justify-center items-center bg-white rounded-sm"
                >
                  {type}
                </div>
              ))}
              {showMore &&
                moreWasteTypes.map((type, i) => (
                  <div
                    key={i}
                    className="border border-gray-700 py-2 px-2 text-center h-16 flex justify-center items-center bg-white rounded-sm"
                  >
                    {type}
                  </div>
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
    </>
  );
};

export default HomePage;
