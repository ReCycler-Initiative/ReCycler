"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUseCase } from "@/services/api";
import { NewUseCase } from "@/types";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import FormInput from "@/components/form/form-input";
import { FormTextArea } from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateUseCaseDialogProps {
  organizationId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUseCaseDialog({
  organizationId,
  isOpen,
  onOpenChange,
}: CreateUseCaseDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof NewUseCase>>({
    resolver: zodResolver(NewUseCase),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof NewUseCase>) =>
      createUseCase(organizationId, data),
    onSuccess: (newUseCase) => {
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["use_cases", organizationId],
      });

      // Close dialog
      onOpenChange(false);
      form.reset();

      // Navigate to the new use case
      router.push(
        `/admin/organizations/${organizationId}/use_cases/${newUseCase.id}`
      );
    },
    onError: (error) => {
      console.error("Failed to create use case:", error);
      form.setError("root", {
        message: "Käyttötapauksen luominen epäonnistui. Yritä uudelleen.",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof NewUseCase>) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Uusi käyttötapaus</DialogTitle>
          <DialogDescription>
            Luo uusi käyttötapaus organisaatiolle. Voit muokata tietoja
            myöhemmin.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              name="name"
              label="Nimi"
              rules={{
                required: "Nimi on pakollinen",
              }}
            />

            <FormTextArea
              name="description"
              label="Kuvaus"
              rules={{
                required: "Kuvaus on pakollinen",
              }}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-red-600">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Peruuta
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Luodaan..." : "Luo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
