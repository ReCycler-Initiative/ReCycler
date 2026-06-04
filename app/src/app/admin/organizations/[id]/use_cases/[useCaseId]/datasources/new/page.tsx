"use client";

import { DataSourceEditor } from "@/components/admin/datasource-editor";
import { PageTemplate } from "@/components/admin/page-template";
import { useMessages } from "@/i18n/locale-provider";
import { useRouter, useParams } from "next/navigation";

const NewDataSourcePage = () => {
  const params = useParams<{ id: string; useCaseId: string }>();
  const router = useRouter();
  const messages = useMessages();
  const datasourcesHref = `/admin/organizations/${params.id}/use_cases/${params.useCaseId}/datasources`;

  return (
    <PageTemplate title={messages.adminDatasourcePage.newTitle}>
      <DataSourceEditor
        organizationId={params.id}
        useCaseId={params.useCaseId}
        cancelHref={datasourcesHref}
        onSaved={() =>
          router.push(datasourcesHref)
        }
      />
    </PageTemplate>
  );
};

export default NewDataSourcePage;
