"use client";

import TitleBar from "@/components/title-bar";
import { useEffect, useState } from "react";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
  // Tracks whether the map has finished loading (set by custom events from the map page)
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

  // Allows user to re-open the onboarding wizard on demand.
  // We dispatch a custom event that the OnboardingHint component listens to.
  const openOnboarding = () => {
    window.dispatchEvent(new Event("open-onboarding"));
  };

  return (
    <>
      <TitleBar>
        {/* Contextual actions on the right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Only visible when the map has loaded */}
          {mapReady && (
            <button
              onClick={openOnboarding}
              className="px-3 py-1.5 rounded-md text-sm border border-gray-300 hover:bg-gray-50"
              aria-label="Open onboarding"
            >
              Ohjeet
            </button>
          )}
        </div>
      </TitleBar>
      <main className="flex-1 flex flex-col bg-gray-100">{children}</main>
    </>
  );
};

export default OrganizationLayout;
