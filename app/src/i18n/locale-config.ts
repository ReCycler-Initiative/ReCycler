export const supportedLocales = ["fi", "en"] as const;

export type Locale = (typeof supportedLocales)[number];

export const DEFAULT_LOCALE: Locale = "fi";
export const LOCALE_COOKIE_NAME = "recycler-locale";

export const isLocale = (value: string | null | undefined): value is Locale =>
  supportedLocales.includes((value ?? "") as Locale);

export const resolveLocale = (value: string | null | undefined): Locale =>
  isLocale(value) ? value : DEFAULT_LOCALE;