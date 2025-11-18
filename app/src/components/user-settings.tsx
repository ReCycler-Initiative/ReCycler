// components/user-settings.tsx
// Mocking up the setting page, values are static or fetched from auth0
import { useUser } from "@auth0/nextjs-auth0";
import Container from "./container";
import Link from 'next/link';
import { useEffect, useState } from "react";

export default function UserSettings() {
  const { user, isLoading } = useUser();

  if (isLoading) return <Container><p>Ladataan käyttäjätietoja...</p></Container>;
  if (!user) return <Container><p>Kirjaudu sisään nähdäksesi asetuksesi.</p></Container>;

  // static data, will be later stored in the backend / db
  const organization = "ReCycler Ltd.";
  const service = "Recycler";
  const role = "Admin";

  // materials state
  const [materials, setMaterials] = useState<string[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingMaterials(true);
      try {
        const res = await fetch("/api/materials");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (!mounted) return;
        setMaterials(data.map((m: any) => m.name || m));
      } catch (e) {
        console.error(e);
        if (mounted) setMaterials([]);
      } finally {
        if (mounted) setLoadingMaterials(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

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

  {/* Organisation */}
  <section className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
          <h2 className="font-medium text-gray-800 mb-3">Organisaatio ja palvelut</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Organisaatio</dt>
              <dd className="text-sm">{organization}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Palvelut</dt>
              <dd className="text-sm underline"><Link href="/recycler">{service}</Link></dd>
            </div>
          </dl>
        </section>

        {/* Materials list */}
        <section className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
          <h2 className="font-medium text-gray-800 mb-3">Materiaalit</h2>

          {loadingMaterials ? (
            <p className="text-sm text-gray-500">Ladataan materiaaleja…</p>
          ) : materials.length === 0 ? (
            <p className="text-sm text-gray-500">Ei materiaaleja.</p>
          ) : (
            <>
              {/* paging: if more than 30 -> split into two pages */}
              {(() => {
                const PAGE_BREAK = 30;
                const total = materials.length;
                const pageCount = total > PAGE_BREAK ? 2 : 1;
                const half = Math.ceil(total / 2);
                const start = pageCount === 1 ? 0 : page === 1 ? 0 : half;
                const end = pageCount === 1 ? total : page === 1 ? half : total;
                const visible = materials.slice(start, end);

                return (
                  <div>
                    <ul className="grid grid-cols-1 gap-1">
                      {visible.map((m, i) => (
                        <li key={i} className="text-sm">
                          {m}
                        </li>
                      ))}
                    </ul>

                    {pageCount > 1 && (
                      <div className="mt-3 flex gap-2">
                        <button
                          className="px-3 py-1 rounded border"
                          onClick={() => setPage(1)}
                          disabled={page === 1}
                        >
                          1
                        </button>
                        <button
                          className="px-3 py-1 rounded border"
                          onClick={() => setPage(2)}
                          disabled={page === 2}
                        >
                          2
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </section>

        <p className="text-xs text-gray-400">
          Käyttäjätiedot haetaan Auth0:sta. Tämä sovellus ei tallenna henkilötietoja.
        </p>
      </div>
    </Container>
  );
}