"use client";

import { MaterialsPageContent } from "@/components/materials-page";
import { useParams } from "next/navigation";

const MaterialsPage = () => {
  const { organizationId, useCaseId } = useParams<{
    organizationId: string;
    useCaseId: string;
  }>();
  return (
    <MaterialsPageContent
      organizationId={organizationId}
      useCaseId={useCaseId}
    />
  );
};

export default MaterialsPage;
