"use client";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
//import hero from "./recycle.png"; //let´s place when suitable photo

const HomePage = () => {
  return (
    <>
      {/*<div className="h-48 bg-gray-400 w-full border-b border-b-gray-400">
        <Image
          alt=""
          className="object-cover w-full h-full object-center"
          src={hero}
      </div>
         */}
      <Container>
        <h1 className="text-2xl font-medium mb-4 font-sans">
          Tervetuloa Recycleriin
        </h1>
        <p className="mb-16 font-sans">
          ReCyclerin avulla voit hakea kotitalouksien jätteille tarkoitettujen,
          alueellisten keräyspisteiden ja kiertävien keräysten tietoja
          kaikkialla Suomessa.
        </p>
        <div className="flex flex-col gap-4 items-center">
          <Button className="w-full max-w-96" asChild size="lg">
            <Link href="/materials">Lähde kierrättämään</Link>
          </Button>
          <Button className="w-full max-w-96" asChild variant="secondary">
            <Link href="/results">Näytä lähimmät kierrätyspisteet</Link>
          </Button>
        </div>
      </Container>
    </>
  );
};

export default HomePage;
