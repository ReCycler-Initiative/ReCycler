import { PageTemplate } from "@/components/admin/page-template";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useMessages } from "@/i18n/locale-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageIntro } from "@/components/admin/page-intro";

// ---------- FormFooter ----------

export const FormFooter = ({
  isSubmitting,
  isDirty,
  onCancel,
  cancelHref,
  cancelButtonClassName,
  saveButtonClassName,
  showDivider = true,
  onSubmit,
}: {
  isSubmitting: boolean;
  isDirty: boolean;
  onCancel?: () => void;
  cancelHref?: string;
  cancelButtonClassName?: string;
  saveButtonClassName?: string;
  showDivider?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
}) => {
  const messages = useMessages();

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    onSubmit?.(e as any);
  };

  return (
    <>
      {showDivider ? <hr /> : null}
      <div className="flex justify-between items-center">
        {onCancel ? (
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className={cancelButtonClassName}
          >
            {messages.editor.cancel}
          </Button>
        ) : cancelHref ? (
          <Button variant="outline" asChild className={cancelButtonClassName}>
            <Link href={cancelHref}>{messages.editor.cancel}</Link>
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="submit"
          className={`sm:w-fit ml-auto ${saveButtonClassName ?? ""}`.trim()}
          disabled={!isDirty}
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          {messages.editor.save}
        </Button>
      </div>
    </>
  );
};

// ---------- FormShell ----------
// Wraps children in <Form> context + <form> tag without any page layout.
// Use inside dialogs or anywhere PageTemplate would be redundant.

export const FormShell = <FormData extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: {
  form: ReturnType<typeof useForm<FormData>>;
  onSubmit: (values: FormData) => void;
  children: ReactNode;
  className?: string;
}) => (
  <Form {...form}>
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={className ?? "space-y-6 max-w-xl"}
    >
      {children}
    </form>
  </Form>
);

// ---------- useEditor ----------

type UseEditorProps<ApiData, FormData> = {
  defaultValues: DefaultValues<FormData>;
  queryFn?: () => Promise<ApiData>;
  queryKey: unknown[];
  mutationFn: (data: ApiData) => Promise<ApiData>;
  toFormState?: (data: ApiData) => FormData;
  toApiData: (data: FormData) => ApiData;
  onSuccess?: () => void;
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
  onSuccess,
}: UseEditorProps<ApiData, FormData>): UseEditorReturn<ApiData, FormData> => {
  const queryClient = useQueryClient();
  const messages = useMessages();

  const query = useQuery({
    queryKey,
    queryFn: queryFn ?? (() => Promise.resolve(undefined as ApiData)),
    enabled: !!queryFn,
  });

  const mutation = useMutation<ApiData, Error, FormData>({
    mutationFn: (data) => mutationFn(toApiData(data)),
    onSuccess: (data) => {
      toast.success(messages.editor.saveSuccessful);
      if (toFormState) {
        form.reset(toFormState(data));
        queryClient.setQueryData(queryKey, data);
      }
      onSuccess?.();
    },
    onError: () => {
      toast.error(messages.editor.saveFailed);
    },
  });

  const form = useForm<FormData>({
    defaultValues,
    values: query.data && toFormState ? toFormState(query.data) : undefined,
  });

  return { form, query, mutation };
};

export const EditorTemplate = <ApiData, FormData extends FieldValues>({
  children,
  form,
  query,
  mutation,
}: {
  children: ReactNode;
} & UseEditorReturn<ApiData, FormData>) => {
  const handleSubmit = form.handleSubmit((values) =>
    mutation.mutateAsync(values)
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <LoadingState isLoading={query.isLoading} error={!!query.error}>
          {children}
          <FormFooter
            isSubmitting={form.formState.isSubmitting}
            isDirty={form.formState.isDirty}
            onSubmit={handleSubmit}
          />
        </LoadingState>
      </form>
    </Form>
  );
};
