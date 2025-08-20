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
import { getUseCases } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const AdminLayout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) => {
  const { id } = useParams<{ id: string }>();
  const useCasesQuery = useQuery({
    queryKey: ["use_cases", id],
    queryFn: () => getUseCases(id),
  });

  return (
    <div className="flex flex-col h-full">
      <TitleBar toHomeHref={`/admin/organizations/${id}`}>
        <div className="flex flex-1">
          <nav className="[&>a]:inline-block [&>a]:py-3 [&>a]:px-4 ml-4">
            <Link href={`/admin/organizations/${id}/locations`}>Locations</Link>
          </nav>
          <div className="flex items-center ml-auto mr-2">
            <Label className="mr-4">Use case</Label>
            <Select value={useCasesQuery.data?.[0]?.id}>
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
              <MenuIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={`/admin/organizations/${id}/general_info`}>
                  Organization Info
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TitleBar>
      <main className="flex-1 flex flex-col bg-gray-100">{children}</main>
    </div>
  );
};

export default AdminLayout;
