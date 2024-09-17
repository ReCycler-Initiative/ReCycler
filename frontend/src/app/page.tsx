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
          Tervetuloa ReCycler-sovellukseen! ReCycler auttaa sinua löytämään
          helposti lähimmät kierrätyspisteet kotitalousjätteillesi kaikkialla
          Suomessa. Olipa kyseessä mikä tahansa jäte, ReCycler opastaa sinut
          oikeaan paikkaan. Aloita ympäristöystävällinen valinta jo tänään!
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
      {/* Footer */}
<footer className="w-full mt-16 bg-gray-200 py-4 text-center">
  <p className="text-sm">
    ReCycler on Github-projekti. Lähdekoodi löytyy{" "}
    <a
      href="https://github.com/ReCycler-Initiative/ReCycler"
      className="text-blue-500 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      täältä
    </a>
    . Projekti on lisensoitu Apache 2.0 -lisenssillä.
  </p>
</footer>
    </>
  );
};

export default HomePage;
