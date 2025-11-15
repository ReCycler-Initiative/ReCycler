"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "./ui/button";
import LoadingSpinner from "./loading-spinner";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { getUserOrganizations } from "@/services/api";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogInIcon } from "lucide-react";
import { cn } from "@/utils/shadcn";

// Extracts initials: "Joe Doe" -> "JD", "joe@..." -> "J"
function getInitials(name?: string | null, email?: string | null) {
  const src = (name || email || "").trim();
  if (!src) return "?";
  const parts = src.split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Auth0Login() {
  const { user, isLoading } = useUser();
  const organizationsQuery = useQuery({
    queryKey: ["user_organizations"],
    queryFn: getUserOrganizations,
    enabled: !!user,
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Rebuild full path with query params
  const currentUrl =
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  return (
    <div className="relative">
      <div>
        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-black/5 animate-pulse">
          <LoadingSpinner />
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {!isLoading && (
          <>
            {!user ? (
              <Button
                asChild
                className="h-12 w-12 rounded-full fade-in-once [animation-delay:500ms] opacity-0"
                size="icon"
              >
                <a
                  href={`/auth/login?returnTo=${encodeURIComponent(currentUrl)}`}
                >
                  <LogInIcon size="20" />
                  <span className="sr-only">Kirjaudu sisään</span>
                </a>
              </Button>
            ) : (
              <div className="flex items-center gap-1 fade-in-once [animation-delay:700ms] opacity-0">
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
                    {organizationsQuery.data &&
                      organizationsQuery.data.length > 0 && (
                        <>
                          {organizationsQuery.data.map((org) => (
                            <DropdownMenuItem key={org.id} asChild>
                              <Link href={`/admin/organizations/${org.id}`}>
                                {org.name}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                        </>
                      )}
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
          </>
        )}
      </div>
    </div>
  );
}
