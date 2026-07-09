"use client";

import { PageIntro } from "@/components/admin/page-intro";
import { PageTemplate } from "@/components/admin/page-template";
import { PageLoadingSpinner } from "@/components/page-loading-spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createObject, getObject, updateObject } from "@/services/api";
import { useMessages } from "@/i18n/locale-provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import ObjectEditor from "../_components/object-editor";
import { toApiData } from "../_components/object-form";

const ObjectLayout = ({ children }: { children: ReactNode }) => {
  const messages = useMessages();
  const {
    objectId,
    id: organizationId,
    useCaseId,
  } = useParams<{
    objectId: string;
    id: string;
    useCaseId: string;
  }>();

  const router = useRouter();
  const pathname = usePathname();
  const baseObjectsPath = `/admin/organizations/${organizationId}/use_cases/${useCaseId}/objects`;
  const basePath = `${baseObjectsPath}/${objectId}`;

  const tabs = [
    {
      value: "edit",
      label: messages.adminObjectsPage.tabInfo,
      href: `${basePath}/edit`,
    },
    {
      value: "fields",
      label: messages.adminObjectsPage.tabFields,
      href: `${basePath}/fields`,
    },
  ];

  const activeTab =
    tabs.find((tab) => pathname.startsWith(tab.href))?.value ?? tabs[0].value;

  const { data, isLoading } = useQuery({
    queryKey: [organizationId, useCaseId, objectId],
    queryFn: () => getObject(organizationId, useCaseId, objectId),
    enabled:
      !!organizationId && !!useCaseId && !!objectId && objectId !== "new",
  });

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <PageTemplate>
      <PageIntro
        title={messages.adminObjectsPage.title}
        description={messages.adminObjectsPage.description}
        onBack={() => router.push(baseObjectsPath)}
      />
      <ObjectEditor
        defaultValues={data && "id" in data ? data : { name: "", fields: [] }}
        mutation={async (organizationId, useCaseId, values) => {
          if (objectId === "new") {
            return await createObject(
              organizationId,
              useCaseId,
              toApiData(values)
            );
          }
          return await updateObject(
            organizationId,
            useCaseId,
            data?.id!,
            toApiData(values)
          );
        }}
      >
        <Tabs value={activeTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} asChild>
                <Link href={tab.href}>{tab.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {children}
      </ObjectEditor>
    </PageTemplate>
  );
};

export default ObjectLayout;
