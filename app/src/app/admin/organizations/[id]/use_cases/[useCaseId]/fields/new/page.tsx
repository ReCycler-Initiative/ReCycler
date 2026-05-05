"use client";

import { PageTemplate } from "@/components/admin/page-template";
import { createField } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FieldFormContent,
  FieldFormValues,
  toApiData,
  useFieldForm,
} from "../_components/field-form";

export default function NewFieldPage() {
  const { id: organizationId, useCaseId } = useParams<{
    id: string;
    useCaseId: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const backHref = `/admin/organizations/${organizationId}/use_cases/${useCaseId}/fields`;

  const form = useFieldForm();

  const mutation = useMutation({
    mutationFn: (values: FieldFormValues) =>
      createField(organizationId, useCaseId, toApiData(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fields", organizationId, useCaseId],
      });
      toast.success("Kenttä luotu");
      router.push(backHref);
    },
    onError: () => toast.error("Tallennus epäonnistui"),
  });

  return (
    <PageTemplate title="Uusi kenttä">
      <FieldFormContent
        form={form}
        backHref={backHref}
        isPending={mutation.isPending}
        onSubmit={(values) => mutation.mutate(values)}
      />
    </PageTemplate>
  );
}
