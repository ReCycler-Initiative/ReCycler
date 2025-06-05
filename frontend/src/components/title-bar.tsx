import Image from "next/image";
import Link from "next/link";
import logo from "../app/recycler-logo.png";
import { ReactNode } from "react";

const TitleBar = ({
  children,
  toHomeHref = "/",
}: {
  children?: ReactNode;
  toHomeHref?: string;
}) => {
  return (
    <header className="pb-2 pl-1 border-b border-gray-400 sticky top-0 bg-white shadow-md z-50 flex items-center">
      <Link href={toHomeHref}>
        <Image src={logo} alt="Recycler logo" width={150} />
      </Link>
      {children}
    </header>
  );
};

export default TitleBar;
