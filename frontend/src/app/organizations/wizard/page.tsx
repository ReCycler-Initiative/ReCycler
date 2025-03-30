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

type StepProps = {
  children: React.ReactNode;
  title: string;
};

function Step({ children, title }: StepProps) {
  return (
    <div className="p-10 mx-auto w-full max-w-xl">
      <h1 className="text-3xl mb-6">{title}</h1>
      {children}
    </div>
  );
}

type StepActionsProps = {
  children: React.ReactNode;
};

function StepActions({ children }: StepActionsProps) {
  return <div className="pt-6 flex justify-end">{children}</div>;
}

type StepNextProps = {
  children?: string;
};

function StepNext({ children }: StepNextProps) {
  return <Button type="submit">{children ?? "Jatka"}</Button>;
}

type StepFormProps<T extends FieldValues> = {
  children: React.ReactNode;
  form: UseFormReturn<T, any, undefined>;
  onStepChange: (values: T) => void;
};

function StepForm<T extends FieldValues>({
  children,
  form,
  onStepChange,
}: StepFormProps<T>) {
  return (
    <Form {...form}>
      <form
        className="contents"
        onSubmit={form.handleSubmit((values) => {
          onStepChange(values);
        })}
      >
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

const WelcomeStep = ({ onStepChange }: { onStepChange: () => void }) => {
  const form = useForm();

  return (
    <Step title="Tervetuloa">
      <StepForm form={form} onStepChange={onStepChange}>
        <p>
          Tämän vaiheittaisen opastuksen avulla voit luoda oman tilin ja
          määritellä, millaisia tietoja haluat tallentaa eri kohteista.
          Aloitetaan ensimmäisestä vaiheesta klikkaamalla {'"Aloitetaan"'}.
        </p>
        <StepActions>
          <StepNext>Aloita</StepNext>
        </StepActions>
      </StepForm>
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
    <StepForm form={form} onStepChange={onStepChange}>
      <Step title="Organisaatio">
        <FormInput
          label="Nimi"
          name="name"
          rules={{ required: "Nimi on pakollinen" }}
        />
        <StepActions>
          <StepNext />
        </StepActions>
      </Step>
    </StepForm>
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
    <StepForm form={form} onStepChange={() => undefined}>
      <Step title="Kohteen kentät">
        <StepActions>
          <StepNext />
        </StepActions>
      </Step>
    </StepForm>
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
