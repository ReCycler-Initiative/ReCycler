"use client";

import FormInput from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LocationProperties, Organization } from "@/types";
import { PlusIcon } from "lucide-react";
import { createContext, useContext, useState } from "react";
import {
  FieldValues,
  useFieldArray,
  useForm,
  useFormContext,
  UseFormReturn,
} from "react-hook-form";
import { z } from "zod";

type StepActionsContextProps = {
  onNext?: () => void;
  onPrevious?: () => void;
  onStepChange: (values: any) => void;
};

const StepActionsContext = createContext<StepActionsContextProps>({
  onStepChange: () => {},
});

type StepActionsProps = {
  children: React.ReactNode;
};

function StepActions({ children }: StepActionsProps) {
  return (
    <div className="py-16 flex flex-row-reverse justify-between">
      {children}
    </div>
  );
}

type StepNextProps = {
  children?: string;
};

function StepNext({ children }: StepNextProps) {
  return (
    <Button className="w-full max-w-40" type="submit" size="lg">
      {children ?? "Jatka"}
    </Button>
  );
}

function StepPrevious() {
  const { onPrevious, onStepChange } = useContext(StepActionsContext);
  const form = useFormContext();

  return (
    <Button
      className="w-full max-w-40"
      onClick={() => {
        onStepChange(form.getValues());
        onPrevious?.();
      }}
      variant="outline"
      size="lg"
    >
      Takaisin
    </Button>
  );
}

type StepProps<T extends FieldValues> = {
  children: React.ReactNode;
  form: UseFormReturn<T, any, undefined>;
  onNext?: () => void;
  onPrevious?: () => void;
  onStepChange: (values: T) => void;
  title: string;
};

function Step<T extends FieldValues>({
  children,
  form,
  onNext,
  onPrevious,
  onStepChange,
  title,
}: StepProps<T>) {
  return (
    <StepActionsContext.Provider value={{ onNext, onPrevious, onStepChange }}>
      <Form {...form}>
        <form
          className="flex-1 bg-white"
          onSubmit={form.handleSubmit((values) => {
            onStepChange(values);
            onNext?.();
          })}
        >
          <h1 className="text-2xl text-center py-6 border-b bg-gray-50 text-primary">
            {title}
          </h1>
          <div className="py-12">
            <div className="mx-auto max-w-xl">
              {children}
              <StepActions>
                {onNext && <StepNext />}
                {onPrevious && <StepPrevious />}
              </StepActions>
            </div>
          </div>
        </form>
      </Form>
    </StepActionsContext.Provider>
  );
}

type TOrganization = z.infer<typeof Organization>;

type FullState = {
  fields: Field[];
  organization: TOrganization;
};

const WelcomeStep = ({
  onNext,
  onStepChange,
}: {
  onNext: () => void;
  onStepChange: () => void;
}) => {
  const form = useForm();

  return (
    <Step
      form={form}
      onNext={onNext}
      onStepChange={onStepChange}
      title="Tervetuloa"
    >
      <p>
        Tämän vaiheittaisen opastuksen avulla voit luoda oman tilin ja
        määritellä, millaisia tietoja haluat tallentaa eri kohteista. Aloitetaan
        ensimmäisestä vaiheesta klikkaamalla {'"Aloitetaan"'}.
      </p>
    </Step>
  );
};

const OrganizationStep = ({
  onStepChange,
  onPrevious,
  onNext,
  values,
}: {
  onNext: () => void;
  onPrevious: () => void;
  onStepChange: (values: TOrganization) => void;
  values: TOrganization;
}) => {
  const form = useForm<TOrganization>({
    defaultValues: values,
  });

  return (
    <Step
      form={form}
      onNext={onNext}
      onPrevious={onPrevious}
      onStepChange={onStepChange}
      title="Organisaatio"
    >
      <FormInput
        label="Nimi"
        name="name"
        rules={{ required: "Nimi on pakollinen" }}
      />
    </Step>
  );
};

type Field = z.infer<typeof LocationProperties>;

type LocationFieldsFormState = {
  fields: Field[];
};

const LocationFieldsModel = ({
  onNext,
  onPrevious,
  values,
}: {
  onNext: () => void;
  onPrevious: () => void;
  values: Field[];
}) => {
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
    <Step
      form={form}
      onNext={onNext}
      onPrevious={onPrevious}
      onStepChange={() => undefined}
      title="Kohteesta kerättävät tiedot"
    >
      <Button>
        Lisää kenttä <PlusIcon />
      </Button>
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
    return (
      <WelcomeStep
        onNext={() => setStep("step2")}
        onStepChange={() => undefined}
      />
    );
  }

  if (step === "step2") {
    return (
      <OrganizationStep
        onNext={() => setStep("step3")}
        onPrevious={() => setStep("step1")}
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

  return (
    <LocationFieldsModel
      onNext={() => undefined}
      onPrevious={() => setStep("step2")}
      values={fullState.fields}
    />
  );
};

export default Wizard;
