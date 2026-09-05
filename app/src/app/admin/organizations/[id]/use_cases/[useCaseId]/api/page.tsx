"use client";

import { PageIntro } from "@/components/admin/page-intro";
import { PageTemplate } from "@/components/admin/page-template";
import { useMessages } from "@/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Code2, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const ApiDocumentationPage = () => {
  const messages = useMessages();
  const { id, useCaseId } = useParams<{ id: string; useCaseId: string }>();
  const [copied, setCopied] = useState(false);

  const endpoint = `/api/v1/export/organizations/${id}/use_cases/${useCaseId}/locations`;
  const tokenExample = `curl --request POST \\
  --url https://YOUR_AUTH0_DOMAIN/oauth/token \\
  --header 'content-type: application/json' \\
  --data '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "audience": "YOUR_AUTH0_AUDIENCE",
    "grant_type": "client_credentials"
  }'`;
  const apiExample = `curl --request GET \\
  --url https://YOUR_RECYCLER_DOMAIN${endpoint} \\
  --header 'authorization: Bearer YOUR_ACCESS_TOKEN' \\
  --header 'accept: application/json'`;

  const copyEndpoint = async () => {
    await navigator.clipboard.writeText(endpoint);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTemplate>
      <PageIntro
        title={messages.admin.apiPage.title}
        description={messages.admin.apiPage.description}
        icon={Code2}
        actions={
          <Button asChild className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
            <Link href="/api/docs" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              {messages.admin.apiPage.swaggerButton}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {messages.admin.apiPage.endpointTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {messages.admin.apiPage.endpointDescription}
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                GET
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:bg-white/10 hover:text-white"
                onClick={copyEndpoint}
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? messages.admin.apiPage.copied : messages.admin.apiPage.copyButton}
              </Button>
            </div>
            <code className="block overflow-x-auto p-4 text-sm leading-6 text-emerald-300">
              {endpoint}
            </code>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              {messages.admin.apiPage.authenticationNote}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {messages.admin.apiPage.idsTitle}
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-slate-600">
                {messages.admin.apiPage.organizationId}
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-900">{id}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600">
                {messages.admin.apiPage.useCaseId}
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-900">{useCaseId}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {messages.admin.apiPage.howToTitle}
        </h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-2">
          {messages.admin.apiPage.howToSteps.map((step: string, index: number) => (
            <li key={step} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white")}>
                {index + 1}
              </span>
              <span className="text-sm leading-6 text-slate-600">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {messages.admin.apiPage.tokenRequestTitle}
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-emerald-300">
            <code>{tokenExample}</code>
          </pre>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {messages.admin.apiPage.secretWarning}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {messages.admin.apiPage.apiRequestTitle}
          </h2>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-emerald-300">
            <code>{apiExample}</code>
          </pre>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-emerald-950">
            {messages.admin.apiPage.currentAuthTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-emerald-900">
            {messages.admin.apiPage.currentAuthBody}
          </p>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 md:p-6">
          <h2 className="text-lg font-semibold text-amber-950">
            {messages.admin.apiPage.futureAuthTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            {messages.admin.apiPage.futureAuthBody}
          </p>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {messages.admin.apiPage.postmanTitle}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {messages.admin.apiPage.postmanBody}
        </p>
      </section>
    </PageTemplate>
  );
};

export default ApiDocumentationPage;