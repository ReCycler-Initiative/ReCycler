"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "./ui/button";
import LoadingSpinner from "./loading-spinner";

// Poimii nimikirjaimet: "Jussi Niilahti" -> "JN", "jussi@..." -> "J"
function getInitials(name?: string | null, email?: string | null) {
  const src = (name || email || "").trim();
  if (!src) return "?";
  const parts = src.split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Auth0Login() {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {!user ? (
        <Button asChild>
          <a href="/auth/login">Kirjaudu sisään</a>
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          {/* Avatar: kuva + nimikirjaimet overlayna, ei erillistä nimeä alla */}
          <div
            className="relative h-12 w-12 rounded-full overflow-hidden ring-1 ring-black/5"
            aria-label={user.name ?? user.email ?? "Käyttäjä"}
            title={user.name ?? user.email ?? "Käyttäjä"}
          >
            <img
              src={user.picture ?? "/avatar-fallback.png"}
              alt={user.name ?? user.email ?? "Käyttäjä"}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Nimikirjaimet keskelle kuvan päälle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] select-none">
                {getInitials(user.name, user.email)}
              </span>
            </div>
          </div>

          <Button asChild>
            <a href="/auth/logout">Kirjaudu ulos</a>
          </Button>
        </div>
      )}
    </div>
  );
}
