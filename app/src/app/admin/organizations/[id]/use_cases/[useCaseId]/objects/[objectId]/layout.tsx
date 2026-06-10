"use client";

import { PageIntro } from "@/components/admin/page-intro";
import { PageTemplate } from "@/components/admin/page-template";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ReactNode } from "react";

const ObjectLayout = ({ children }: { children: ReactNode }) => {
  const {
    objectId,
    id: organizationId,
    useCaseId,
  } = useParams<{
    objectId: string;
    id: string;
    useCaseId: string;
  }>();

  const pathname = usePathname();
  const basePath = `/admin/organizations/${organizationId}/use_cases/${useCaseId}/objects/${objectId}`;

  const tabs = [
    { value: "edit", label: "Tiedot", href: `${basePath}/edit` },
    { value: "fields", label: "Kentät", href: `${basePath}/fields` },
  ];

  const activeTab =
    tabs.find((tab) => pathname.startsWith(tab.href))?.value ?? tabs[0].value;

  return (
    <PageTemplate>
      <PageIntro title="Sisältömalli" description="Sisältömallin tiedot" />
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
    </PageTemplate>
  );
};

export default ObjectLayout;
