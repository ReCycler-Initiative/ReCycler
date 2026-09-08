"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function MarkdownBlock({ filePath }: { filePath: string }) {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/content/" + filePath)
      .then((res) => res.text())
      .then(setContent);
  }, [filePath]);

  return <ReactMarkdown>{content}</ReactMarkdown>;
}
