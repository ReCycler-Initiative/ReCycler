"use client";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { resolveLocalizedText } from "@/lib/use-case-content";
import { getUseCaseById } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
//import hero from "./recycle.png"; //let´s place when suitable photo

const HomePage = () => {
  const { locale } = useLocale();
  const messages = useMessages();
  const params = useParams<{ organizationId: string; useCaseId: string }>();

  const { data: useCase } = useQuery({
    queryKey: ["use_case", params.organizationId, params.useCaseId],
    queryFn: () => getUseCaseById(params.organizationId, params.useCaseId),
  });

  return (
    <>
      <Container className="flex-1 max-w-4xl">
        <h1 className="text-2xl font-medium mb-4 font-sans">
          {useCase ? resolveLocalizedText(useCase.content.intro.title, locale) : ""}
        </h1>
        <p className="mb-12 font-sans">
          {useCase ? resolveLocalizedText(useCase.content.intro.text, locale) : ""}
        </p>
        <div className="flex flex-col gap-4 items-center">
          <Button className="w-full max-w-96" asChild size="lg">
            <Link
              href={`/organizations/${params.organizationId}/use_cases/${params.useCaseId}/materials`}
            >
              {useCase ? resolveLocalizedText(useCase.content.intro.cta, locale) : ""}
            </Link>
          </Button>
          <Button className="w-full max-w-96" asChild variant="secondary">
            <Link
              className="no-underline"
              href={`/organizations/${params.organizationId}/use_cases/${params.useCaseId}/results`}
            >
              {useCase ? resolveLocalizedText(useCase.content.intro.skip, locale) : ""}
            </Link>
          </Button>
        </div>
      </Container>
      {/* Footer */}
      <footer className="w-full mt-16 bg-gray-200 py-4 text-center">
        <p className="text-xs">
          {messages.recyclerHome.footerIntro}{" "}
          <a
            href="https://github.com/ReCycler-Initiative/ReCycler"
            className="text-blue-500 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          . {messages.recyclerHome.footerLicense}
        </p>
      </footer>
    </>
  );
};

export default HomePage;
