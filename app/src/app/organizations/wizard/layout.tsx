"use client";

import TitleBar from "@/components/title-bar";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/locale-provider";
import Image from "next/image";
import { useEffect, useState } from "react";
import logo from "../../recycler-logo.png";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
  const messages = useMessages();
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const onLoaded = () => setMapReady(true);
    const onUnloaded = () => setMapReady(false);

    window.addEventListener("map-loaded", onLoaded);
    window.addEventListener("map-unloaded", onUnloaded);

    return () => {
      window.removeEventListener("map-loaded", onLoaded);
      window.removeEventListener("map-unloaded", onUnloaded);
    };
  }, []);

  const openOnboarding = () => {
    window.dispatchEvent(new Event("open-onboarding"));
  };

  return (
    <>
      <TitleBar
        logo={
          <Image className="pb-2" src={logo} alt="Recycler logo" width={150} />
        }
      >
        <div className="flex w-full items-center justify-end">
          {mapReady && (
            <Button
              variant="outline"
              onClick={openOnboarding}
              className="h-10 px-4 mr-3"
              aria-label={messages.layout.openOnboarding}
            >
              {messages.layout.instructions}
            </Button>
          )}
        </div>
      </TitleBar>

      <main className="flex-1 flex flex-col bg-gray-100">{children}</main>
    </>
  );
};

export default OrganizationLayout;
