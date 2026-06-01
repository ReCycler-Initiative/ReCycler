"use client";

import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/locale-provider";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

type Step = {
  title: string;
  body: React.ReactNode;
  imageSrc?: string | null;
  imageAlt?: string | null;
  imageWidth?: number;
  imageHeight?: number;
  ctaLabel?: string; // käytetään viimeisessä stepissä
};

export default function OnboardingHint() {
  const messages = useMessages();
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  // Onboarding steps
  const steps: Step[] = useMemo(
    () => [
      {
        title: messages.onboarding.searchTitle,
        body: (
          <>
            {messages.onboarding.searchHint}
            <br />
            <br />
            {messages.onboarding.examplesLabel}:&nbsp;
            <small>
              <span className="inline-flex gap-2 flex-wrap">
                {messages.onboarding.searchExamples.map((example: string) => (
                  <span key={example} className="px-2 py-1 rounded-full bg-gray-100">
                    {example}
                  </span>
                ))}
              </span>
            </small>
            <br />
            <br />
            <small>{messages.onboarding.searchTip}</small>
            <br />
            <br />
          </>
        ),
        imageSrc: "/images/searchBoxOnBoarding.png",
        imageAlt: messages.onboarding.searchImageAlt,
        imageWidth: 530,
        imageHeight: 114,
      },
      {
        title: messages.onboarding.locationTitle,
        body: (
          <>
            {messages.onboarding.locationBody}
            <br />
            <br />
            <small>
              {messages.onboarding.locationTip}
            </small>
          </>
        ),
        imageSrc: "/images/geolocationOnBoarding.png",
        imageAlt: messages.onboarding.locationImageAlt,
        imageWidth: 98,
        imageHeight: 84,
      },
      {
        title: messages.onboarding.mapStyleTitle,
        body: (
          <>
            {messages.onboarding.mapStyleBody}
            <br />
            <br />
            <small>
              {messages.onboarding.mapStyleTip}
            </small>
          </>
        ),
        imageSrc: "/images/backgroundMapOnBoarding.png",
        imageAlt: messages.onboarding.mapStyleImageAlt,
        imageWidth: 92,
        imageHeight: 82,
      },
      {
        title: messages.onboarding.filterTitle,
        body: (
          <>
            {messages.onboarding.filterBody}
            <br />
            <br />
            <small>
              {messages.onboarding.filterTip}
            </small>
          </>
        ),
        imageSrc: "/images/materialSelectorOnBoarding.png",
        imageAlt: messages.onboarding.filterImageAlt,
        imageWidth: 90,
        imageHeight: 94,
      },
      {
        title: messages.onboarding.completeTitle,
        body: <></>,
        imageSrc: null,
        imageAlt: null,
        ctaLabel: messages.onboarding.completeCta,
      },
    ],
    [messages]
  );

  // Allow manual reopening via custom event
  useEffect(() => {
    const handler = () => {
      setIndex(0);
      setVisible(true);
    };
    window.addEventListener("open-onboarding", handler as EventListener);
    return () =>
      window.removeEventListener("open-onboarding", handler as EventListener);
  }, []);

  const markDone = () => {
    setVisible(false);
  };

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () =>
    index < steps.length - 1 ? setIndex((i) => i + 1) : markDone();

  const step = steps[index];
  const pct = ((index + 1) / steps.length) * 100;
  const nextLabel =
    index === steps.length - 1
      ? (step.ctaLabel ?? messages.onboarding.done)
      : messages.onboarding.next;

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center justify-between">
              {step.title}
              <span className="text-xs text-gray-600 select-none">
                {index + 1}/{steps.length}
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="w-full h-1.5 rounded-full bg-gray-200 mb-4 overflow-hidden">
          <div
            className="h-full bg-black rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>

        {step.imageSrc && (
          <div className="mb-3 flex items-center justify-start">
            <Image
              src={step.imageSrc}
              alt={step.imageAlt ?? ""}
              width={step.imageWidth ?? 240}
              height={step.imageHeight ?? 56}
              className="h-auto w-auto max-h-20 max-w-full rounded-lg border border-gray-200 object-contain shadow-sm"
            />
          </div>
        )}

        <div className="text-sm leading-6 text-gray-800">{step.body}</div>
        <DialogFooter className="mt-5 gap-y-6">
          <Button
            variant="outline"
            className="max-sm:w-full"
            onClick={markDone}
          >
            {messages.onboarding.skip}
          </Button>
          <div className="ml-auto flex gap-2 max-sm:w-full">
            <Button
              variant="ghost"
              className="max-sm:w-full"
              onClick={prev}
              disabled={index === 0}
            >
              {messages.onboarding.back}
            </Button>
            <Button className="max-sm:w-full" onClick={next}>
              {nextLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
