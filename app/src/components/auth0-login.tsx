"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "./ui/button";
import LoadingSpinner from "./loading-spinner";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Poimii nimikirjaimet: "Jussi Niilahti" -> "JN", "jussi@..." -> "J"
function getInitials(name?: string | null, email?: string | null) {
  const src = (name || email || "").trim();
  if (!src) return "?";
  const parts = src.split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Auth0Login() {
  const { user, isLoading } = useUser();
  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {!user ? (
        <Button asChild>
          <a href="/auth/login">Kirjaudu sisään</a>
        </Button>
      ) : (
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span
                className="relative h-12 w-12 rounded-full overflow-hidden ring-1 ring-black/5 my-2 cursor-pointer group"
                aria-label={user.name ?? user.email ?? "Käyttäjä"}
                title={user.name ?? user.email ?? "Käyttäjä"}
              >
                <img
                  src={user.picture ?? "/avatar-fallback.png"}
                  alt={user.name ?? user.email ?? "Käyttäjä"}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="h-full w-full absolute inset-0 group-hover:bg-black/50 transition bg-black/0" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] select-none">
                    {getInitials(user.name, user.email)}
                  </span>
                </span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/user-settings">Asetukset</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/logout">Kirjaudu ulos</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}