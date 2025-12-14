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
import { SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Content = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams<{ id: string }>();
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<
    string | undefined
  >();

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

  return (
    <div className="flex flex-col h-full">
      <TitleBar
        logo={<p className="ml-2 font-bold">{organizationQuery.data?.name}</p>}
        toHomeHref={`/admin/organizations/${id}`}
      >
        <div className="flex flex-1">
          <nav className="[&>a]:inline-block [&>a]:py-3 [&>a]:px-4 ml-4">
            <Link href={`/admin/organizations/${id}/datasources`}>Datalähteet</Link>
            <Link href={`/admin/organizations/${id}/locations`}>Sijainnit</Link>
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
                <Link href={`/admin/organizations/${id}/general_info`}>
                  Organisaation tiedot
                </Link>
              </DropdownMenuItem>
              {selectedUseCaseId && (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/organizations/${id}/use_cases/${selectedUseCaseId}`}
                  >
                    Käyttötapauksen tiedot
                  </Link>
                </DropdownMenuItem>
              )}
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
        // For 404, 500 and other errors, redirect to 404 page
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
