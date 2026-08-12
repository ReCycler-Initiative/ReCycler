"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import logo from "../recycler-logo.png";

export default function RecyclerLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/recycler-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/recycler");
    } else {
      setError("Väärä käyttäjätunnus tai salasana.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-16 px-6 border-b border-gray-200 bg-white flex items-center">
        <Link href="/">
          <Image src={logo} alt="ReCycler" width={130} className="pb-1" />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900">
              Avaa ReCycler Demo
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Syötä demotunnukset jatkaaksesi.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="username">Käyttäjätunnus</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Salasana</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Kirjaudutaan..." : "Kirjaudu sisään"}
              </Button>
            </form>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <Link
                href="/"
                className="block text-center text-sm text-gray-500 hover:text-gray-700 transition"
              >
                ← Takaisin etusivulle
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
