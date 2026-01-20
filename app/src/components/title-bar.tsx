// components/title-bar.tsx
"use client";

import Link from "next/link";
import { ReactNode } from "react";
import Auth0Login from "./auth0-login"; // <-- tuotu tänne

const TitleBar = ({
  children,
  logo,
  toHomeHref = "/recycler",
}: {
  children?: ReactNode;
  logo: ReactNode;
  toHomeHref?: string;
}) => {
  return (
    <header className="h-16 pl-1 pr-3 border-b border-gray-400 sticky top-0 bg-white shadow-md z-50 flex items-stretch shrink-0">
      <div className="flex items-center gap-2">
        <Link href={toHomeHref}>
          {logo}
        </Link>
      </div>
      {children}
      <div className="flex items-center ml-auto">
        <Auth0Login />
      </div>
    </header>
  );
};

export default TitleBar;
