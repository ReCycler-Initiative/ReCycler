"use client";

import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/locale-provider";
import { RotateCcw, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

export const MapMarkerEditor = ({ value, onChange }: {
  value?: string;
  onChange: (value: string) => void;
}) => {
  const messages = useMessages();
  const inputRef = useRef<HTMLInputElement>(null);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <div className="space-y-3 border-t pt-4">
      <h4 className="text-sm font-medium">{messages.adminUseCaseEditor.markerIconLabel}</h4>
      <div className="flex flex-wrap items-center gap-3">
        <Image src={value || "/images/collection-point.png"}
          alt={messages.adminUseCaseEditor.markerIconLabel} width={40} height={40}
          className="h-10 w-10 shrink-0 object-contain" unoptimized />
        <Button type="button" variant="outline" disabled={loading}
          onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          {messages.adminUseCaseEditor.chooseMarkerIcon}
        </Button>
        {value && (
          <Button type="button" variant="ghost" disabled={loading}
            onClick={() => { setInvalid(false); onChange(""); }}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {messages.adminUseCaseEditor.resetMarkerIcon}
          </Button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/png" className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          if (file.type !== "image/png" || file.size > 1024 * 1024) {
            setInvalid(true);
            return;
          }
          setLoading(true);
          setInvalid(false);
          let bitmap: ImageBitmap | undefined;
          try {
            bitmap = await createImageBitmap(file);
            const canvas = document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 400;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Canvas unavailable");
            const scale = 400 / Math.max(bitmap.width, bitmap.height);
            const width = bitmap.width * scale;
            const height = bitmap.height * scale;
            context.drawImage(bitmap, (400 - width) / 2, (400 - height) / 2, width, height);
            onChange(canvas.toDataURL("image/png"));
          } catch {
            setInvalid(true);
          } finally {
            bitmap?.close();
            setLoading(false);
          }
        }} />
      {invalid && <p role="alert" className="text-sm text-destructive">
        {messages.adminUseCaseEditor.logoInvalid}
      </p>}
    </div>
  );
};