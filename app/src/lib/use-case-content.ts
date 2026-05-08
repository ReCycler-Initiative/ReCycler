import { Locale } from "@/i18n/messages";

export type LocalizedTextValue = {
  fi: string;
  en: string;
};

export const emptyLocalizedText = (): LocalizedTextValue => ({
  fi: "",
  en: "",
});

export const parseStoredLocalizedText = (
  value: unknown
): LocalizedTextValue => {
  if (typeof value !== "string") {
    return emptyLocalizedText();
  }

  try {
    const parsed = JSON.parse(value) as Partial<LocalizedTextValue>;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.fi === "string" &&
      typeof parsed.en === "string"
    ) {
      return {
        fi: parsed.fi,
        en: parsed.en,
      };
    }
  } catch {
    // Legacy rows are stored as plain strings.
  }

  return {
    fi: value,
    en: "",
  };
};

export const serializeLocalizedText = (value: unknown): string => {
  if (
    value &&
    typeof value === "object" &&
    "fi" in value &&
    "en" in value
  ) {
    const localized = value as Partial<LocalizedTextValue>;
    return JSON.stringify({
      fi: typeof localized.fi === "string" ? localized.fi : "",
      en: typeof localized.en === "string" ? localized.en : "",
    });
  }

  return JSON.stringify(emptyLocalizedText());
};

export const resolveLocalizedText = (
  value: LocalizedTextValue | null | undefined,
  locale: Locale
): string => {
  if (!value) {
    return "";
  }

  return value[locale] || value.fi || value.en || "";
};