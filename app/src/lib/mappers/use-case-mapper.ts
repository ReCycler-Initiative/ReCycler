import { parseStoredLocalizedText } from "@/lib/use-case-content";

export function mapDbRowToUseCase(row: any) {
  return {
    ...row,
    content: {
      intro: {
        title: parseStoredLocalizedText(row.intro_title || ""),
        cta: parseStoredLocalizedText(row.intro_cta || ""),
        skip: parseStoredLocalizedText(row.intro_skip || ""),
        text: parseStoredLocalizedText(row.intro_text || ""),
      },
      filters: {
        title: parseStoredLocalizedText(row.filters_title || ""),
        cta: parseStoredLocalizedText(row.filters_cta || ""),
        text: parseStoredLocalizedText(row.filters_text || ""),
        tab_ai: parseStoredLocalizedText(row.filters_tab_ai || ""),
        tab_manual: parseStoredLocalizedText(row.filters_tab_manual || ""),
      },
    },
  };
}
