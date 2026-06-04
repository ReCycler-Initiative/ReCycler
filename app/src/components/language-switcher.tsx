"use client";

import { Button } from "@/components/ui/button";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { Locale } from "@/i18n/messages";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const messages = useMessages();

  const options: Locale[] = ["fi", "en"];

  return (
    <div
      className="mr-2 flex items-center gap-1"
      aria-label={messages.languageSwitcher.label}
    >
      {options.map((option) => {
        const isActive = option === locale;
        return (
          <Button
            key={option}
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={`language-switcher-button h-8 px-3 text-xs ${
              isActive ? "language-switcher-button-active" : ""
            }`}
            onClick={() => setLocale(option)}
          >
            {messages.languageSwitcher[option]}
          </Button>
        );
      })}
    </div>
  );
}