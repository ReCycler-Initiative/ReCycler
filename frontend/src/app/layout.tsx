import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import Providers from "./providers";
import logo from "./recycler-logo.png";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recycler",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Analytics />
        <Providers>
          <div className="flex flex-col h-full">
            <header className="pb-2 pl-1 border-b border-gray-400 sticky top-0 bg-white shadow-md">
              <Link href="/">
                <Image src={logo} alt="Recycler logo" width={150} />
              </Link>
            </header>
            <main className="flex-1 flex flex-col bg-gray-100">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
