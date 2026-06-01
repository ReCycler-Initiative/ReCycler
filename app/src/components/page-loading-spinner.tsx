"use client";

import { useMessages } from "@/i18n/locale-provider";

export const PageLoadingSpinner = () => {
  const messages = useMessages();

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-lg">{messages.pageLoading.loading}</div>
    </div>
  );
};
