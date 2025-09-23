"use client";

import { PageTemplate } from "@/components/admin/page-template";
import FormInput from "@/components/form/form-input";
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
        <div className="my-2">
          <FormInput label="Name" name="name" />
        </div>
        <Button disabled={!form.formState.isDirty}>Save</Button>
      </PageTemplate>
    </Form>
  );
};
export default GeneralInfoPage;
