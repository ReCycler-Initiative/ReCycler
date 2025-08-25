"use client";

import Layout from "@/app/organizations/layout";
import Script from "next/script";
import { ReactNode } from "react";

const RecyclerLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Script id="chatling">
        {`window.chtlConfig = { chatbotId: "3433989154" }`}
      </Script>
      <Script
        async
        data-id="3433989154"
        id="chatling-embed-script"
        type="text/javascript"
        src="https://chatling.ai/js/embed.js"
      ></Script>
      <Layout>{children}</Layout>;
    </>
  );
};

export default RecyclerLayout;
