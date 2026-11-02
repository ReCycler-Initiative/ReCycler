"use client";

import { useMessages } from "@/i18n/locale-provider";
import { Loader2 } from "lucide-react";

export const PageLoadingSpinner = () => {
  const messages = useMessages();

  return (
    <div className="flex items-center justify-center gap-3 h-screen text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <div className="text-lg">{messages.pageLoading.loading}</div>
    </div>
  );
};
