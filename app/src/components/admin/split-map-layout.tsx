"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { List, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SplitMapLayoutProps {
  children: ReactNode;
  map: ReactNode;
  className?: string;
}

type MobileView = "list" | "map";

export const SplitMapLayout = ({
  children,
  map,
  className,
}: SplitMapLayoutProps) => {
  const [mobileView, setMobileView] = useState<MobileView>("list");

  return (
    <div className={cn("flex flex-1 flex-col", className)}>
      {/* Mobile toggle buttons */}
      <div className="flex gap-1 p-2 lg:hidden border-b border-gray-200 bg-white">
        <Button
          variant={mobileView === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileView("list")}
          className="flex-1"
        >
          <List className="h-4 w-4 mr-2" />
          Lista
        </Button>
        <Button
          variant={mobileView === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileView("map")}
          className="flex-1"
        >
          <Map className="h-4 w-4 mr-2" />
          Kartta
        </Button>
      </div>
      {/* Split layout container */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden gap-x-4">
        {/* List panel */}
        <div
          className={cn(
            "flex-1 overflow-y-auto lg:w-1/3 lg:max-w-md lg:flex-none",
            mobileView === "list" ? "block" : "hidden lg:block"
          )}
        >
          {children}
        </div>

        {/* Map panel */}
        <div
          className={cn(
            "flex-1 min-h-[300px] mb-4",
            mobileView === "map" ? "block" : "hidden lg:block"
          )}
        >
          {map}
        </div>
      </div>
    </div>
  );
};
