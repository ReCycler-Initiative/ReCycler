"use client";

import FormInput from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LocationProperties, Organization } from "@/types";
import { useState } from "react";
import {
  FieldValues,
  useFieldArray,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { z } from "zod";

type StepActionsProps = {
  children: React.ReactNode;
};

function StepActions({ children }: StepActionsProps) {
  return <div className="py-16 flex justify-end">{children}</div>;
}

type StepNextProps = {
  children?: string;
};

function StepNext({ children }: StepNextProps) {
  return (
    <Button type="submit" size="lg">
      {children ?? "Jatka"}
    </Button>
  );
}

type StepProps<T extends FieldValues> = {
  children: React.ReactNode;
  form: UseFormReturn<T, any, undefined>;
  onStepChange: (values: T) => void;
  title: string;
};

function Step<T extends FieldValues>({
  children,
  form,
  onStepChange,
  title,
}: StepProps<T>) {
  return (
    <Form {...form}>
      <form
        className="flex-1 bg-white"
        onSubmit={form.handleSubmit((values) => {
          onStepChange(values);
        })}
      >
        <h1 className="text-2xl text-center py-6 border-b bg-gray-50 text-primary">
          {title}
        </h1>
        <div className="py-12">
          <div className="mx-auto max-w-xl">{children}</div>
        </div>
      </form>
    </Form>
  );
}

type TOrganization = z.infer<typeof Organization>;

type FullState = {
  fields: Field[];
  organization: TOrganization;
};

const WelcomeStep = ({ onStepChange }: { onStepChange: () => void }) => {
  const form = useForm();

  return (
    <Step form={form} onStepChange={onStepChange} title="Tervetuloa">
      <p>
        Tämän vaiheittaisen opastuksen avulla voit luoda oman tilin ja
        määritellä, millaisia tietoja haluat tallentaa eri kohteista. Aloitetaan
        ensimmäisestä vaiheesta klikkaamalla {'"Aloitetaan"'}.
      </p>
      <StepActions>
        <StepNext>Aloita</StepNext>
      </StepActions>
    </Step>
  );
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
    <Step form={form} onStepChange={onStepChange} title="Organisaatio">
      <FormInput
        label="Nimi"
        name="name"
        rules={{ required: "Nimi on pakollinen" }}
      />
      <StepActions>
        <StepNext />
      </StepActions>
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
    <Step form={form} onStepChange={() => undefined} title="Kohteen kentät">
      <StepActions>
        <StepNext />
      </StepActions>
    </Step>
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
    return <WelcomeStep onStepChange={() => setStep("step2")} />;
  }

  if (step === "step2") {
    return (
      <OrganizationStep
        onStepChange={() => {
          setFullState((prev) => ({
            ...prev,
            organization: {
              ...prev.organization,
            },
          }));
          setStep("step3");
        }}
        values={fullState.organization}
      />
    );
  }

  return <LocationFieldsModel values={fullState.fields} />;
};

export default Wizard;
