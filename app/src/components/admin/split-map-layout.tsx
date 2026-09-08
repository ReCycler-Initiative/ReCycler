"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { List, Map, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SplitMapLayoutProps {
  children: ReactNode;
  map: ReactNode;
  rightPanel?: ReactNode;
  className?: string;
}

type MobileView = "list" | "map" | "edit";

export const SplitMapLayout = ({
  children,
  map,
  rightPanel,
  className,
}: SplitMapLayoutProps) => {
  const [mobileView, setMobileView] = useState<MobileView>("list");

  // When rightPanel disappears, fall back to list on mobile
  const effectiveMobileView =
    mobileView === "edit" && !rightPanel ? "list" : mobileView;

  return (
    <div className={cn("flex flex-1 flex-col", className)}>
      {/* Mobile toggle buttons */}
      <div className="grid grid-cols-3 gap-1 border-b border-gray-200 bg-white p-2 lg:hidden">
        <Button
          variant={effectiveMobileView === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileView("list")}
          className="min-w-0 px-2"
        >
          <List className="mr-1 h-4 w-4 shrink-0 sm:mr-2" />
          <span className="truncate">Lista</span>
        </Button>
        <Button
          variant={effectiveMobileView === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileView("map")}
          className="min-w-0 px-2"
        >
          <Map className="mr-1 h-4 w-4 shrink-0 sm:mr-2" />
          <span className="truncate">Kartta</span>
        </Button>
        {rightPanel && (
          <Button
            variant={effectiveMobileView === "edit" ? "default" : "outline"}
            size="sm"
            onClick={() => setMobileView("edit")}
            className="min-w-0 px-2"
          >
            <Pencil className="mr-1 h-4 w-4 shrink-0 sm:mr-2" />
            <span className="truncate">Muokkaa</span>
          </Button>
        )}
      </div>
      {/* Split layout container */}
      <div className="flex flex-1 gap-x-4">
        {/* List panel */}
        <div
          className={cn(
            "flex-col lg:w-1/3 lg:max-w-md",
            effectiveMobileView === "list" ? "flex" : "hidden lg:flex"
          )}
        >
          <div className="basis-0 grow overflow-auto">{children}</div>
        </div>
        {/* Map panel */}
        <div
          className={cn(
            "flex-1 min-h-[300px] mb-4",
            effectiveMobileView === "map" ? "block" : "hidden lg:block"
          )}
        >
          {map}
        </div>
        {/* Right edit panel — slides in from the right */}
        <div
          className={cn(
            "flex-col overflow-hidden transition-all duration-300 ease-in-out",
            rightPanel
              ? "w-96 opacity-100 mb-4"
              : "w-0 opacity-0 pointer-events-none",
            effectiveMobileView === "edit" ? "flex w-full" : "hidden lg:flex"
          )}
        >
          {rightPanel}
        </div>
      </div>
    </div>
  );
};
