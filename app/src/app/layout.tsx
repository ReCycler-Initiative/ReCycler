import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";

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
      <Script id="chatling">
        {`window.chtlConfig = { chatbotId: "3433989154" }`}
      </Script>
      <Script
        async
        data-id="3433989154"
        id="chatling-embed-script"
        type="text/javascript"
        src="https://chatling.ai/js/embed.js"
      ></Script>
      <body className={`${inter.className} h-full`}>
        <Analytics />
        <Providers>
          <div className="flex flex-col h-full">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
