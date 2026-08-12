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
  Menu,
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
import { CreateUseCaseDialog } from "@/components/dialogs/create-use-case-dialog";

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
  const [adminTheme, setAdminTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    try {
      const savedTheme = window.localStorage.getItem("recycler-admin-theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }
    } catch {
      // Fall back to light when browser storage is unavailable.
    }

    return "light";
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDesktopNav, setIsDesktopNav] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem("recycler-admin-theme", adminTheme);
    } catch {
      // Ignore storage failures so the page still works.
    }
  }, [adminTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleViewportChange = (matches: boolean) => {
      setIsDesktopNav(matches);
      if (matches) {
        setIsMobileNavOpen(false);
      }
    };

    handleViewportChange(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) =>
      handleViewportChange(event.matches);

    // Safari compatibility fallback for older MediaQueryList APIs.
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, []);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

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
      "admin-nav-link inline-flex min-w-0 items-center rounded-full px-5 py-2 text-sm font-normal whitespace-nowrap transition",
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
  ];

  return (
    <div
      className="admin-shell flex flex-col h-full bg-white text-slate-950"
      data-admin-theme={adminTheme}
    >
      <TitleBar logo={null} toHomeHref="/">
        <div className="flex h-full min-w-0 flex-1 items-center gap-x-2 lg:gap-x-4 overflow-hidden">
          {!isDesktopNav && (
            <DropdownMenu open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <DropdownMenuTrigger className="inline-flex lg:hidden items-center justify-center rounded-full px-3 py-2 text-slate-700 transition hover:bg-gray-100 hover:text-slate-900">
                <Menu className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={cn(
                  "admin-settings-menu",
                  adminTheme === "dark" && "admin-settings-menu--dark"
                )}
                align="start"
              >
                {navLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} onClick={() => setIsMobileNavOpen(false)}>
                      {link.icon && (
                        <link.icon className="mr-2 h-4 w-4 text-slate-500" />
                      )}
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {selectedUseCaseId && (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/organizations/${id}/use_cases/${selectedUseCaseId}`}
                      target="_blank"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4 text-slate-500" />
                      {messages.admin.open}
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <nav className="ml-2 hidden h-10 min-w-0 flex-1 items-center gap-1 overflow-hidden pr-2 lg:flex">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  navButtonClass(isActiveSection(link.href, link.exact)),
                  index === 0 ? "max-w-[190px] xl:max-w-[260px]" : ""
                )}
              >
                {link.icon && <link.icon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />}
                <span className="truncate">{link.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mr-1 flex shrink-0 items-center lg:mr-2">
            <Label className="admin-usecase-label mr-2 hidden items-center gap-2 font-normal text-gray-700 md:mr-4 md:inline-flex">
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
              {messages.admin.useCaseLabel}
            </Label>
            <Select
              value={selectedUseCaseId || ""}
              onValueChange={(value) => {
                if (value === "create_new") {
                  setIsCreateDialogOpen(true);
                } else {
                  router.push(
                    `/admin/organizations/${id}/use_cases/${value}`
                  );
                }
              }}
            >
              <SelectTrigger className="admin-usecase-select w-[150px] md:w-[200px]">
                <SelectValue placeholder="Valitse käyttötapaus" />
              </SelectTrigger>
              <SelectContent className="admin-usecase-select-content">
                {useCasesQuery.data?.map((useCase) => (
                  <SelectItem key={useCase.id} value={useCase.id}>
                    {useCase.name}
                  </SelectItem>
                ))}
                <SelectItem value="create_new" className="font-semibold">
                  + Uusi käyttötapaus
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedUseCaseId && (
            <Link
              href={`/organizations/${id}/use_cases/${selectedUseCaseId}`}
              className={cn(navButtonClass(true), "admin-open-link hidden lg:inline-flex")}
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
            <DropdownMenuContent
              className={cn(
                "admin-settings-menu",
                adminTheme === "dark" && "admin-settings-menu--dark"
              )}
            >
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

              {selectedUseCaseId && (
                <DropdownMenuItem asChild>
                  <Link href={`${orgRootPath}/usage`}>
                    <ChartColumn className="mr-2 h-4 w-4 text-slate-500" />
                    {messages.admin.usageStats}
                  </Link>
                </DropdownMenuItem>
              )}

              {selectedUseCaseId && (
                <DropdownMenuItem asChild>
                  <Link href={`${orgRootPath}/runs`}>
                    <ScrollText className="mr-2 h-4 w-4 text-slate-500" />
                    {messages.admin.logs}
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

      <CreateUseCaseDialog
        organizationId={id}
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
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
