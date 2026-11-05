"use client";

import { CATEGORY_ICONS, getCategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { ImageIcon } from "lucide-react";
import { RefObject, useState } from "react";

export const CategoryIconPicker = ({ value, onChange, containerRef, disabled }: {
  value?: string;
  onChange: (value: string) => void;
  containerRef: RefObject<HTMLDivElement | null>;
  disabled?: boolean;
}) => {
  const { locale } = useLocale();
  const messages = useMessages();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" disabled={disabled}
          className="shrink-0" title={messages.adminFieldsPage.choiceIcon}
          aria-label={messages.adminFieldsPage.choiceIcon}>
          {getCategoryIcon(value) ?? <ImageIcon className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="field-editor-popover w-72 space-y-3 p-3"
        container={containerRef.current} align="end">
        <div className="text-sm font-medium">{messages.adminFieldsPage.choiceIcon}</div>
        <div className="grid grid-cols-6 gap-1">
          {CATEGORY_ICONS.map(({ id, icon: Icon, fi, en }) => (
            <Button key={id} type="button" size="icon"
              variant={value === id ? "secondary" : "ghost"}
              title={locale === "en" ? en : fi} aria-label={locale === "en" ? en : fi}
              aria-pressed={value === id}
              onClick={() => { onChange(id); setOpen(false); }}>
              <Icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="w-full"
          onClick={() => { onChange(""); setOpen(false); }}>
          {messages.adminFieldsPage.choiceIconDefault}
        </Button>
      </PopoverContent>
    </Popover>
  );
};