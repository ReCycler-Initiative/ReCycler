"use client";

import { CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AiTransparencyNoticeProps = {
  title: string;
  summary: string;
  body: string;
  detail?: string;
  legalReference?: string;
  className?: string;
};

export function AiTransparencyNotice({
  title,
  summary,
  body,
  detail,
  legalReference,
  className,
}: AiTransparencyNoticeProps) {
  return (
    <div
      className={[
        "flex items-center justify-end gap-1.5 text-xs text-slate-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{summary}</span>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            aria-label={title}
            className="h-6 w-6 rounded-full border border-slate-200 bg-white p-0 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            size="icon"
            variant="ghost"
          >
            <CircleHelp className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl rounded-3xl border border-slate-200 bg-white p-0 shadow-xl">
          <div className="rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(226,232,240,0.85),_rgba(255,255,255,1)_38%)] p-6 md:p-7">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-600">
                {body}
              </DialogDescription>
            </DialogHeader>
            {detail ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm leading-6 text-slate-700 shadow-sm">
                {detail}
              </div>
            ) : null}
            {legalReference ? (
              <p className="mt-4 text-xs leading-5 text-slate-500">
                {legalReference}
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}