"use client";

import TitleBar from "@/components/title-bar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
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
      <TitleBar>
        {/* Contextual actions on the right side */}
        <div className="flex items-center ml-auto">
          {mapReady && (
            <Button
              variant="outline"
              onClick={openOnboarding}
              className="h-10 px-4 mr-2"  // ← 2 px väli (vaihda tarvittaessa mr-1 = 4 px)
              aria-label="Open onboarding"
            >
              Ohjeet
            </Button>
          )}
        </div>
      </TitleBar>

      <main className="flex-1 flex flex-col bg-gray-100">{children}</main>
    </>
  );
};

export default OrganizationLayout;