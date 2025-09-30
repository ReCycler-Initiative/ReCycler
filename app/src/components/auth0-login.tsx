"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "./ui/button";
import LoadingSpinner from "./loading-spinner";

export default function Auth0Login() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      {!user ? (
        <Button asChild>
          <a href="/auth/login">Kirjaudu sisään</a>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <span>{user.name}</span>
          <Button asChild>
            <a
              href="/auth/logout"
            >
              Kirjaudu ulos
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
