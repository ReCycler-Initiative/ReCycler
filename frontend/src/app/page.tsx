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
        <h1 className="text-xl font-medium mb-4 font-sans">Tervetuloa Recycleriin</h1>
        <p className="mb-8 font-sans">
          Avustan sinua kierrättämään jätteesi täsmällisesti, jotta voit
          keskittyä nauttimaan elämästäsi ja samoin tulevat sukupolvet.
        </p>
        <div className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            <Link href="/materials">Lähde kierrättämään</Link>
          </Button>
          <Button className="w-full" asChild variant="secondary">
            <Link href="/results">Näytä lähimmät kierrätyspisteet</Link>
          </Button>
        </div>
      </Container>
    </>
  );
};

export default HomePage;
