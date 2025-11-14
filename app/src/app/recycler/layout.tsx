import Layout from "@/app/organizations/layout";
import Script from "next/script";
import { ReactNode } from "react";
import type { Metadata } from "next";

export async function generateMetadata() {
  return {
    title: "ReCycler",
  };
}

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
      <Layout>{children}</Layout>
    </>
  );
};

export default RecyclerLayout;
