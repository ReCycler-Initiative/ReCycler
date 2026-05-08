"use client";

import { EditorTemplate, useEditor } from "@/components/editor-template";
import FormInput from "@/components/form/form-input";
import { useMessages } from "@/i18n/locale-provider";
import { getOrganizationById, updateOrganization } from "@/services/api";
import { Organization } from "@/types";
import { useParams } from "next/navigation";
import { z } from "zod";

const GeneralInfoPage = () => {
  const messages = useMessages();
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
    <EditorTemplate {...editor} title={messages.adminGeneralInfo.title}>
      <div className="my-2 max-w-xl">
        <FormInput label={messages.adminGeneralInfo.nameLabel} name="name" />
      </div>
    </EditorTemplate>
  );
};
export default GeneralInfoPage;
