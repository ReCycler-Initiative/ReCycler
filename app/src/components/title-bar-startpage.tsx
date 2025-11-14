// components/title-bar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import logo from "../app/recycler-logo.png";
import Auth0Login from "./auth0-login";  // <-- tuotu tänne

const TitleBar = ({
  children,
  toHomeHref = "/recycler",
}: {
  children?: ReactNode;
  toHomeHref?: string;
}) => {
  return (
    <header className="pl-1 pr-3 border-b border-gray-400 sticky top-0 bg-white shadow-md z-50 flex items-center justify-between">
      <div className="flex items-center gap-2 flex-1">
        <Link className="pb-2" href={toHomeHref}>
        </Link>
        {children}
      </div>
      <Auth0Login />
    </header>
  );
};

export default TitleBar;