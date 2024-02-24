"use client";

import { Map } from "@/components/map";
import { cn } from "@/utils/shadcn";
import { Loader2Icon, LoaderIcon } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <>
      <header
        className={cn(
          "hidden fixed px-4 py-4 w-full top-0 z-50 items-center text-2xl text-black uppercase",
          { flex: mapLoaded }
        )}
      >
        <p>Recycler</p>
      </header>
      <main>
        <Map onLoad={() => setMapLoaded(true)} />
        {!mapLoaded && (
          <div className="fixed flex inset-0 items-center justify-center flex-col gap-6 text-white">
            <Loader2Icon className="animate-spin" />
            Ladataan Recycler...
          </div>
        )}
      </main>
    </>
  );
}
