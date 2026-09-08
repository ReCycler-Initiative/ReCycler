"use client";

import { cn } from "@/utils/shadcn";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import { PageLoadingSpinner } from "./page-loading-spinner";
import LoadingSpinner from "./loading-spinner";
import { LoadingState } from "./loading-state";

const markdownComponents: Components = {
  h1: ({ node, ...props }) => (
    <h1 className="text-4xl font-bold mb-6" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-3xl font-semibold mb-5" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-2xl font-semibold mb-4" {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h4 className="text-xl font-semibold mb-3" {...props} />
  ),
  h5: ({ node, ...props }) => (
    <h5 className="text-lg font-medium mb-2" {...props} />
  ),
  h6: ({ node, ...props }) => (
    <h6 className="text-base font-medium mb-2 text-gray-600" {...props} />
  ),

  p: ({ node, ...props }) => (
    <p className="mb-4 leading-7 text-gray-800" {...props} />
  ),

  a: ({ node, ...props }) => (
    <a
      className="text-blue-600 underline hover:text-blue-800"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),

  ul: ({ node, ...props }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
  ),
  li: ({ node, ...props }) => <li className="leading-7" {...props} />,

  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4"
      {...props}
    />
  ),

  hr: ({ node, ...props }) => (
    <hr className="my-8 border-gray-300" {...props} />
  ),

  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border border-gray-300" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
  tbody: ({ node, ...props }) => <tbody {...props} />,
  tr: ({ node, ...props }) => (
    <tr className="border-b border-gray-300" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th className="px-4 py-2 text-left font-semibold" {...props} />
  ),
  td: ({ node, ...props }) => <td className="px-4 py-2 align-top" {...props} />,

  img: ({ node, ...props }) => (
    <img className="my-6 rounded-lg max-w-full h-auto" {...props} />
  ),

  strong: ({ node, children, ...props }) => {
    const text = String(children);

    const className =
      text.toLowerCase().includes("kyllä") || text.toLowerCase().includes("yes")
        ? "text-green-600"
        : text.toLowerCase().includes("ei") || text.toLowerCase().includes("no")
          ? "text-red-600"
          : "";

    return (
      <strong className={cn("font-semibold", className)} {...props}>
        {children}
      </strong>
    );
  },
  em: ({ node, ...props }) => <em className="italic" {...props} />,

  pre: ({ node, ...props }) => <>{props.children}</>,
};

export default function MarkdownBlock({ filePath }: { filePath: string }) {
  const { data, error, isLoading } = useQuery<string>({
    queryKey: ["markdown", filePath],
    queryFn: async () => {
      const res = await fetch("/content/" + filePath);
      if (!res.ok) {
        throw new Error("Failed to fetch markdown content");
      }
      return res.text();
    },
  });

  return (
    <LoadingState error={!!error} isLoading={isLoading}>
      <ReactMarkdown components={markdownComponents}>
        {data ?? ""}
      </ReactMarkdown>
    </LoadingState>
  );
}
