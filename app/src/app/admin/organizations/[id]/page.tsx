"use client";

import { PageLoadingSpinner } from "@/components/page-loading-spinner";
import { getDeletedUseCases, getUseCases } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function AdminHomePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const useCasesQuery = useQuery({
    queryKey: ["use_cases", id],
    queryFn: () => getUseCases(id),
  });
  const deletedUseCasesQuery = useQuery({
    queryKey: ["deleted_use_cases", id],
    queryFn: () => getDeletedUseCases(id),
  });

  useEffect(() => {
    if (useCasesQuery.data?.length) {
      router.push(
        `/admin/organizations/${id}/use_cases/${useCasesQuery.data[0].id}`
      );
      return;
    }

    if (useCasesQuery.isSuccess && deletedUseCasesQuery.data?.length) {
      router.push(`/admin/organizations/${id}/use_cases/trash`);
    }
  }, [
    deletedUseCasesQuery.data,
    id,
    router,
    useCasesQuery.data,
    useCasesQuery.isSuccess,
  ]);

  return <PageLoadingSpinner />;
}
