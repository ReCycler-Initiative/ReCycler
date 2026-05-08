"use client";

import { DataSourceEditor } from "@/components/admin/datasource-editor";
import { PageTemplate } from "@/components/admin/page-template";
import { useMessages } from "@/i18n/locale-provider";

const NewDataSourcePage = () => {
  const messages = useMessages();

  return (
    <PageTemplate title={messages.adminDatasourcePage.newTitle}>
      <DataSourceEditor />
    </PageTemplate>
  );
};

export default NewDataSourcePage;
