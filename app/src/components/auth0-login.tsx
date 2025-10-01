"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "./ui/button";
import LoadingSpinner from "./loading-spinner";

function getInitials(name?: string | null, email?: string | null) {
  if (!name && !email) return "?";
  const source = name || email || "";
  const parts = source.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

export default function Auth0Login() {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 text-sm">{error.message}</div>;

  const initials = getInitials(user?.name, user?.email);

  return (
    <div>
      {!user ? (
        <Button asChild>
          <a href="/auth/login">Kirjaudu sisään</a>
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          {/* Avatar kuvalla ja nimikirjaimilla overlayna */}
          <div className="relative h-12 w-12 rounded-full overflow-hidden">
            <img
              src={user?.picture ?? "/avatar-fallback.png"}
              alt={user?.name ?? user?.email ?? "Käyttäjä"}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="text-xs font-bold text-white">{initials}</span>
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