"use client";

import { PageTemplate } from "@/components/admin/page-template";
import FormInput from "@/components/form/form-input";
import LoadingSpinner from "@/components/loading-spinner";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { getOrganizationById } from "@/services/api";
import { Organization } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const GeneralInfoPage = () => {
  const { id } = useParams<{ id: string }>();

  const query = useQuery({
    queryKey: ["organization", id],
    queryFn: () => getOrganizationById(id),
  });

  const form = useForm<z.infer<typeof Organization>>({
    defaultValues: {
      name: "",
    },
    values: query.data,
  });

  return (
    <Form {...form}>
      <PageTemplate title="Organization Information">
        <LoadingState isLoading={query.isLoading} error={!!query.error}>
          <div className="my-2 max-w-xl">
            <FormInput label="Name" name="name" />
          </div>
          <hr />
          <Button
            className="sm:w-fit ml-auto"
            disabled={!form.formState.isDirty}
          >
            Save
          </Button>
        </LoadingState>
      </PageTemplate>
    </Form>
  );
};
export default GeneralInfoPage;
