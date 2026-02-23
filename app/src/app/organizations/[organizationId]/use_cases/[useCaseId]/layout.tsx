"use client";

import { PageLoadingSpinner } from "@/components/page-loading-spinner";
import TitleBar from "@/components/title-bar";
import { Button } from "@/components/ui/button";
import { getUseCaseById } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import PageLoader from "next/dist/client/page-loader";
import { useParams } from "next/navigation";
import { use, useEffect, useState } from "react";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ organizationId: string; useCaseId: string }>();
  const useCaseQuery = useQuery({
    queryKey: ["use_case", params.organizationId, params.useCaseId],
    queryFn: () => getUseCaseById(params.organizationId, params.useCaseId),
  });

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

  if (useCaseQuery.isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <>
      <TitleBar
        logo={
          <span className="font-bold ml-2 whitespace-nowrap">
            {useCaseQuery.data?.name}
          </span>
        }
      >
        <div className="flex w-full items-center justify-end">
          {mapReady && (
            <Button
              variant="outline"
              onClick={openOnboarding}
              className="h-10 px-4 mr-3"
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
