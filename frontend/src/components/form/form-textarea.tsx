"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormInputProps } from "./types";

type FormTextAreaProps = {
  label: string;
};

export function FormTextArea({ label, rules }: FormInputProps) {
  return (
    <FormField
      name="bio"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea className="resize-none" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
      rules={rules}
    />
  );
}
