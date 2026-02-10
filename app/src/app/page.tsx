import Link from "next/link";
import { PageTemplate } from "@/components/admin/page-template";
import TitleBarService from "@/components/title-bar-service";

const HomePage = () => {
  return (
    <>
      <TitleBarService />
      <PageTemplate title="">
        <div className="mx-auto max-w-3xl py-16 text-center">
          <div className="space-y-6">
            {/* Heading */}
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              ReCycler Platform - Palvelu sijaintitiedon esittämiseen
            </h1>

            {/* Description */}
            <p className="mx-auto max-w-xl text-base text-slate-600">
              ReCycler Platform mahdollistaa erilaisten sijaintitietoon ja ominaisuuksiin perustuvien ratkaisujen helpon rakentamisen yhdelle alustalle. 
              ReCycler-demo toimii palvelun esimerkkinä, mutta sama kokonaisuus soveltuu laajasti muihin käyttötarkoituksiin.
            </p>

            {/* Actions */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/recycler"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Avaa ReCycler-demo
              </Link>

              <Link
                href="/api/auth/login?screen_hint=signup"
                className="inline-flex items-center justify-center rounded-xl border bg-white px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                Rekisteröidy / Kirjaudu
              </Link>
            </div>

            {/* Hint */}
            <div className="pt-4 text-xs text-slate-500">
              Kirjautuminen tapahtuu Auth0:n kautta (Google, O365 ym.)
            </div>
          </div>
        </div>
      </PageTemplate>
    </>
  );
};

export default HomePage;
