"use client";

import TitleBar from "@/components/title-bar";
import AdminThemeToggle from "@/components/admin/admin-theme-toggle";
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
import {
  AppWindow,
  BriefcaseBusiness,
  ChartColumn,
  Blocks,
  Bot,
  Database,
  ExternalLink,
  MapPin,
  ScrollText,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoadingSpinner } from "@/components/page-loading-spinner";
import { useMessages } from "@/i18n/locale-provider";
import { LucideIcon } from "lucide-react";

type NavLink = {
  exact?: boolean;
  href: string;
  icon?: LucideIcon;
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
  const messages = useMessages();
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const [adminTheme, setAdminTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("recycler-admin-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setAdminTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("recycler-admin-theme", adminTheme);
  }, [adminTheme]);

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
      "admin-nav-link inline-flex items-center rounded-full px-5 py-2 text-sm font-normal transition",
      isActive
        ? "admin-nav-link-active bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-sm"
        : "text-gray-700 hover:bg-gray-100"
    );

  const navLinks: NavLink[] = [
    {
      exact: true,
      href: `${orgRootPath}`,
      label: organization.name,
      icon: AppWindow,
    },
    {
      href: `${orgRootPath}/fields`,
      label: messages.admin.fields,
      icon: Blocks,
    },
    {
      href: `${orgRootPath}/datasources`,
      label: messages.admin.datasources,
      icon: Database,
    },
    {
      href: `${orgRootPath}/locations`,
      label: messages.admin.locations,
      icon: MapPin,
    },
    { href: `${orgRootPath}/ai`, label: messages.admin.ai, icon: Bot },
    { href: `${orgRootPath}/runs`, label: messages.admin.logs, icon: ScrollText },
    {
      href: `${orgRootPath}/usage`,
      label: messages.admin.usageStats,
      icon: ChartColumn,
    },
  ];

  return (
    <div
      className="admin-shell flex flex-col h-full bg-white text-slate-950"
      data-admin-theme={adminTheme}
    >
      <TitleBar logo={null} toHomeHref="/">
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
                {link.icon && <link.icon className="mr-2 h-4 w-4" aria-hidden="true" />}
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center ml-auto mr-2">
            <Label className="admin-usecase-label mr-4 inline-flex items-center gap-2 font-normal text-gray-700">
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
              {messages.admin.useCaseLabel}
            </Label>
            <Select
              defaultValue={useCasesQuery.data?.[0]?.id}
              value={selectedUseCaseId}
              onValueChange={() => {
                router.push(
                  `/admin/organizations/${id}/use_cases/${selectedUseCaseId}`
                );
              }}
            >
              <SelectTrigger className="admin-usecase-select w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="admin-usecase-select-content">
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
              className={cn(navButtonClass(true), "admin-open-link")}
              aria-label={messages.admin.openSelectedUseCase}
              target="_blank"
              title={messages.admin.openSelectedUseCase}
            >
              {messages.admin.open}
              <ExternalLink className="ml-2" size={16} />
            </Link>
          )}

          <AdminThemeToggle
            isDark={adminTheme === "dark"}
            onToggle={() =>
              setAdminTheme((currentTheme) =>
                currentTheme === "dark" ? "light" : "dark"
              )
            }
          />

          <DropdownMenu>
            <DropdownMenuTrigger className="admin-settings-trigger mr-1 rounded-full px-3 py-2 text-slate-700 transition hover:bg-gray-100 hover:text-slate-900">
              <SettingsIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="admin-settings-menu">
              <DropdownMenuItem asChild>
                <Link href={`${orgRootPath}/general_info`}>
                  <AppWindow className="mr-2 h-4 w-4 text-slate-500" />
                  {messages.admin.organizationDetails}
                </Link>
              </DropdownMenuItem>

              {selectedUseCaseId && (
                <DropdownMenuItem asChild>
                  <Link href={`${orgRootPath}/edit`}>
                    <BriefcaseBusiness className="mr-2 h-4 w-4 text-slate-500" />
                    {messages.admin.useCaseDetails}
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TitleBar>

      <main className="admin-content flex-1 flex flex-col bg-gray-100">
        {children}
      </main>
    </div>
  );
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const messages = useMessages();
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
        router.push("/auth/login");
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
        <div className="text-lg">{messages.pageLoading.verifyingAccess}</div>
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
