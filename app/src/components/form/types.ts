import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

export type FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  className?: string;
  label: string;
  showLabel?: boolean;
} & Omit<ControllerProps<TFieldValues, TName>, "render">;
