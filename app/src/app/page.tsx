"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ReactNode } from "react";
import { PageTemplate } from "@/components/admin/page-template";
import { PricingAiChat } from "@/components/pricing-ai-chat";
import TitleBarService from "@/components/title-bar-service";
import { getPricingPlans } from "@/content/pricing";
import { useLocale, useMessages } from "@/i18n/locale-provider";

type PricingCardProps = {
  name: string;
  audience: string;
  price: string;
  description: string;
  highlights: string[];
  ctaLabel?: string;
  ctaHref?: string;
  ctaNode?: ReactNode;
  featured?: boolean;
  featuredLabel: string;
};

const PricingCard = ({
  name,
  audience,
  price,
  description,
  highlights,
  ctaLabel,
  ctaHref,
  ctaNode,
  featured = false,
  featuredLabel,
}: PricingCardProps) => {
  return (
    <section
      className={[
        "rounded-2xl border bg-white p-6",
        featured
          ? "border-gray-900 shadow-sm ring-1 ring-gray-900"
          : "border-gray-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            {audience}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">{name}</h3>
        </div>
        {featured && (
          <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
            {featuredLabel}
          </span>
        )}
      </div>

      <div className="mt-5 text-3xl font-semibold tracking-tight text-gray-900">
        {price}
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>

      <ul className="mt-5 space-y-3 text-sm text-gray-700">
        {highlights.map((highlight) => (
          <li key={highlight} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900" />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      {ctaNode ?? (
        <Link
          href={ctaHref ?? "/api/auth/login?screen_hint=signup"}
          className={[
            "mt-6 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition",
            featured
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
          ].join(" ")}
        >
          {ctaLabel}
        </Link>
      )}
    </section>
  );
};

const HomePage = () => {
  const { locale } = useLocale();
  const messages = useMessages();
  const pricingPlans = getPricingPlans(locale);

  return (
    <>
      <TitleBarService />
      <PageTemplate title="">
        <div className="px-4 py-10">
          {/* HERO SECTION */}
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="p-6 md:p-10">
              <div className="mx-auto max-w-3xl">
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
                  {messages.marketing.heroTitle}
                </h1>

                <p className="mt-4 text-sm leading-6 text-gray-600 md:text-base">
                  {messages.marketing.heroDescription}
                </p>

                <div className="mt-6 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                  {messages.marketing.highlights.map((highlight: string) => (
                    <div
                      key={highlight}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {messages.marketing.examplesTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {messages.marketing.exampleMunicipal}
                  </p>
                  <p className="mt-4 border-t border-gray-200 pt-4 text-sm leading-6 text-gray-600">
                    {messages.marketing.exampleBusiness}
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/recycler"
                    className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
                  >
                    {messages.marketing.openDemo}
                    <ExternalLink className="ml-2 inline" size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* PRICING SECTION */}
          <div className="mt-10">
            <div className="max-w-3xl">
              <h2 className="text-base font-semibold text-gray-900">
                {messages.marketing.pricingTitle}
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {messages.marketing.pricingDescription}
              </p>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              {pricingPlans.map((plan: {
                name: string;
                audience: string;
                price: string;
                description: string;
                highlights: string[];
                featured?: boolean;
              }) => (
                <PricingCard
                  key={plan.name}
                  name={plan.name}
                  audience={plan.audience}
                  price={plan.price}
                  description={plan.description}
                  highlights={plan.highlights}
                  featured={plan.featured}
                  featuredLabel={messages.common.recommended}
                  ctaNode={<PricingAiChat />}
                />
              ))}
            </div>

          </div>

          {/* INFO SECTION */}
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900">
                {messages.marketing.technologyTitle}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {messages.marketing.technologyDescription}
              </p>
              <div className="mt-3 text-xs text-gray-500">
                {messages.marketing.technologyStack}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-900">
                {messages.marketing.openSourceTitle}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {messages.marketing.openSourceDescription}
              </p>
              <div className="mt-3">
                <a
                  href="https://github.com/ReCycler-Initiative/ReCycler"
                  className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-700"
                >
                  {messages.common.openProjectGithub}{" "}
                  <ExternalLink className="ml-1 inline" size={16} />
                </a>
              </div>
            </section>
          </div>

          <footer className="mt-10 rounded-2xl border border-gray-200 bg-gray-900 px-6 py-8 text-white">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-300">
                  {messages.marketing.footerContactTitle}
                </h3>
                <p className="mt-3 text-lg font-semibold text-white">
                  {messages.marketing.footerCompanyName}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  {messages.marketing.footerCompanyDescription}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">{messages.marketing.footerAddressTitle}</h4>
                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {messages.marketing.footerAddressLines.map((line: string) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">{messages.marketing.footerContactSubtitle}</h4>
                <div className="mt-3 space-y-2 text-sm text-gray-300">
                  <p>
                    {messages.marketing.footerEmailLabel}: info@yritys.fi
                  </p>
                  <p>
                    {messages.marketing.footerPhoneLabel}: 010 123 4567
                  </p>
                  <p>
                    {messages.marketing.footerBusinessIdLabel}: 1234567-8
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </PageTemplate>
    </>
  );
};

export default HomePage;
