"use client";

import TitleBar from "@/components/title-bar";
import AdminThemeToggle from "@/components/admin/admin-theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Code2,
  Database,
  ExternalLink,
  MapPin,
  Moon,
  ScrollText,
  SettingsIcon,
  Sun,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageLoadingSpinner } from "@/components/page-loading-spinner";
import { useMessages } from "@/i18n/locale-provider";
import { LucideIcon } from "lucide-react";
import { CreateUseCaseDialog } from "@/components/dialogs/create-use-case-dialog";
import Image from "next/image";

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
  selectedUseCaseId?: string;
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
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [desktopHeaderFits, setDesktopHeaderFits] = useState(false);
  const headerContentRef = useRef<HTMLDivElement | null>(null);
  const navMeasureRef = useRef<HTMLDivElement | null>(null);
  const controlsMeasureRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem("recycler-admin-theme", adminTheme);
    } catch {
      // Ignore storage failures so the page still works.
    }
  }, [adminTheme]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const syncViewport = (matches: boolean) => {
      setIsDesktopViewport(matches);
      if (matches) {
        setIsMobileNavOpen(false);
      }
    };

    syncViewport(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => syncViewport(event.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, []);

  const useCasesQuery = useQuery({
    queryKey: ["use_cases", id],
    queryFn: () => getUseCases(id),
  });

  const fallbackUseCaseId =
    selectedUseCaseId && useCasesQuery.data?.some((useCase) => useCase.id === selectedUseCaseId)
      ? selectedUseCaseId
      : useCasesQuery.data?.[0]?.id;
  const selectedUseCasePath = fallbackUseCaseId
    ? `/admin/organizations/${id}/use_cases/${fallbackUseCaseId}`
    : null;
  const trashPath = `/admin/organizations/${id}/use_cases/trash`;
  const selectedUseCase = useCasesQuery.data?.find(
    (useCase) => useCase.id === selectedUseCaseId
  );

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

  const navLinks: NavLink[] = useMemo(
    () =>
      selectedUseCasePath
        ? [
            {
              exact: true,
              href: selectedUseCasePath,
              label: messages.admin.overview,
              icon: AppWindow,
            },
            {
              href: `${selectedUseCasePath}/location-types`,
              label: messages.admin.fields,
              icon: Blocks,
            },
            {
              href: `${selectedUseCasePath}/datasources`,
              label: messages.admin.datasources,
              icon: Database,
            },
            {
              href: `${selectedUseCasePath}/locations`,
              label: messages.admin.locations,
              icon: MapPin,
            },
            { href: `${selectedUseCasePath}/ai`, label: messages.admin.ai, icon: Bot },
          ]
        : [],
    [
      messages.admin.ai,
      messages.admin.datasources,
      messages.admin.fields,
      messages.admin.locations,
      messages.admin.overview,
      selectedUseCasePath,
    ]
  );

  useEffect(() => {
    if (!isDesktopViewport) {
      setDesktopHeaderFits(false);
      return;
    }

    const measureLayout = () => {
      const headerContent = headerContentRef.current;
      const navMeasure = navMeasureRef.current;
      const controlsMeasure = controlsMeasureRef.current;

      if (!headerContent || !navMeasure || !controlsMeasure) {
        return;
      }

      const availableWidth = headerContent.clientWidth;
      const requiredWidth = navMeasure.scrollWidth + controlsMeasure.scrollWidth + 24;

      setDesktopHeaderFits(requiredWidth <= availableWidth);
    };

    measureLayout();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measureLayout);
      return () => window.removeEventListener("resize", measureLayout);
    }

    const observer = new ResizeObserver(measureLayout);

    if (headerContentRef.current) {
      observer.observe(headerContentRef.current);
    }
    if (navMeasureRef.current) {
      observer.observe(navMeasureRef.current);
    }
    if (controlsMeasureRef.current) {
      observer.observe(controlsMeasureRef.current);
    }

    return () => observer.disconnect();
  }, [isDesktopViewport, navLinks, pathname, selectedUseCaseId, useCasesQuery.data]);

  const showDesktopHeader = isDesktopViewport && desktopHeaderFits;
  const showDropdownHeader = !showDesktopHeader;

  const handleUseCaseSelect = (value: string) => {
    if (value === "create_new") {
      setIsCreateDialogOpen(true);
      setIsMobileNavOpen(false);
      return;
    }

    router.push(`/admin/organizations/${id}/use_cases/${value}`);
    setIsMobileNavOpen(false);
  };

  return (
    <div
      className="admin-shell flex flex-col h-full bg-white text-slate-950"
      data-admin-theme={adminTheme}
    >
      <TitleBar
        logo={
          selectedUseCase?.logo_url ? (
            <Image
              src={selectedUseCase.logo_url}
              alt={selectedUseCase.name}
              width={150}
              height={40}
              className="h-10 w-auto max-w-[150px] object-contain object-left"
              unoptimized
            />
          ) : (
            <span className="ml-2 whitespace-nowrap font-bold">
              {selectedUseCase?.name ?? organization.name}
            </span>
          )
        }
        toHomeHref="/"
      >
        <div
          ref={headerContentRef}
          className="relative flex h-full min-w-0 flex-1 items-center gap-x-2 lg:gap-x-4 overflow-hidden"
        >
          {isDesktopViewport && (
            <div
              className="pointer-events-none absolute left-0 top-0 -z-10 opacity-0"
              aria-hidden="true"
            >
              <div className="flex items-center">
                <div ref={navMeasureRef} className="flex h-10 items-center gap-1 pr-2">
                  {navLinks.map((link) => (
                    <div key={`${link.href}-measure`} className={navButtonClass(false)}>
                      {link.icon && <link.icon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />}
                      <span>{link.label}</span>
                    </div>
                  ))}
                </div>
                <div ref={controlsMeasureRef} className="ml-4 flex items-center gap-x-4">
                  <div className="mr-1 flex shrink-0 items-center lg:mr-2">
                    <Label className="admin-usecase-label mr-2 hidden items-center gap-2 font-normal text-gray-700 md:mr-4 md:inline-flex">
                      <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
                      {messages.admin.useCaseLabel}
                    </Label>
                    <div className="admin-usecase-select inline-flex h-10 w-[200px] items-center rounded-md border px-3 text-sm">
                      {selectedUseCase?.name ?? ""}
                    </div>
                  </div>
                  {selectedUseCaseId && (
                    <div className={cn(navButtonClass(true), "admin-open-link")}>
                      {messages.admin.open}
                    </div>
                  )}
                  <div className="h-10 w-10" />
                  <div className="h-10 w-10" />
                </div>
              </div>
            </div>
          )}

          {showDropdownHeader && (
            <DropdownMenu open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full px-3 py-2 text-slate-700 transition hover:bg-gray-100 hover:text-slate-900">
                <Menu className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={cn(
                  "admin-settings-menu",
                  adminTheme === "dark" && "admin-settings-menu--dark"
                )}
                align="start"
              >
                <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {messages.admin.organizationLabel}
                </DropdownMenuLabel>
                <div className="px-3 pb-2 text-sm font-medium text-slate-900">
                  {organization.name}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {messages.admin.useCaseLabel}
                </DropdownMenuLabel>
                {useCasesQuery.data?.map((useCase) => (
                  <DropdownMenuItem
                    key={useCase.id}
                    onSelect={() => handleUseCaseSelect(useCase.id)}
                  >
                    <BriefcaseBusiness className="mr-2 h-4 w-4 text-slate-500" />
                    {useCase.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onSelect={() => handleUseCaseSelect("create_new")}>
                  <BriefcaseBusiness className="mr-2 h-4 w-4 text-slate-500" />
                  + Uusi käyttötapaus
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {navLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} onClick={() => setIsMobileNavOpen(false)}>
                      {link.icon && <link.icon className="mr-2 h-4 w-4 text-slate-500" />}
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
                <DropdownMenuSeparator />
                {selectedUseCasePath && (
                  <DropdownMenuItem asChild>
                    <Link href={`${selectedUseCasePath}/general_info`} onClick={() => setIsMobileNavOpen(false)}>
                      <AppWindow className="mr-2 h-4 w-4 text-slate-500" />
                      {messages.admin.organizationDetails}
                    </Link>
                  </DropdownMenuItem>
                )}
                {selectedUseCaseId && (
                  <DropdownMenuItem asChild>
                    <Link href={`${selectedUseCasePath}/edit`} onClick={() => setIsMobileNavOpen(false)}>
                      <BriefcaseBusiness className="mr-2 h-4 w-4 text-slate-500" />
                      {messages.admin.useCaseDetails}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={trashPath} onClick={() => setIsMobileNavOpen(false)}>
                    <Trash2 className="mr-2 h-4 w-4 text-slate-500" />
                    {messages.admin.trash}
                  </Link>
                </DropdownMenuItem>
                {selectedUseCaseId && (
                  <DropdownMenuItem asChild>
                    <Link href={`${selectedUseCasePath}/usage`} onClick={() => setIsMobileNavOpen(false)}>
                      <ChartColumn className="mr-2 h-4 w-4 text-slate-500" />
                      {messages.admin.usageStats}
                    </Link>
                  </DropdownMenuItem>
                )}
                {selectedUseCaseId && (
                  <DropdownMenuItem asChild>
                    <Link href={`${selectedUseCasePath}/runs`} onClick={() => setIsMobileNavOpen(false)}>
                      <ScrollText className="mr-2 h-4 w-4 text-slate-500" />
                      {messages.admin.logs}
                    </Link>
                  </DropdownMenuItem>
                )}
                {selectedUseCaseId && (
                  <DropdownMenuItem asChild>
                    <Link href={`${selectedUseCasePath}/api`} onClick={() => setIsMobileNavOpen(false)}>
                      <Code2 className="mr-2 h-4 w-4 text-slate-500" />
                      {messages.admin.apiDocumentation}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setAdminTheme((t) => (t === "dark" ? "light" : "dark"));
                  }}
                >
                  {adminTheme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4 text-slate-500" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4 text-slate-500" />
                  )}
                  {adminTheme === "dark" ? messages.admin.useLightTheme : messages.admin.useDarkTheme}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showDesktopHeader && (
            <>
              <nav className="ml-2 hidden h-10 min-w-0 flex-1 items-center gap-1 pr-2 lg:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={navButtonClass(isActiveSection(link.href, link.exact))}
                  >
                    {link.icon && <link.icon className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="ml-auto hidden shrink-0 items-center gap-x-2 lg:flex lg:gap-x-4">
                <div className="mr-1 flex shrink-0 items-center lg:mr-2">
                  <Label className="admin-usecase-label mr-2 hidden items-center gap-2 font-normal text-gray-700 md:mr-4 md:inline-flex">
                    <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
                    {messages.admin.useCaseLabel}
                  </Label>
                  <Select value={selectedUseCaseId || ""} onValueChange={handleUseCaseSelect}>
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
                  <DropdownMenuContent
                    className={cn(
                      "admin-settings-menu",
                      adminTheme === "dark" && "admin-settings-menu--dark"
                    )}
                  >
                    {selectedUseCasePath && (
                      <DropdownMenuItem asChild>
                        <Link href={`${selectedUseCasePath}/general_info`}>
                          <AppWindow className="mr-2 h-4 w-4 text-slate-500" />
                          {messages.admin.organizationDetails}
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {selectedUseCaseId && (
                      <DropdownMenuItem asChild>
                        <Link href={`${selectedUseCasePath}/edit`}>
                          <BriefcaseBusiness className="mr-2 h-4 w-4 text-slate-500" />
                          {messages.admin.useCaseDetails}
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href={trashPath}>
                        <Trash2 className="mr-2 h-4 w-4 text-slate-500" />
                        {messages.admin.trash}
                      </Link>
                    </DropdownMenuItem>

                    {selectedUseCaseId && (
                      <DropdownMenuItem asChild>
                        <Link href={`${selectedUseCasePath}/usage`}>
                          <ChartColumn className="mr-2 h-4 w-4 text-slate-500" />
                          {messages.admin.usageStats}
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {selectedUseCaseId && (
                      <DropdownMenuItem asChild>
                        <Link href={`${selectedUseCasePath}/runs`}>
                          <ScrollText className="mr-2 h-4 w-4 text-slate-500" />
                          {messages.admin.logs}
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {selectedUseCaseId && (
                      <DropdownMenuItem asChild>
                        <Link href={`${selectedUseCasePath}/api`}>
                          <Code2 className="mr-2 h-4 w-4 text-slate-500" />
                          {messages.admin.apiDocumentation}
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
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
