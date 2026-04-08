"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageTemplate } from "@/components/admin/page-template";

const UseCaseHomePage = () => {
  useParams<{ id: string; useCaseId: string }>();

  return (
    <PageTemplate>
      <div className="pb-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-10">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-4xl">
              Määritä käyttötapaus ja sen data
            </h1>

            <p className="mt-4 text-sm leading-6 text-gray-600 md:text-base">
              Tässä näkymässä rakennat käyttötapauksen: määrität mitä käyttäjä
              näkee ja voi hakea, mistä data tulee, ja miten se muotoillaan
              kartalle ja listauksiin.
            </p>

            <div className="mt-6 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
              <div className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                Liitä ja ylläpidä datayhteydet käyttötapaukseen
              </div>
              <div className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                Määritä mitä kohteita näytetään ja millä ehdoilla
              </div>
              <div className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                Muokkaa kenttiä ja ominaisuuksia ilman koodausta
              </div>
              <div className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                  Tarkista lokit, kun tuot uutta dataa tai teet muutoksia
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default UseCaseHomePage;
