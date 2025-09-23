import { cn } from "@/lib/utils";
import {
  useFormContext
} from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { FormInputProps } from "./types";

const FormInput = ({
  className,
  label,
  rules,
  name,
  showLabel = true,
}: FormInputProps) => {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={cn("mb-2", { "sr-only": !showLabel })}>
            {label}
          </FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ""} />
          </FormControl>
          {/* <FormDescription>This is your public display name.</FormDescription>
        <FormMessage /> */}
        </FormItem>
      )}
      rules={rules}
    />
  );
};

export default FormInput;
