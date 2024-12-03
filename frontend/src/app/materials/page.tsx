"use client";

import { Chat } from "@/components/chat";
import Container from "@/components/container";
import { Materials } from "@/components/materials";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import Script from "next/script";
import { useForm } from "react-hook-form";

const MaterialsPage = () => {
  const form = useForm();
  const materials: [string, boolean][] = Object.entries(
    form.watch("materials", [])
  );
  const selectedMaterials = materials.filter(([, value]) => value);

  return (
    <Form {...form}>
      <Script id="chatling">
        {`window.chtlConfig = { chatbotId: "3433989154" }`}
      </Script>
      <Script
        async
        data-id="3433989154"
        id="chatling-embed-script"
        type="text/javascript"
        src="https://chatling.ai/js/embed.js"
      ></Script>
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
        <Button asChild className="w-full max-w-96 lg:mb-6" size="lg">
          <Link
            href={`results?materials=${encodeURIComponent(selectedMaterials.map(([key]) => key).join(","))}`}
          >
            Näytä kierrätyspisteet
          </Link>
        </Button>
      </div>
      {/* <div className="fixed z-50 right-2 bottom-32 lg:bottom-4">
        <Chat />
      </div> */}
    </Form>
  );
};

export default MaterialsPage;
