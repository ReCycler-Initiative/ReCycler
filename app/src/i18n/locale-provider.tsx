"use client";

import {
  getMessages,
} from "@/i18n/messages";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  Locale,
  resolveLocale,
} from "@/i18n/locale-config";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export const LocaleProvider = ({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return resolveLocale(initialLocale);
    }

    return resolveLocale(localStorage.getItem(LOCALE_COOKIE_NAME) ?? initialLocale);
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(LOCALE_COOKIE_NAME, locale);
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale: setLocaleState }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
};

export const useMessages = () => {
  const { locale } = useLocale();
  return getMessages(locale);
};