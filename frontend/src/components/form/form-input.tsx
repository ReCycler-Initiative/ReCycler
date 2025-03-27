import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";

type FormInputProps = {
  label: string;
  name: string;
};

const FormInput = ({ label, name }: FormInputProps) => {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          {/* <FormDescription>This is your public display name.</FormDescription>
        <FormMessage /> */}
        </FormItem>
      )}
    />
  );
};

export default FormInput;
