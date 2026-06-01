"use client";

import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/locale-provider";
import { getOrganizationById } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

const ThankYou = () => {
  const messages = useMessages();
  const params = useParams();
  const organizationId = params.id as string;

  const {
    data: organization,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => getOrganizationById(organizationId),
  });

  return (
    <LoadingState isLoading={isLoading} error={isError || !organization}>
      {organization && (
        <div className="flex-1 bg-white">
          <h1 className="text-2xl text-center py-6 border-b bg-gray-50 text-primary">
            {messages.wizard.organizationCreated.replace("{name}", organization.name)}
          </h1>
          <Button asChild className="mx-auto flex w-fit mt-6">
            <Link href={`/admin/organizations/${organization.id}`}>
              {messages.wizard.goToOrganizationHome}
            </Link>
          </Button>
        </div>
      )}
    </LoadingState>
  );
};

export default ThankYou;
