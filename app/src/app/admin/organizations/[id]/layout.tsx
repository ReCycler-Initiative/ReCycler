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
import { SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Content = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<string | undefined>();

  const organizationQuery = useQuery({
    queryKey: ["organization", id],
    queryFn: () => getOrganizationById(id),
  });

  const useCasesQuery = useQuery({
    queryKey: ["use_cases", id],
    queryFn: () => getUseCases(id),
  });

  useEffect(() => {
    if (useCasesQuery.data && useCasesQuery.data.length > 0) {
      setSelectedUseCaseId(useCasesQuery.data[0].id);
    }
  }, [useCasesQuery.data]);

  const orgRootPath = `/admin/organizations/${id}`;
  const isOrgRoot = pathname === orgRootPath;

  const isActiveSection = (segment: "datasources" | "locations" | "runs") =>
    pathname?.startsWith(`${orgRootPath}/${segment}`) ?? false;

  // Same visual style as "Avaa ReCycler-demo"
  const navButtonClass = (isActive: boolean) =>
    cn(
      "inline-flex items-center rounded-full px-5 py-2 text-sm font-medium transition",
      isActive
        ? "bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-sm"
        : "text-gray-700 hover:bg-gray-100"
    );

  // Organization name styling (NO bold)
  const orgLogoClass = cn(
    "ml-2 inline-flex items-center rounded-full px-4 py-2 transition text-sm",
    isOrgRoot
      ? "bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-sm"
      : "text-slate-900 hover:bg-gray-100"
  );

  return (
    <div className="flex flex-col h-full">
      <TitleBar
        logo={<span className={orgLogoClass}>{organizationQuery.data?.name}</span>}
        toHomeHref={orgRootPath}
      >
        <div className="flex flex-1 h-full items-center">
          <nav className="flex ml-4 h-full items-center gap-2">
            <Link
              href={`${orgRootPath}/datasources`}
              className={navButtonClass(isActiveSection("datasources"))}
            >
              Datayhteydet
            </Link>

            <Link
              href={`${orgRootPath}/locations`}
              className={navButtonClass(isActiveSection("locations"))}
            >
              Kohteet
            </Link>

            <Link
              href={`${orgRootPath}/runs`}
              className={navButtonClass(isActiveSection("runs"))}
            >
              Lokit ja ajot
            </Link>
          </nav>

          <div className="flex items-center ml-auto mr-2">
            <Label className="mr-4">Käyttötapaus</Label>
            <Select
              defaultValue={useCasesQuery.data?.[0]?.id}
              value={selectedUseCaseId}
              onValueChange={setSelectedUseCaseId}
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
                  <Link href={`${orgRootPath}/use_cases/${selectedUseCaseId}`}>
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
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const accessQuery = useQuery({
    queryKey: ["organization_access", id],
    queryFn: () => checkOrganizationAccess(id),
    retry: false,
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

  if (accessQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (accessQuery.error || !accessQuery.data?.hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Verifying access...</div>
      </div>
    );
  }

  return <Content>{children}</Content>;
};

export default AdminLayout;
