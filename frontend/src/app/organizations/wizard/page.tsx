"use client";

import FormInput from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LocationProperties, Organization } from "@/types";
import { useState } from "react";
import {
  DefaultValues,
  FieldValues,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { z } from "zod";

type StepProps<T extends FieldValues> = {
  children: React.ReactNode;
  onStepChange: (values: T) => void;
  title: string;
  values: DefaultValues<T>;
};

function Step<T extends FieldValues>({
  children,
  onStepChange,
  title,
  values,
}: StepProps<T>) {
  const form = useForm<T>({
    defaultValues: values,
  });

  return (
    <Form {...form}>
      <form
        className="p-10 mx-auto w-full max-w-xl"
        onSubmit={form.handleSubmit((values) => {
          onStepChange(values);
        })}
      >
        <h1 className="mb-6">{title}</h1>
        {children}
      </form>
    </Form>
  );
}

type TOrganization = z.infer<typeof Organization>;

type FullState = {
  fields: Field[];
  organization: TOrganization;
};

const OrganizationStep = ({
  onStepChange,
  values,
}: {
  onStepChange: (values: TOrganization) => void;
  values: TOrganization;
}) => {
  const form = useForm<TOrganization>({
    defaultValues: values,
  });

  return (
    <Step onStepChange={onStepChange} title="Organisaatio" values={values}>
      <FormInput
        label="Nimi"
        name="name"
        rules={{ required: "Nimi on pakollinen" }}
      />
      <div className="pt-6 flex justify-end">
        <Button>Seuraava</Button>
      </div>
    </Step>
  );
};

type Field = z.infer<typeof LocationProperties>;

type LocationFieldsFormState = {
  fields: Field[];
};

const LocationFieldsModel = ({ values }: { values: Field[] }) => {
  const form = useForm<LocationFieldsFormState>({
    defaultValues: {
      fields: values,
    },
  });

  const fieldsArray = useFieldArray({
    control: form.control,
    name: "fields",
  });

  return (
    <div className="p-10 mx-auto w-full max-w-xl">
      <Form {...form}>
        <div className="pt-6 flex justify-end">
          <Button type="submit">Seuraava</Button>
        </div>
      </Form>
    </div>
  );
};

const Wizard = () => {
  const [step, setStep] = useState("step1");
  const [fullState, setFullState] = useState<FullState>({
    organization: {
      name: "",
    },
    fields: [],
  });

  if (step === "step1") {
    return (
      <OrganizationStep
        onStepChange={() => {
          setFullState((prev) => ({
            ...prev,
            organization: {
              ...prev.organization,
            },
          }));
          setStep("step2");
        }}
        values={fullState.organization}
      />
    );
  }

  return <LocationFieldsModel values={fullState.fields} />;
};

export default Wizard;
