"use client";

import { getUseCases } from "@/services/api";
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

  useEffect(() => {
    if (useCasesQuery.data?.length) {
      router.push(
        `/admin/organizations/${id}/use_cases/${useCasesQuery.data[0].id}`
      );
    }
  }, [router, id, useCasesQuery.data]);

  return null; // tai loading spinner
}
