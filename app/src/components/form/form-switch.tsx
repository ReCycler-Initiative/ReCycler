import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Switch } from "../ui/switch";
import { FormInputProps } from "./types";

/**
 * FormSwitch – a labelled toggle switch bound to react-hook-form.
 *
 * Renders the label on the left and the toggle on the right, inside a
 * rounded card row so it's easy to scan and visually distinct from plain
 * text inputs.
 */
const FormSwitch = ({
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
          className={cn(
            "flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 space-y-0",
            className
          )}
        >
          <FormLabel
            className={cn(
              "cursor-pointer text-sm font-normal leading-tight text-gray-700",
              { "sr-only": !showLabel }
            )}
          >
            {label}
          </FormLabel>
          <FormControl>
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default FormSwitch;
