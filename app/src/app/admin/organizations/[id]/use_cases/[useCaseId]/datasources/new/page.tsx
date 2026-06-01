"use client";

import { DataSourceEditor } from "@/components/admin/datasource-editor";
import { PageTemplate } from "@/components/admin/page-template";
import { useRouter, useParams } from "next/navigation";

const NewDataSourcePage = () => {
  const params = useParams<{ id: string; useCaseId: string }>();
  const router = useRouter();

  return (
    <PageTemplate title="Uusi datalähde">
      <DataSourceEditor
        organizationId={params.id}
        useCaseId={params.useCaseId}
        onSaved={() =>
          router.push(
            `/admin/organizations/${params.id}/use_cases/${params.useCaseId}/datasources`
          )
        }
      />
    </PageTemplate>
  );
};

export default NewDataSourcePage;
