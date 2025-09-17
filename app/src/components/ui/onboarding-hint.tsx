"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo, useState } from "react";

type Step = {
  title: string;
  body: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
};

type Props = {
  overlay?: boolean;
  overlayBlur?: boolean;
  allowSkip?: boolean;
};

export default function OnboardingHint({
  overlay = true,
  overlayBlur = false,
  allowSkip = true,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  // Onboarding steps
  const steps: Step[] = useMemo(
    () => [
<<<<<<< HEAD
{
  title: "Hae osoitteella tai paikalla",
  body: (
    <>
      Kirjoita osoite, paikka tai alue hakukenttään.
      <br />
      Saat ehdotuksia kirjoittaessasi; klikkaa ehdotusta tai paina Enter, niin karttaikkuna keskittyy valittuun sijaintiin.
      <br /><br />
      Esimerkkejä:&nbsp;
      <span className="inline-flex gap-2 flex-wrap">
        <span className="px-2 py-1 rounded-full bg-gray-100">Mannerheimintie 10</span>
        <span className="px-2 py-1 rounded-full bg-gray-100">Kauppatori</span>
        <span className="px-2 py-1 rounded-full bg-gray-100">Hervanta</span>
      </span>
      <br /><br />
      <small>Vinkki: ↑/↓ selaa ehdotuksia, ↩︎ Enter hakee</small>
      <br /><br />
    </>
  ),
  imageSrc: "/images/searchBoxOnBoarding.png",
  imageAlt: "Hakukenttä",
  // Lisäksi komponenttitasolla: placeholder="Hae osoite, paikka tai alue", aria-label="Haku"
},
 {
  title: "Ota paikannus käyttöön",
  body: (
    <>
      Napsauta sijaintipainiketta. Ensimmäisellä kerralla Recycleriä käytettäessä 
      verkkoselain kysyy luvan sijainnin käyttöön – hyväksy, niin karttaikkuna 
      keskittyy nykyiseen sijaintiisi.
      <br /><br />
      Paina painiketta uudelleen, niin <b>Seuraa sijaintiani</b> -tila kytkeytyy päälle/pois. 
      Seurantatilassa näkymä seuraa sijaintiasi liikkuessasi.
      <br /><br />
      <small>
       Vinkki: Jos et anna lupaa tai paikannus ei toimi, voit hakea kohteen osoitteella tai paikannimellä.
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
      Voit vaihtaa kartan taustanäkymän: <b>normaali kartta</b> (selkeä kadut ja alueet) tai <b>satelliittikuva</b> (realistinen ilmakuvanäkymä).
      <br /><br />
      <small>Vinkki: käytä karttanäkymää reittien ja osoitteiden hakuun, satelliittia kun haluat nähdä rakennukset ja maaston tarkemmin. 
      3D-näkymässä voit puolestaan tarkastella rakennuksia ja maastoa kolmiulotteisesti eri kulmista.</small>
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
      Numerokuvake <b>(0 → 1, 2…)</b> kertoo, montako materiaalia on valittuna.
      <br /><br />
      <small>Vinkki: Kartalla korostetaan ne keräyspisteet, jotka ottavat vastaan kaikki valitsemasi materiaalit.  
      Nämä pisteet näkyvät <b>keltaisella reunuksella</b> varustetulla kierrätyskuvakkeella.</small>
    </>
  ),
  imageSrc: "/images/materialSelectorOnBoarding.png",
  imageAlt: "Materiaalivalintapainike",
},
{
  title: "ReCycler-avustaja",
  body: (
    <>
      Kysy kierrätysasioista ReCycler-avustajalta selkokielellä – sinun ei tarvitse tuntea virallisia termejä.  Avustaja antaa lajitteluohjeet ja kertoo, mihin jätelajiin materiaali kuuluu. 
      <br /><br />
      <small>Vinkki: Voit esimerkiksi kysyä, että
      <ul>
        <li>“Mihin laitan rikkinäisen paistinpannun?”</li>
        <li>“Voiko pizzalaatikon kierrättää?”</li>
        <li>“Miten paristot ja akut pitää pakata?”</li>
      </ul>
      Recycler-avustaja ei näe (toistaiseksi) karttaa eikä paikanna pisteitä. Löydät keräyspisteet haulla tai materiaalivalinnalla.</small>
    </>
  ),
  imageSrc: "/images/chatbotOnBoarding.png",
  imageAlt: "ReCycler-avustaja",
},
{
  title: "Kaikki valmista!",
  body: (
    <>
      Hienoa – olet nyt valmis käyttämään ReCycleriä!
      <br /><br />
      Oikein mukavia kierrätyshetkiä!
      <br /><br />
      <small>Vinkki: Voit heti kokeilla:
      <ul>
        <li>Hae osoite, paikka tai alue kartalta</li>
        <li>Valitse materiaalit ja katso, mitkä pisteet sopivat</li>
        <li>Kysy lajitteluohjeita ReCycler-avustajalta</li>
      </ul>
      </small>
    </>
  ),
  imageSrc: null,
  imageAlt: null,
  ctaLabel: "Aloita"
}

=======
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
            <small>Vinkki: ↑/↓ selaa ehdotuksia, ↩︎ Enter hakee</small>
            <br />
            <br />
            Esimerkkejä:&nbsp;
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
          </>
        ),
        imageSrc: "/images/searchBoxOnBoarding.png",
        imageAlt: "Hakukenttä",
        // Lisäksi komponenttitasolla: placeholder="Hae osoite, paikka tai alue", aria-label="Haku"
      },
      {
        title: "Ota paikannus käyttöön",
        body: (
          <>
            Napsauta sijaintipainiketta. Ensimmäisellä kerralla Recycleriä
            käytettäessä verkkoselain kysyy luvan sijainnin käyttöön – hyväksy,
            niin karttaikkuna keskittyy nykyiseen sijaintiisi.
            <br />
            <br />
            Paina painiketta uudelleen, niin <b>Seuraa sijaintiani</b> -tila
            kytkeytyy päälle/pois (esimerkkikuvassa toiminto on päällä).
            Seurantatilassa näkymä seuraa sijaintiasi liikkuessasi.
            <br />
            <br />
            Jos et anna lupaa tai paikannus ei toimi, voit hakea kohteen
            osoitteella tai paikannimellä.
            <br />
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
            Kartalla korostetaan ne keräyspisteet, jotka ottavat vastaan kaikki
            valitsemasi materiaalit. Nämä pisteet näkyvät keltaisella
            reunuksella varustetulla kierrätyskuvakkeella.
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
            <ul>
              <li>“Mihin laitan rikkinäisen paistinpannun?”</li>
              <li>“Voiko pizzalaatikon kierrättää?”</li>
              <li>“Miten paristot ja akut pitää pakata?”</li>
            </ul>
            Avustaja antaa lajitteluohjeet ja kertoo, mihin jätelajiin
            materiaali kuuluu.
            <br />
            <br />
            <small>
              Huom: Recycler-avustaja ei näe (toistaiseksi) karttaa eikä
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
            Hienoa – olet nyt valmis käyttämään ReCycleriä!
            <br />
            <br />
            Voit heti kokeilla:
            <ul>
              <li>Hae osoite, paikka tai alue kartalta</li>
              <li>Valitse materiaalit ja katso, mitkä pisteet sopivat</li>
              <li>Kysy lajitteluohjeita ReCycler-avustajalta</li>
            </ul>
            <br />
            Oikein mukavia kierrätyshetkiä!
          </>
        ),
        ctaLabel: "Aloita",
      },
>>>>>>> da605027fbfd02873f88d1e724a7987e70d0a6d8
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

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        overlay ? "bg-black/40" : ""
      } ${overlay && overlayBlur ? "backdrop-blur-sm" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
    >
      <div className="w-[min(92vw,620px)] rounded-2xl shadow-xl bg-white p-6">
        {/* Header with title + step counter */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold">{step.title}</div>
          <div className="text-xs text-gray-600 select-none">
            {index + 1}/{steps.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-gray-200 mb-4 overflow-hidden">
          <div
            className="h-full bg-black rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Step image */}
        {step.imageSrc && (
          <div className="mb-3 flex items-center justify-start">
            <img
              src={step.imageSrc}
              alt={step.imageAlt ?? ""}
              className="rounded-lg border border-gray-200 shadow-sm max-h-14"
            />
          </div>
        )}

        {/* Step body text */}
        <div className="text-sm leading-6 text-gray-800">{step.body}</div>

        {/* Actions (Back on the left, Skip/Next on the right) */}
        <div className="mt-5 flex flex-wrap items-center gap-2 gap-y-4">
          {/* Back button aligned left */}
          {allowSkip && (
            <Button
              variant="outline"
              className="max-sm:w-full"
              onClick={markDone}
            >
              Ohita
            </Button>
          )}

          {/* Right side buttons */}
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
              {index === steps.length - 1 ? "Valmis" : "Seuraava"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}