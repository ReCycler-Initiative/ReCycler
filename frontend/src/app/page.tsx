"use client";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import hero from "./recycle.png";
import Image from "next/image";
import Link from "next/link";

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
  const [showMore, setShowMore] = useState(false);
  return (
    <>
      <div className="h-48 bg-gray-400 w-full border-b border-b-gray-400">
        <Image
          alt=""
          className="object-cover w-full h-full object-center"
          src={hero}
        />
      </div>
      <Container>
        <h1 className="text-xl font-bold mb-4">Tervetuloa Recycleriin</h1>
        <p className="mb-8">
          Avustan sinua kierrättämään jätteesi täsmällisesti, jotta voit
          keskittyä nauttimaan elämästäsi ja samoin tulevat sukupolvet.
        </p>
        <Button className="w-full" asChild>
          <Link href="/materials">Ponkaise kierrättämään</Link>
        </Button>
      </Container>
    </>
  );
};

export default HomePage;
