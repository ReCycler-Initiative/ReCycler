export function mapDbRowToUseCase(row: any) {
  return {
    ...row,
    content: {
      intro: {
        title: row.intro_title || "",
        cta: row.intro_cta || "",
        skip: row.intro_skip || "",
        text: row.intro_text || "",
      },
      filters: {
        title: row.filters_title || "",
        cta: row.filters_cta || "",
        text: row.filters_text || "",
        tab_ai: row.filters_tab_ai || "",
        tab_manual: row.filters_tab_manual || "",
      },
    },
  };
}
