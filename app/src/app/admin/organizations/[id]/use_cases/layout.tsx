"use client";

import TitleBar from "@/components/title-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  checkOrganizationAccess,
  getOrganizationById,
  getUseCases,
} from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ExternalLink, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoadingSpinner } from "@/components/page-loading-spinner";

type NavLink = {
  exact?: boolean;
  href: string;
  label: string;
};

const Content = ({
  children,
  organization,
  selectedUseCaseId,
}: {
  children: React.ReactNode;
  organization: any;
  selectedUseCaseId: string;
}) => {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();

  const useCasesQuery = useQuery({
    queryKey: ["use_cases", id],
    queryFn: () => getUseCases(id),
  });

  const orgRootPath = `/admin/organizations/${id}/use_cases/${selectedUseCaseId}`;

  const isActiveSection = (segment: string, exact?: boolean) => {
    if (exact) {
      return pathname === segment;
    }

    return pathname?.startsWith(segment) ?? false;
  };

  // Same visual style as "Avaa ReCycler-demo"
  const navButtonClass = (isActive: boolean) =>
    cn(
      "inline-flex items-center rounded-full px-5 py-2 text-sm font-medium transition",
      isActive
        ? "bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-sm"
        : "text-gray-700 hover:bg-gray-100"
    );

  const navLinks: NavLink[] = [
    { exact: true, href: `${orgRootPath}`, label: organization.name },
    { href: `${orgRootPath}/datasources`, label: "Datayhteydet" },
    { href: `${orgRootPath}/locations`, label: "Kohteet" },
    { href: `${orgRootPath}/runs`, label: "Lokit ja ajot" },
  ];

  return (
    <div className="flex flex-col h-full">
      <TitleBar
        logo={<p className="font-bold ml-2">ReCycler Platform</p>}
        toHomeHref="/"
      >
        <div className="flex flex-1 h-full items-center gap-x-4">
          <nav className="flex ml-4 h-10 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navButtonClass(
                  isActiveSection(link.href, link.exact)
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center ml-auto mr-2">
            <Label className="mr-4">Käyttötapaus</Label>
            <Select
              defaultValue={useCasesQuery.data?.[0]?.id}
              value={selectedUseCaseId}
              onValueChange={() => {
                router.push(
                  `/admin/organizations/${id}/use_cases/${selectedUseCaseId}`
                );
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {useCasesQuery.data?.map((useCase) => (
                  <SelectItem key={useCase.id} value={useCase.id}>
                    {useCase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUseCaseId && (
            <Link
              href={`/organizations/${id}/use_cases/${selectedUseCaseId}`}
              className={navButtonClass(true)}
              aria-label="Avaa valittu käyttötapaus"
              target="_blank"
              title="Avaa valittu käyttötapaus"
            >
              Avaa
              <ExternalLink className="ml-2" size={16} />
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="mr-1 px-3">
              <SettingsIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={`${orgRootPath}/general_info`}>
                  Organisaation tiedot
                </Link>
              </DropdownMenuItem>

              {selectedUseCaseId && (
                <DropdownMenuItem asChild>
                  <Link href={`${orgRootPath}/use_cases/${selectedUseCaseId}/edit`}>
                    Käyttötapauksen tiedot
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem asChild>
                <Link href={`${orgRootPath}/runs`}>Lokit ja ajot</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TitleBar>

      <main className="flex-1 flex flex-col bg-gray-100">{children}</main>
    </div>
  );
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { id, useCaseId } = useParams<{ id: string; useCaseId: string }>();
  const router = useRouter();

  const accessQuery = useQuery({
    queryKey: ["organization_access", id],
    queryFn: () => checkOrganizationAccess(id),
    retry: false,
  });

  const organizationQuery = useQuery({
    queryKey: ["organization", id],
    queryFn: () => getOrganizationById(id),
    enabled: accessQuery.data?.hasAccess === true,
  });

  useEffect(() => {
    if (accessQuery.error) {
      const error = accessQuery.error as any;
      if (error.response?.status === 401) {
        router.push("/api/auth/login");
      } else if (error.response?.status === 403) {
        router.push("/unauthorized");
      } else {
        router.push("/404");
      }
    }
  }, [accessQuery.error, router]);

  if (accessQuery.isLoading || organizationQuery.isLoading) {
    return <PageLoadingSpinner />;
  }

  if (accessQuery.error || !accessQuery.data?.hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Verifying access...</div>
      </div>
    );
  }

  return (
    <Content
      organization={organizationQuery.data}
      selectedUseCaseId={useCaseId}
    >
      {children}
    </Content>
  );
};

export default AdminLayout;
