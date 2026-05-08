"use client";

import Container from "@/components/container";
import { useMessages } from "@/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
//import hero from "./recycle.png"; //let´s place when suitable photo

const HomePage = () => {
  const messages = useMessages();

  return (
    <>
      {/*<div className="h-48 bg-gray-400 w-full border-b border-b-gray-400">
        <Image
          alt=""
          className="object-cover w-full h-full object-center"
          src={hero}
      </div>
         */}
      <Container className="flex-1 max-w-4xl">
        <h1 className="text-2xl font-medium mb-4 font-sans">
          {messages.recyclerHome.title}
        </h1>
        <p className="mb-12 font-sans">
          {messages.recyclerHome.description}
        </p>
        <div className="flex flex-col gap-4 items-center">
          <Button className="w-full max-w-96" asChild size="lg">
            <Link href="/recycler/materials">{messages.recyclerHome.startRecycling}</Link>
          </Button>
          <Button className="w-full max-w-96" asChild variant="secondary">
            <Link className="no-underline" href="/recycler/results">
              {messages.recyclerHome.showNearest}
            </Link>
          </Button>
        </div>
      </Container>
      {/* Footer */}
      <footer className="w-full mt-16 bg-gray-200 py-4 text-center text-xs">
        <p className="mb-2">
          {messages.recyclerHome.footerIntro}{" "}
          <a
            href="https://github.com/ReCycler-Initiative/ReCycler"
            className="text-blue-500 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github-sivuilta <ExternalLink className="ml-1 inline" size={16} />
          </a>
          .{" "}
        </p>
        <p>
          {messages.recyclerHome.footerLicense}
        </p>
      </footer>
    </>
  );
};

export default HomePage;
