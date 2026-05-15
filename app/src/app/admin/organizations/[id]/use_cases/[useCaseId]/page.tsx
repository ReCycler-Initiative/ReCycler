"use client";

import {
  ArrowRight,
  Blocks,
  Bot,
  ChartColumn,
  Database,
  MapPin,
  ScrollText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMessages } from "@/i18n/locale-provider";
import { PageTemplate } from "@/components/admin/page-template";

const UseCaseHomePage = () => {
  const messages = useMessages();
  const { id, useCaseId } = useParams<{ id: string; useCaseId: string }>();

  const rootPath = `/admin/organizations/${id}/use_cases/${useCaseId}`;
  const actionCards = [
    {
      href: `${rootPath}/datasources`,
      icon: Database,
      label: messages.admin.datasources,
      description: messages.admin.datasourcesIntro,
    },
    {
      href: `${rootPath}/fields`,
      icon: Blocks,
      label: messages.admin.fields,
      description: messages.admin.useCaseHomeHighlights[2],
    },
    {
      href: `${rootPath}/locations`,
      icon: MapPin,
      label: messages.admin.locations,
      description: messages.admin.useCaseHomeHighlights[1],
    },
    {
      href: `${rootPath}/ai`,
      icon: Bot,
      label: messages.admin.ai,
      description: messages.adminAiPage.description,
    },
    {
      href: `${rootPath}/usage`,
      icon: ChartColumn,
      label: messages.admin.usageStats,
      description: messages.admin.usageStatsIntro,
    },
    {
      href: `${rootPath}/runs`,
      icon: ScrollText,
      label: messages.admin.logs,
      description: messages.admin.runsIntro,
    },
  ];

  return (
    <PageTemplate>
      <div className="pb-10">
        <div className="rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(226,232,240,0.9),_rgba(255,255,255,1)_42%)] p-6 shadow-sm md:p-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              {messages.admin.useCaseHomeBadge}
            </div>

            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              {messages.admin.useCaseHomeTitle}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              {messages.admin.useCaseHomeDescription}
            </p>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {messages.admin.useCaseHomeProgressTitle}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {messages.admin.useCaseHomeProgressDescription}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                {
                  step: "1",
                  title: messages.admin.datasources,
                  description: messages.admin.datasourcesIntro,
                },
                {
                  step: "2",
                  title: messages.admin.fields,
                  description: messages.admin.useCaseHomeHighlights[2],
                },
                {
                  step: "3",
                  title: messages.admin.locations,
                  description: messages.admin.useCaseHomeHighlights[1],
                },
                {
                  step: "4",
                  title: messages.admin.usageStats,
                  description: messages.admin.usageStatsIntro,
                },
                {
                  step: "5",
                  title: messages.admin.logs,
                  description: messages.admin.runsIntro,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`${rootPath}/datasources`}
                className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {messages.admin.useCaseHomePrimaryCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={`${rootPath}/locations`}
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {messages.admin.useCaseHomeSecondaryCta}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {messages.admin.useCaseHomeAreasTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {messages.admin.useCaseHomeAreasDescription}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {actionCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  {card.label}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default UseCaseHomePage;
