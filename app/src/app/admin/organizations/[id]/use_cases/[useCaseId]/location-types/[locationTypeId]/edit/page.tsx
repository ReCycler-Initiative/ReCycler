"use client";

import { useFormContext } from "react-hook-form";
import {
  LocationTypeFormFields,
  LocationTypeFormValues,
} from "../../_components/location-type-form";

export default function EditLocationTypePage() {
  const form = useFormContext<LocationTypeFormValues>();

  return <LocationTypeFormFields form={form} />;
}
