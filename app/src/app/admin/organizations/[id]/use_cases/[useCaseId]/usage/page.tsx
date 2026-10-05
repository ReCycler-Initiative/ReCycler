"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { PageIntro } from "@/components/admin/page-intro";
import { useMessages } from "@/i18n/locale-provider";
import { Activity, Bot, MapPinned, SlidersHorizontal, Users } from "lucide-react";
import { useLocale } from "@/i18n/locale-provider";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type UsageReport = {
  days: number;
  totals: {
    visitors: number;
    map_views: number;
    filter_actions: number;
    chat_messages: number;
    chat_users: number;
  };
  daily: { date: string; visitors: number; filter_actions: number; chat_messages: number }[];
  selections: { code: string; count: number; name: string }[];
  chatTopics: { topic: string; count: number }[];
};

const periods = [7, 30, 90] as const;
const chartColors = { visitors: "#0f766e", filters: "#d97706", chat: "#2563eb" };

export default function UsageStatsPage() {
  const messages = useMessages();
  const { locale } = useLocale();
  const { id: organizationId, useCaseId } = useParams<{ id: string; useCaseId: string }>();
  const [days, setDays] = useState<(typeof periods)[number]>(30);
  const [report, setReport] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch(`/api/usage-events?organizationId=${organizationId}&useCaseId=${useCaseId}&days=${days}&locale=${locale}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Usage report request failed");
        return response.json();
      })
      .then((data: UsageReport) => setReport(data))
      .catch((fetchError: unknown) => {
        if (!(fetchError instanceof DOMException && fetchError.name === "AbortError")) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [days, locale, organizationId, useCaseId]);

  const chartData = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);
    return report?.daily.find((item) => item.date === key) ?? {
      date: key,
      visitors: 0,
      filter_actions: 0,
      chat_messages: 0,
    };
  });
  const chartMax = Math.max(1, ...chartData.flatMap((item) => [item.visitors, item.filter_actions, item.chat_messages]));
  const series = [
    { key: "visitors", color: chartColors.visitors, label: messages.admin.usageDashboard.visitors },
    { key: "filter_actions", color: chartColors.filters, label: messages.admin.usageDashboard.filterActions },
    { key: "chat_messages", color: chartColors.chat, label: messages.admin.usageDashboard.chatMessages },
  ] as const;

  const formatNumber = (value: number) => new Intl.NumberFormat(locale).format(value);
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));

  return (
    <PageTemplate>
      <div className="grid gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageIntro title={messages.admin.usageStatsTitle} description={messages.admin.usageDashboard.description} />
          <label className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700">
            <span>{messages.admin.usageDashboard.period}</span>
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value) as (typeof periods)[number])}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              {periods.map((period) => <option key={period} value={period}>{messages.admin.usageDashboard.days.replace("{days}", String(period))}</option>)}
            </select>
          </label>
        </div>

        {error && <div role="alert" className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">{messages.admin.usageDashboard.error}</div>}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy={loading}>
          {[
            { label: messages.admin.usageDashboard.visitors, value: report?.totals.visitors ?? 0, Icon: Users, color: "text-teal-700" },
            { label: messages.admin.usageDashboard.mapViews, value: report?.totals.map_views ?? 0, Icon: MapPinned, color: "text-sky-700" },
            { label: messages.admin.usageDashboard.filterActions, value: report?.totals.filter_actions ?? 0, Icon: SlidersHorizontal, color: "text-amber-700" },
            { label: messages.admin.usageDashboard.chatMessages, value: report?.totals.chat_messages ?? 0, Icon: Bot, color: "text-blue-700" },
          ].map(({ label, value, Icon, color }) => (
            <div key={label} className="border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-600">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
              </div>
              <div className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">{loading ? "–" : formatNumber(value)}</div>
            </div>
          ))}
        </section>

        <section className="border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h2 className="font-semibold text-slate-900">{messages.admin.usageDashboard.trend}</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
            {series.map((item) => <span key={item.key} className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>)}
          </div>
          {loading ? <p className="py-12 text-center text-sm text-slate-500">{messages.admin.usageDashboard.loading}</p> : (
            <div className="mt-3 overflow-hidden">
              <svg viewBox="0 0 720 230" className="h-56 w-full" role="img" aria-label={messages.admin.usageDashboard.trend}>
                {[0, 1, 2, 3].map((line) => {
                  const y = 18 + line * 58;
                  return <line key={line} x1="42" x2="708" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
                })}
                {series.map((item) => {
                  const values = chartData.map((datum) => datum[item.key]);
                  const points = values.map((value, index) => {
                    const x = 44 + (index / Math.max(1, chartData.length - 1)) * 660;
                    const y = 192 - (value / chartMax) * 170;
                    return `${x},${y}`;
                  }).join(" ");
                  return <polyline key={item.key} points={points} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />;
                })}
                {[0, Math.floor((chartData.length - 1) / 2), chartData.length - 1].map((index, tick) => {
                  const item = chartData[index];
                  const x = 44 + (index / Math.max(1, chartData.length - 1)) * 660;
                  return <text key={`${item.date}-${tick}`} x={x} y="220" textAnchor={tick === 0 ? "start" : tick === 2 ? "end" : "middle"} fill="#64748b" fontSize="11">{formatDate(item.date)}</text>;
                })}
              </svg>
            </div>
          )}
          {!loading && !error && report?.totals.map_views === 0 && <p className="text-center text-sm text-slate-500">{messages.admin.usageDashboard.empty}</p>}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="font-semibold text-slate-900">{messages.admin.usageDashboard.topSelections}</h2>
            {loading ? <p className="mt-5 text-sm text-slate-500">{messages.admin.usageDashboard.loading}</p> : report?.selections.length ? (
              <ol className="mt-4 space-y-4">
                {report.selections.map((material, index) => {
                  const max = report.selections[0]?.count ?? 1;
                  return <li key={material.code}>
                    <div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate text-slate-700">{index + 1}. {material.name}</span><span className="tabular-nums text-slate-500">{formatNumber(material.count)}</span></div>
                    <div className="h-2 bg-slate-100"><div className="h-full bg-amber-600" style={{ width: `${Math.max(3, material.count / max * 100)}%` }} /></div>
                  </li>;
                })}
              </ol>
            ) : <p className="mt-5 text-sm text-slate-500">{messages.admin.usageDashboard.noSelections}</p>}
          </div>
          <div className="border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="font-semibold text-slate-900">{messages.admin.usageDashboard.chatTopics}</h2>
            {loading ? <p className="mt-5 text-sm text-slate-500">{messages.admin.usageDashboard.loading}</p> : report?.chatTopics.length ? (
              <ol className="mt-4 divide-y divide-slate-100">
                {report.chatTopics.map((item) => <li key={item.topic} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="text-slate-700">{messages.admin.usageDashboard.topics[item.topic as keyof typeof messages.admin.usageDashboard.topics] ?? messages.admin.usageDashboard.topics.other_help}</span><span className="font-medium tabular-nums text-slate-900">{formatNumber(item.count)}</span></li>)}
              </ol>
            ) : <p className="mt-5 text-sm text-slate-500">{messages.admin.usageDashboard.noTopics}</p>}
          </div>
        </section>
        <p className="text-xs leading-5 text-slate-500">{messages.admin.usageDashboard.privacy}</p>
      </div>
    </PageTemplate>
  );
}
