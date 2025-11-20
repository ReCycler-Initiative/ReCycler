"use client";

import { useUser } from "@auth0/nextjs-auth0";

export default function PopupEditText() {
  const { user, isLoading } = useUser();

  if (isLoading) return null;
  if (!user) return null;

  return <div className="text-sm text-gray-800">Muokkaa kohteen tietoja (kirjautunut käyttäjä)</div>;
}
