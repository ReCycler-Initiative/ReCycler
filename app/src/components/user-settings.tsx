// components/user-settings.tsx
"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useQuery } from "@tanstack/react-query";
import { getUserOrganizations, getUseCases } from "@/services/api";
import { Organization, UseCase } from "@/types";
import Container from "./container";
import LoadingSpinner from "./loading-spinner";
import Link from "next/link";
import { z } from "zod";

function OrganizationCard({ org }: { org: z.infer<typeof Organization> }) {
  const useCasesQuery = useQuery({
    queryKey: ["use_cases", org.id],
    queryFn: () => getUseCases(org.id),
  });

  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
      <h3 className="font-medium text-gray-800 mb-3">{org.name}</h3>
      <div>
        <p className="text-sm text-gray-500 mb-2">Palvelut:</p>
        {useCasesQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LoadingSpinner />
            <span>Ladataan palveluita...</span>
          </div>
        ) : useCasesQuery.error ? (
          <p className="text-sm text-red-600">Virhe palveluiden lataamisessa</p>
        ) : useCasesQuery.data && useCasesQuery.data.length > 0 ? (
          <ul className="space-y-1">
            {useCasesQuery.data.map((useCase: z.infer<typeof UseCase>) => (
              <li key={useCase.id}>
                <Link
                  href={``}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {useCase.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Ei palveluita</p>
        )}
      </div>
    </div>
  );
}

export default function UserSettings() {
  const { user, isLoading } = useUser();

  const organizationsQuery = useQuery({
    queryKey: ["user_organizations"],
    queryFn: getUserOrganizations,
    enabled: !!user,
  });

  if (isLoading)
    return (
      <Container>
        <p>Ladataan käyttäjätietoja...</p>
      </Container>
    );
  if (!user)
    return (
      <Container>
        <p>Kirjaudu sisään nähdäksesi asetuksesi.</p>
      </Container>
    );

  // static data, will be later stored in the backend / db
  const role = "Admin";

  return (
    <Container>
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        <h1 className="text-2xl font-semibold mb-4">Käyttäjäasetukset</h1>

        {/* User data */}
        <section className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
          <h2 className="font-medium text-gray-800 mb-3">Käyttäjätiedot</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Käyttäjä-ID</dt>
              <dd className="font-mono text-sm">{user.sub}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Sähköposti</dt>
              <dd className="text-sm">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Rooli</dt>
              <dd className="text-sm">{role}</dd>
            </div>
          </dl>
        </section>

        {/* Organisations and Services */}
        <section>
          <h2 className="font-medium text-gray-800 mb-3 text-lg">
            Organisaatiot ja palvelut
          </h2>
          {organizationsQuery.isLoading ? (
            <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm flex items-center gap-2 text-sm text-gray-500">
              <LoadingSpinner />
              <span>Ladataan organisaatioita...</span>
            </div>
          ) : organizationsQuery.error ? (
            <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
              <p className="text-sm text-red-600">
                Virhe organisaatioiden lataamisessa
              </p>
            </div>
          ) : organizationsQuery.data && organizationsQuery.data.length > 0 ? (
            <div className="space-y-4">
              {organizationsQuery.data.map((org) => (
                <OrganizationCard key={org.id} org={org} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
              <p className="text-sm text-gray-500">
                Et kuulu yhteenkään organisaatioon
              </p>
            </div>
          )}
        </section>

        <p className="text-xs text-gray-400">
          Käyttäjätiedot haetaan Auth0:sta. Tämä sovellus ei tallenna
          henkilötietoja.
        </p>
      </div>
    </Container>
  );
}
