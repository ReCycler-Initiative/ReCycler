import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { LOCALE_COOKIE_NAME, resolveLocale } from "@/i18n/locale-config";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReCycler",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

  return (
    <html lang={locale} className="h-full">
      <body className={`${inter.className} h-full`}>
        <Analytics />
        <Providers initialLocale={locale}>
          <div className="flex flex-col h-full">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
