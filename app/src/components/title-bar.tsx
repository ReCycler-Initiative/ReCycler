"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "../app/recycler-logo.png";
import { ReactNode, useEffect, useState } from "react";

const TitleBar = ({
  children,
  toHomeHref = "/",
}: {
  children?: ReactNode;
  toHomeHref?: string;
}) => {
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
    // Sticky top app bar with logo on the left and optional actions on the right
    <header className="pl-1 pr-3 border-b border-gray-400 sticky top-0 bg-white shadow-md z-50 flex items-center justify-between">
      {/* Logo + optional children (e.g., search, filters) */}
      <div className="flex items-center gap-2">
        <Link className="pb-2" href={toHomeHref}>
          <Image src={logo} alt="Recycler logo" width={150} />
        </Link>
        {children}
      </div>

      {/* Contextual actions on the right side */}
      <div className="flex items-center gap-2">
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
    </header>
  );
};

export default TitleBar;