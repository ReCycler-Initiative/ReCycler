"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { ArrowRight, Blocks, Bot, ChartColumn, Database, MapPin, ScrollText } from "lucide-react";
import { useMessages } from "@/i18n/locale-provider";
import Link from "next/link";
import { useParams } from "next/navigation";

const UseCaseHelpPage = () => {
  const messages = useMessages();
  const { id, useCaseId } = useParams<{ id: string; useCaseId: string }>();

  const rootPath = `/admin/organizations/${id}/use_cases/${useCaseId}`;

  const sections = [
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
      href: `${rootPath}/runs`,
      icon: ScrollText,
      label: messages.admin.logs,
      description: messages.admin.runsIntro,
    },
    {
      href: `${rootPath}/usage`,
      icon: ChartColumn,
      label: messages.admin.usageStats,
      description: messages.admin.usageStatsIntro,
    },
  ];

  return (
    <PageTemplate title={messages.adminHelp.title}>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm leading-6 text-slate-700">{messages.adminHelp.description}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{messages.adminHelp.quickStartTitle}</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
          {messages.adminHelp.quickStartSteps.map((step: string) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{messages.adminHelp.sectionsTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">{messages.adminHelp.sectionsDescription}</p>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <section.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">{section.label}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{messages.adminHelp.tipsTitle}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
          {messages.adminHelp.tips.map((tip: string) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </PageTemplate>
  );
};

export default UseCaseHelpPage;
