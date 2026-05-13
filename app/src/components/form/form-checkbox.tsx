import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { FormInputProps } from "./types";

const FormCheckbox = ({
  className,
  label,
  name,
  showLabel = true,
}: FormInputProps) => {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn("flex items-center gap-2 space-y-0", className)}
        >
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormLabel className={cn({ "sr-only": !showLabel })}>
            {label}
          </FormLabel>
        </FormItem>
      )}
    />
  );
};

export default FormCheckbox;
