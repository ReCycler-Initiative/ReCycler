"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { PageIntro } from "@/components/admin/page-intro";
import { useMessages } from "@/i18n/locale-provider";
import { BarChart3, Bot, MousePointerClick, Search } from "lucide-react";

const icons = [Search, BarChart3, Bot] as const;

type UsageStatsCard = {
  title: string;
  description: string;
};

export default function UsageStatsPage() {
  const messages = useMessages();

  return (
    <PageTemplate>
      <div className="grid gap-6">
        <PageIntro
          title={messages.admin.usageStatsTitle}
          description={messages.admin.usageStatsIntro}
        />

        <section className="grid gap-4 md:grid-cols-3">
          {messages.admin.usageStatsCards.map(
            (card: UsageStatsCard, index: number) => {
            const Icon = icons[index] ?? MousePointerClick;
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
              </div>
            );
            }
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {messages.admin.usageStatsFutureTitle}
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {messages.admin.usageStatsFutureItems.map((item: string) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
