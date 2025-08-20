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
  return (
    // Sticky top app bar with logo on the left and optional actions on the right
    <header className="pl-1 pr-3 border-b border-gray-400 sticky top-0 bg-white shadow-md z-50 flex items-center justify-between">
      {/* Logo + optional children (e.g., search, filters) */}
      <div className="flex items-center gap-2 flex-1">
        <Link className="pb-2" href={toHomeHref}>
          <Image src={logo} alt="Recycler logo" width={150} />
        </Link>
        {children}
      </div>
    </header>
  );
};

export default TitleBar;
