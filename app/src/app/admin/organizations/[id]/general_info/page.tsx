"use client";

import { EditorTemplate, useEditor } from "@/components/editor";
import FormInput from "@/components/form/form-input";
import { getOrganizationById, updateOrganization } from "@/services/api";
import { Organization } from "@/types";
import { useParams } from "next/navigation";
import { z } from "zod";

const GeneralInfoPage = () => {
  const { id } = useParams<{ id: string }>();

  const editor = useEditor<
    z.infer<typeof Organization>,
    z.infer<typeof Organization>
  >({
    defaultValues: {
      name: "",
    },
    queryKey: ["organization", id],
    queryFn: () => getOrganizationById(id),
    mutationFn: (data) => updateOrganization(data),
    toFormState: Organization.parse,
    toApiData: Organization.parse,
  });

  return (
    <EditorTemplate {...editor}>
      <div className="my-2 max-w-xl">
        <FormInput label="Name" name="name" />
      </div>
    </EditorTemplate>
  );
};
export default GeneralInfoPage;
