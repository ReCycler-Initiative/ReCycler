"use client";

import { Button } from "@/components/ui/button";
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
  ctaLabel?: string; // käytetään viimeisessä stepissä
};

export default function OnboardingHint() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  // Onboarding steps
  const steps: Step[] = useMemo(
    () => [
      {
        title: "Hae osoitteella tai paikalla",
        body: (
          <>
            Kirjoita osoite, paikka tai alue hakukenttään.
            <br />
            Saat ehdotuksia kirjoittaessasi; klikkaa ehdotusta tai paina Enter,
            niin karttaikkuna keskittyy valittuun sijaintiin.
            <br />
            <br />
            Esimerkkejä:&nbsp;
            <small>
            <span className="inline-flex gap-2 flex-wrap">
              <span className="px-2 py-1 rounded-full bg-gray-100">
                Mannerheimintie 10
              </span>
              <span className="px-2 py-1 rounded-full bg-gray-100">
                Kauppatori
              </span>
              <span className="px-2 py-1 rounded-full bg-gray-100">
                Hervanta
              </span>
            </span>
            </small>
            <br />
            <br />
            <small>Vinkki: ↑/↓ selaa ehdotuksia, ↩︎ Enter hakee</small>
            <br />
            <br />

          </>
        ),
        imageSrc: "/images/searchBoxOnBoarding.png",
        imageAlt: "Hakukenttä",
      },
      {
        title: "Ota paikannus käyttöön",
        body: (
          <>
            Napsauta sijaintipainiketta. Ensimmäisellä kerralla ReCycleriä
            käytettäessä verkkoselain kysyy luvan sijainnin käyttöön – hyväksy,
            niin karttaikkuna keskittyy nykyiseen sijaintiisi.
            <br />
            <br />
            Paina painiketta uudelleen, niin <b>Seuraa sijaintiani</b> -tila
            kytkeytyy päälle/pois (esimerkkikuvassa toiminto on päällä).
            Seurantatilassa näkymä seuraa sijaintiasi liikkuessasi.
            <br />
            <br />
            <small>
              Vinkki: Jos et anna lupaa tai paikannus ei toimi, voit hakea kohteen
              osoitteella tai paikannimellä.
            </small>
          </>
        ),
        imageSrc: "/images/geolocationOnBoarding.png",
        imageAlt: "Sijaintipainike",
      },
      {
        title: "Vaihda taustanäkymä",
        body: (
          <>
            Klikkaa taustakarttapainiketta (maapallo-kuvake).
            <br />
            Voit vaihtaa kartan taustanäkymän: <b>normaali kartta</b> (selkeä
            kadut ja alueet) tai <b>satelliittikuva</b> (realistinen
            ilmakuvanäkymä).
            <br />
            <br />
            <small>
              Vinkki: käytä karttanäkymää reittien ja osoitteiden hakuun,
              satelliittia kun haluat nähdä rakennukset ja maaston tarkemmin.
              3D-näkymässä voit puolestaan tarkastella rakennuksia ja maastoa
              kolmiulotteisesti eri kulmista.
            </small>
          </>
        ),
        imageSrc: "/images/backgroundMapOnBoarding.png",
        imageAlt: "Taustakartan vaihtopainike",
      },
      {
        title: "Valitse materiaalit",
        body: (
          <>
            Valitse haluamasi materiaalit painikkeesta.
            <br />
            Numerokuvake <b>(0 → 1, 2…)</b> kertoo, montako materiaalia on
            valittuna.
            <br />
            <br />
            <small>
            Vinkki: Kartalla korostetaan ne keltaisella reunuksella keräyspisteet, jotka ottavat vastaan kaikki
            valitsemasi materiaalit.
            </small>
          </>
        ),
        imageSrc: "/images/materialSelectorOnBoarding.png",
        imageAlt: "Materiaalivalintapainike",
      },
      {
        title: "ReCycler-avustaja",
        body: (
          <>
            Kysy kierrätysasioista ReCycler-avustajalta selkokielellä – sinun ei
            tarvitse tuntea virallisia termejä.
            <br />
            <br />
            Voit esimerkiksi kysyä:
            <small>
            <span className="inline-flex gap-2 flex-wrap">
              <span className="px-2 py-1 rounded-full bg-gray-100">
                Mihin laitan rikkinäisen paistinpannun?
              </span>
              <br />
              <span className="px-2 py-1 rounded-full bg-gray-100">
               Voiko pizzalaatikon kierrättää?
              </span>
              <br />
              <span className="px-2 py-1 rounded-full bg-gray-100">
               Miten paristot ja akut pitää pakata?
              </span>
            </span>
            </small>
            <br /><br />
            Avustaja antaa lajitteluohjeet ja kertoo, mihin jätelajiin
            materiaali kuuluu.
            <br />
            <br />
            <small>
              Vinkki: ReCycler-avustaja ei näe (toistaiseksi) karttaa eikä
              paikanna pisteitä. Löydät keräyspisteet haulla tai
              materiaalivalinnalla.
            </small>
          </>
        ),
        imageSrc: "/images/chatbotOnBoarding.png",
        imageAlt: "ReCycler-avustaja",
      },
      {
        title: "Kaikki valmista!",
        body: (
          <>
            Oikein mukavia kierrätyshetkiä!
          </>
        ),
        imageSrc: null,
        imageAlt: null,
        ctaLabel: "Aloita",
      },
    ],
    []
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

  if (!visible) return null;

  const step = steps[index];
  const pct = ((index + 1) / steps.length) * 100;
  const nextLabel =
    index === steps.length - 1 ? step.ctaLabel ?? "Valmis" : "Seuraava";

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
            <img
              src={step.imageSrc}
              alt={step.imageAlt ?? ""}
              className="rounded-lg border border-gray-200 shadow-sm max-h-14"
            />
          </div>
        )}

        <div className="text-sm leading-6 text-gray-800">{step.body}</div>
        <DialogFooter className="mt-5">
          <Button
            variant="outline"
            className="max-sm:w-full"
            onClick={markDone}
          >
            Ohita
          </Button>
          <div className="ml-auto flex gap-2 max-sm:w-full">
            <Button
              variant="ghost"
              className="max-sm:w-full"
              onClick={prev}
              disabled={index === 0}
            >
              Takaisin
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
