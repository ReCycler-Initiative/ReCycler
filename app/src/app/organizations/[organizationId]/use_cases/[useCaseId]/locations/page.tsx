"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LocationsPage() {
  const router = useRouter();
  const params = useParams<{ organizationId: string; useCaseId: string }>();

  useEffect(() => {
    if (!params?.organizationId || !params?.useCaseId) return;
    router.replace(
      `/organizations/${params.organizationId}/use_cases/${params.useCaseId}/results`
    );
  }, [params?.organizationId, params?.useCaseId, router]);

  return null;
}
