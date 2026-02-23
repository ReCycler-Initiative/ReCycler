"use client";

import dynamic from "next/dynamic";

const DynamicHeader = dynamic(() => import("./results"), {
  ssr: false,
});

export default function HomePage() {
  return <DynamicHeader />;
}
