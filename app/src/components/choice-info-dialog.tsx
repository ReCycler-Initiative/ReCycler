"use client";

import { getNameIconEntry } from "@/components/materials";
import { MarkdownContent } from "@/components/markdown-block";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLocale } from "@/i18n/locale-provider";
import { localizeMaterialNameCandidate } from "@/lib/material-translations";

export type ChoiceInfo = { choice: string; text: string };

export const ChoiceInfoDialog = ({
  info,
  onClose,
}: {
  info: ChoiceInfo | null | undefined;
  onClose: () => void;
}) => {
  const { locale } = useLocale();

  return (
    <Dialog open={!!info} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl px-0">
        <DialogTitle className="px-4 lg:px-6">
          {info && localizeMaterialNameCandidate(info.choice, locale)}
        </DialogTitle>
        <div className="max-h-[80vh] overflow-y-auto px-4 lg:px-6">
          {info && (
            <div className="mb-6">{getNameIconEntry(info.choice)?.icon}</div>
          )}
          <MarkdownContent content={info?.text ?? ""} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
