import { PageTemplate } from "@/components/admin/page-template";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";
import { toast } from "sonner";

type UseEditorProps<ApiData, FormData> = {
  defaultValues: DefaultValues<FormData>;
  queryFn: () => Promise<ApiData>;
  queryKey: unknown[];
  mutationFn: (data: ApiData) => Promise<ApiData>;
  toFormState: (data: ApiData) => FormData;
  toApiData: (data: FormData) => ApiData;
};

type UseEditorReturn<ApiData, FormData extends FieldValues> = {
  form: ReturnType<typeof useForm<FormData>>;
  query: ReturnType<typeof useQuery<ApiData>>;
  mutation: ReturnType<typeof useMutation<ApiData, Error, FormData>>;
};

export const useEditor = <ApiData, FormData extends FieldValues>({
  defaultValues,
  queryKey,
  queryFn,
  mutationFn,
  toApiData,
  toFormState,
}: UseEditorProps<ApiData, FormData>): UseEditorReturn<ApiData, FormData> => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn,
  });

  const mutation = useMutation<ApiData, Error, FormData>({
    mutationFn: (data) => mutationFn(toApiData(data)),
    onSuccess: (data) => {
      toast.success("Save successful");
      form.reset(toFormState(data));
      queryClient.setQueryData(queryKey, data);
    },
    onError: () => {
      toast.error("Save failed");
    },
  });

  const form = useForm<FormData>({
    defaultValues,
    values: query.data ? toFormState(query.data) : undefined,
  });

  return { form, query, mutation };
};

export const EditorTemplate = <ApiData, FormData extends FieldValues>({
  children,
  form,
  query,
  mutation,
}: { children: ReactNode } & UseEditorReturn<ApiData, FormData>) => {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutateAsync(values))}
        className="space-y-4"
      >
        <PageTemplate title="Organization Information">
          <LoadingState isLoading={query.isLoading} error={!!query.error}>
            {children}
            <hr />
            <Button
              className="sm:w-fit ml-auto"
              disabled={!form.formState.isDirty}
              isLoading={form.formState.isSubmitting}
              type="submit"
            >
              Save
            </Button>
          </LoadingState>
        </PageTemplate>
      </form>
    </Form>
  );
};
