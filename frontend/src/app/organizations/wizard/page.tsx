"use client";

import FormInput from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LocationProperties, Organization } from "@/types";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type TOrganization = z.infer<typeof Organization>;

type FullState = {
  fields: Field[];
  organization: TOrganization;
};

const OrganizationStep = ({
  onNext,
  values,
}: {
  onNext: (values: TOrganization) => void;
  values: TOrganization;
}) => {
  const form = useForm<TOrganization>({
    defaultValues: values,
  });

  return (
    <Form {...form}>
      <form
        className="p-10 mx-auto w-full max-w-xl"
        onSubmit={form.handleSubmit((values) => {
          onNext(values);
        })}
      >
        <FormInput
          label="Nimi"
          name="name"
          rules={{ required: "Nimi on pakollinen" }}
        />
        <div className="pt-6 flex justify-end">
          <Button>Seuraava</Button>
        </div>
      </form>
    </Form>
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
        onNext={() => {
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
