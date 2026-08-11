"use client";

import { PageIntro } from "@/components/admin/page-intro";
import { PageTemplate } from "@/components/admin/page-template";
import { PageLoadingSpinner } from "@/components/page-loading-spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createLocationType, getLocationType, updateLocationType } from "@/services/api";
import { useMessages } from "@/i18n/locale-provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import LocationTypeEditor from "../_components/location-type-editor";
import { toApiData } from "../_components/location-type-form";

const LocationTypeLayout = ({ children }: { children: ReactNode }) => {
  const messages = useMessages();
  const {
    locationTypeId,
    id: organizationId,
    useCaseId,
  } = useParams<{
    locationTypeId: string;
    id: string;
    useCaseId: string;
  }>();

  const router = useRouter();
  const pathname = usePathname();
  const baseLocationTypesPath = `/admin/organizations/${organizationId}/use_cases/${useCaseId}/location-types`;
  const basePath = `${baseLocationTypesPath}/${locationTypeId}`;

  const tabs = [
    {
      value: "edit",
      label: messages.adminLocationTypesPage.edit,
      href: `${basePath}/edit`,
    },
    {
      value: "fields",
      label: messages.adminLocationTypesPage.fields,
      href: `${basePath}/fields`,
    },
  ];

  const activeTab =
    tabs.find((tab) => pathname.startsWith(tab.href))?.value ?? tabs[0].value;

  const { data, isLoading } = useQuery({
    queryKey: [organizationId, useCaseId, locationTypeId],
    queryFn: () => getLocationType(organizationId, useCaseId, locationTypeId),
    enabled:
      !!organizationId && !!useCaseId && !!locationTypeId && locationTypeId !== "new",
  });

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <PageTemplate>
      <PageIntro
        title={messages.adminLocationTypesListPage.title}
        description={messages.adminLocationTypesListPage.description}
        onBack={() => router.push(baseLocationTypesPath)}
      />
      <LocationTypeEditor
        defaultValues={data && "id" in data ? data : { name: "", fields: [] }}
        mutation={async (organizationId, useCaseId, values) => {
          if (locationTypeId === "new") {
            return await createLocationType(
              organizationId,
              useCaseId,
              toApiData(values)
            );
          }
          return await updateLocationType(
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
      </LocationTypeEditor>
    </PageTemplate>
  );
};

export default LocationTypeLayout;
