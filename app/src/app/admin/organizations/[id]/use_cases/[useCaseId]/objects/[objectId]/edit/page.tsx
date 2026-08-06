"use client";

import { useFormContext } from "react-hook-form";
import {
  ObjectFormFields,
  ObjectFormValues,
} from "../../_components/object-form";

export default function EditObjectPage() {
  const form = useFormContext<ObjectFormValues>();

  return <ObjectFormFields form={form} />;
}
