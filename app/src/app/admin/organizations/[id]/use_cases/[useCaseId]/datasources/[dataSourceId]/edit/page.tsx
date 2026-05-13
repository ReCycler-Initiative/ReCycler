"use client";

import { DataSourceEditor } from "@/components/admin/datasource-editor";
import { PageTemplate } from "@/components/admin/page-template";
import { useParams, useRouter } from "next/navigation";

const EditDataSourcePage = () => {
  const params = useParams<{
    id: string;
    useCaseId: string;
    dataSourceId: string;
  }>();
  const router = useRouter();

  return (
    <PageTemplate title="Muokkaa datalähdettä">
      <DataSourceEditor
        organizationId={params.id}
        useCaseId={params.useCaseId}
        datasourceId={params.dataSourceId}
        onSaved={() =>
          router.push(
            `/admin/organizations/${params.id}/use_cases/${params.useCaseId}/datasources`
          )
        }
      />
    </PageTemplate>
  );
};

export default EditDataSourcePage;
