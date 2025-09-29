"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

export default function Auth0Login() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Ladataan...</div>;
  if (error) return <div>Virhe: {error.message}</div>;

  return (
    <div>
      {!user ? (
        <Link
          href="/api/auth/login"
          className="px-4 py-2 bg-blue-600 text-white rounded inline-block"
        >
          Kirjaudu sisään
        </Link>
      ) : (
        <div className="flex items-center gap-2">
          <span>{user.name}</span>
          <Link
            href="/api/auth/logout"
            className="px-3 py-1 bg-gray-700 text-white rounded inline-block"
          >
            Kirjaudu ulos
          </Link>
        </div>
      )}
    </div>
  );
}