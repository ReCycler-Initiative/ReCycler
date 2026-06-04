"use client";

import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/locale-provider";
import { Moon, Sun } from "lucide-react";

export default function AdminThemeToggle({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) {
  const messages = useMessages();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={messages.admin.toggleTheme}
      title={isDark ? messages.admin.useLightTheme : messages.admin.useDarkTheme}
      className="admin-theme-toggle mr-1 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}