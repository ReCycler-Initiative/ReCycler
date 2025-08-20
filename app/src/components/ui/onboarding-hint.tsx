"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Step = {
  title: string;
  body: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
};

type Props = {
  storageKey: string;
  overlay?: boolean;
  overlayBlur?: boolean;
  allowSkip?: boolean;
};

export default function OnboardingHint({
  storageKey,
  overlay = true,
  overlayBlur = false,
  allowSkip = true,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  // Store each image's natural size (pixels)
  const [imgSizes, setImgSizes] = useState<Record<string, { w: number; h: number }>>({});

  // Device pixel ratio
  const [dpr, setDpr] = useState(1);
  useEffect(() => {
    const update = () => setDpr(window.devicePixelRatio || 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const steps: Step[] = useMemo(
    () => [
      {
        title: "Hae osoitteella tai paikalla",
        body: <>Käytä hakupalkkia löytääksesi osoitteen tai paikan.</>,
        imageSrc: "/images/searchBoxOnBoarding.png",
        imageAlt: "Hakukenttä",
      },
      {
        title: "Ota paikannus käyttöön",
        body: (
          <>
            Klikkaa sijaintipainiketta keskittääksesi kartan omaan sijaintiisi. Voit myös ottaa
            jatkuvan paikannuksen käyttöön painamalla painiketta toisen kerran.
          </>
        ),
        imageSrc: "/images/geolocationOnBoarding.png",
        imageAlt: "Sijaintipainike",
      },
      {
        title: "Vaihda taustanäkymä",
        body: <>Vaihda kartan taustanäkymä: normaali kartta tai satelliittikuva.</>,
        imageSrc: "/images/backgroundMapOnBoarding.png",
        imageAlt: "Taustakarttavalitsin",
      },
      {
        title: "Valitse materiaalit",
        body: <>Valitse haluamasi materiaalit - vastaavat keräyspisteet korostetaan kartalla.</>,
        imageSrc: "/images/materialSelectorOnBoarding.png",
        imageAlt: "Materiaalivalitsin",
      },
      {
        title: "ReCycler avustaja",
        body: <>Kysy kierrätysneuvoja ReCycler avustajalta - se kertoo, mihin eri materiaalit voi viedä.</>,
        imageSrc: "/images/chatbotOnBoarding.png",
        imageAlt: "ReCycler avustaja",
      },
      {
        title: "Kaikki valmista!",
        body: <>Hienoa - Olet valmis etsimään kierrätyspisteitä!</>,
      },
    ],
    []
  );

  useEffect(() => {
    if (localStorage.getItem(storageKey) === "1") return;
    setVisible(true);
  }, [storageKey]);

  // --- added: allow opening the wizard manually from the title bar
  useEffect(() => {
    const handler = () => {
      setIndex(0);
      setVisible(true);
    };
    window.addEventListener("open-onboarding", handler as EventListener);
    return () => window.removeEventListener("open-onboarding", handler as EventListener);
  }, []);

  const markDone = () => {
    setVisible(false);
    localStorage.setItem(storageKey, "1");
  };

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => (index < steps.length - 1 ? setIndex((i) => i + 1) : markDone());

  if (!visible) return null;

  const step = steps[index];
  const pct = ((index + 1) / steps.length) * 100;

  // Todellinen koko CSS-pikseleinä = natural / DPR
  const natural = step.imageSrc ? imgSizes[step.imageSrc] : undefined;
  const cssWidth = natural ? natural.w / dpr : undefined;
  const cssHeight = natural ? natural.h / dpr : undefined;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        overlay ? "bg-black/40" : ""
      } ${overlay && overlayBlur ? "backdrop-blur-sm" : ""}`}
      role="dialog"
    >
      <div className="w-[min(92vw,620px)] rounded-2xl shadow-xl bg-white p-6">
        {/* Header + progress */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">{step.title}</div>
          <div className="text-xs text-gray-600 select-none">
            {index + 1}/{steps.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-gray-200 mb-4 overflow-hidden">
          <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
        </div>

        {/* Image */}
        {step.imageSrc && (
          <div className="mb-3 flex items-center justify-start">
            <img
              src={step.imageSrc}
              alt={step.imageAlt ?? ""}
              onLoad={(e) => {
                const t = e.currentTarget;
                if (!imgSizes[step.imageSrc!]) {
                  setImgSizes((prev) => ({
                    ...prev,
                    [step.imageSrc!]: { w: t.naturalWidth, h: t.naturalHeight },
                  }));
                }
              }}
              style={{
                width: cssWidth ? `${cssWidth}px` : "auto",
                height: cssHeight ? `${cssHeight}px` : "auto",
                display: "block",
              }}
              loading="eager"
            />
          </div>
        )}

        {/* Body */}
        <div className="text-sm leading-6 text-gray-800">{step.body}</div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between gap-2">
          <Button variant="ghost" className="text-sm" onClick={prev} disabled={index === 0}>
            Takaisin
          </Button>
          <div className="flex gap-2">
            {allowSkip && (
              <Button variant="outline" className="text-sm" onClick={markDone}>
                Ohita
              </Button>
            )}
            <Button className="text-sm" onClick={next}>
              {index === steps.length - 1 ? "Valmis" : "Seuraava"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
