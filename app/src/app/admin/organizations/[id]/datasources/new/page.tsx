"use client";

import { DataSourceEditor } from "@/components/admin/datasource-editor";
import { PageTemplate } from "@/components/admin/page-template";

const NewDataSourcePage = () => {
  return (
    <PageTemplate title="Uusi datalähde">
      <DataSourceEditor />
    </PageTemplate>
  );
};

export default NewDataSourcePage;
