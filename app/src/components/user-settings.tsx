// components/user-settings.tsx
// Mocking up the setting page, values are static or fetched from auth0
import { useUser } from "@auth0/nextjs-auth0";
import Container from "./container";

export default function UserSettings() {
  const { user, isLoading } = useUser();

  if (isLoading) return <Container><p>Ladataan käyttäjätietoja...</p></Container>;
  if (!user) return <Container><p>Kirjaudu sisään nähdäksesi asetuksesi.</p></Container>;

  // static data, will be later stored in the backend / db
  const organization = "Example Ltd.";
  const service = "Example-service";
  const role = "Org-Admin-example";

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
          <h2 className="font-medium text-gray-800 mb-3">Organisaatio ja palvelu</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Organisaatio</dt>
              <dd className="text-sm">{organization}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Palvelu</dt>
              <dd className="text-sm">{service}</dd>
            </div>
          </dl>
        </section>

        <p className="text-xs text-gray-400">
          Käyttäjätiedot haetaan Auth0:sta. Tämä sovellus ei tallenna henkilötietoja.
        </p>
      </div>
    </Container>
  );
}