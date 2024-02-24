import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="en">
      <body className={inter.className}>
        <header className="fixed px-6 py-4 w-full top-0 z-50 flex items-center text-2xl text-black uppercase">
          <p>Recycler</p>
        </header>
        {children}
      </body>
    </html>
  );
}
