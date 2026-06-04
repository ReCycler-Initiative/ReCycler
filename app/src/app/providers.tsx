"use client";

import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/i18n/locale-provider";
import { Locale } from "@/i18n/messages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

const Providers = ({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider
      attribute="data-admin-theme"
      defaultTheme="light"
      enableSystem={false}
    >
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default Providers;
