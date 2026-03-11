"use client";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { getUseCaseById } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
//import hero from "./recycle.png"; //let´s place when suitable photo

const HomePage = () => {
  const params = useParams<{ organizationId: string; useCaseId: string }>();

  const { data: useCase } = useQuery({
    queryKey: ["use_case", params.organizationId, params.useCaseId],
    queryFn: () => getUseCaseById(params.organizationId, params.useCaseId),
  });

  return (
    <>
      <Container className="flex-1 max-w-4xl">
        <h1 className="text-2xl font-medium mb-4 font-sans">
          {useCase?.content.intro.title}
        </h1>
        <p className="mb-12 font-sans">
          {useCase?.content.intro.text}
        </p>
        <div className="flex flex-col gap-4 items-center">
          <Button className="w-full max-w-96" asChild size="lg">
            <Link
              href={`/organizations/${params.organizationId}/use_cases/${params.useCaseId}/materials`}
            >
              {useCase?.content.intro.cta}
            </Link>
          </Button>
          <Button className="w-full max-w-96" asChild variant="secondary">
            <Link
              className="no-underline"
              href={`/organizations/${params.organizationId}/use_cases/${params.useCaseId}/results`}
            >
              {useCase?.content.intro.skip}
            </Link>
          </Button>
        </div>
      </Container>
      {/* Footer */}
      <footer className="w-full mt-16 bg-gray-200 py-4 text-center">
        <p className="text-xs">
          ReCycler on Github-projekti. Lähdekoodi ja lisenssitiedot löytyvät
          projektin{" "}
          <a
            href="https://github.com/ReCycler-Initiative/ReCycler"
            className="text-blue-500 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github-sivuilta
          </a>
          . Projekti on lisensoitu Apache 2.0 -lisenssillä. Projektissa käytetty
          kierrätyspisteiden sijainti- ja ominaisuustiedot ovat peräisin
          Kierrätys.info-palvelun rajapinnasta (API). Kaikki oikeudet
          Kierrätys.info-palveluun ja sen dataan omistaa KIVO ry.
        </p>
      </footer>
    </>
  );
};

export default HomePage;
