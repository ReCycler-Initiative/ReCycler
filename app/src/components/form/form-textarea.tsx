"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FormInputProps } from "./types";

type FormTextAreaProps = {
  label: string;
  textareaClassName?: string;
};

export function FormTextArea({
  className,
  label,
  name,
  rules,
  textareaClassName,
}: FormInputProps & FormTextAreaProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="mb-2">{label}</FormLabel>
          <FormControl>
            <Textarea className={cn("resize-none", textareaClassName)} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
      rules={rules}
    />
  );
}
