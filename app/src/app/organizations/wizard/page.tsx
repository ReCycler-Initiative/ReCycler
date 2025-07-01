"use client";

import FormInput from "@/components/form/form-input";
import FormSelect from "@/components/form/form-select";
import { FormTextArea } from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { createOrganization } from "@/services/api";
import { CreateOrganizationRequest, NewUseCase, Organization } from "@/types";
import { PlusIcon, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import Step from "./step";

type TCreateOrganizationRequest = z.infer<typeof CreateOrganizationRequest>;

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
      nextText="Aloita"
      onNext={onNext}
      onStepChange={onStepChange}
      title="Tervetuloa"
    >
      <p>
        Tämän vaiheittaisen opastuksen avulla voit luoda oman tilin ja
        määritellä, millaisia tietoja haluat tallentaa eri kohteista. Aloitetaan
        ensimmäisestä vaiheesta klikkaamalla {'"Aloita"'}.
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
  onStepChange: (values: TCreateOrganizationRequest["organization"]) => void;
  values: TCreateOrganizationRequest["organization"];
}) => {
  const form = useForm<TCreateOrganizationRequest["organization"]>({
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

type UseCaseFormState = z.infer<typeof NewUseCase>;

const UseCase = ({
  onNext,
  onPrevious,
  onStepChange,
  values,
}: {
  onStepChange: (values: UseCaseFormState) => void;
  onNext: () => void;
  onPrevious: () => void;
  values: UseCaseFormState;
}) => {
  const form = useForm<UseCaseFormState>({
    defaultValues: values,
  });

  return (
    <Step
      form={form}
      onNext={onNext}
      onPrevious={onPrevious}
      onStepChange={onStepChange}
      title="Käyttötapaus"
    >
      <FormTextArea
        label="Kuvaus"
        name="description"
        rules={{
          required: "Käyttötapaus on pakollinen",
        }}
      />
    </Step>
  );
};

type LocationFieldsFormState = {
  fields: TCreateOrganizationRequest["fields"];
};

const LocationFieldsModel = ({
  onNext,
  onPrevious,
  onStepChange,
  values,
}: {
  onStepChange: (values: LocationFieldsFormState) => void;
  onNext: () => void;
  onPrevious: () => void;
  values: TCreateOrganizationRequest["fields"];
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
      onStepChange={onStepChange}
      title="Kohteesta kerättävät tiedot"
    >
      <div className="flex flex-col gap-6">
        {fieldsArray.fields.map((field, index) => (
          <div key={field.id} className="flex flex-row gap-4 items-end">
            <FormInput
              className="flex-2"
              label="Nimi"
              name={`fields.${index}.name`}
              rules={{ required: "Kenttä on pakollinen" }}
              showLabel={index === 0}
            />
            <FormSelect
              className="flex-1"
              label="Kentän tyyppi"
              items={["mutliselect", "text_input"].map((item) => ({
                value: item,
                label: item,
              }))}
              name={`fields.${index}.field_type`}
              rules={{ required: "Tyyppi on pakollinen" }}
              showLabel={index === 0}
            />
            <FormSelect
              className="flex-1"
              label="Sisällön tyyppi"
              items={["string", "number", "boolean", "array"].map((item) => ({
                value: item,
                label: item,
              }))}
              name={`fields.${index}.data_type`}
              rules={{ required: "Tyyppi on pakollinen" }}
              showLabel={index === 0}
            />
            <Button
              onClick={() => fieldsArray.remove(index)}
              size="icon"
              variant="destructive"
            >
              <span className="sr-only">Poista</span>
              <Trash size="16" />
            </Button>
          </div>
        ))}

        <Button
          className="w-fit"
          onClick={() =>
            fieldsArray.append({
              name: "",
              data_type: "string",
              field_type: "text_input",
              order: fieldsArray.fields.length,
            })
          }
        >
          Lisää kenttä <PlusIcon />
        </Button>
      </div>
    </Step>
  );
};

const SummaryStep = ({
  onPrevious,
  onNext,
  values,
}: {
  onNext: (organization: z.infer<typeof Organization>) => void;
  onPrevious: () => void;
  values: TCreateOrganizationRequest;
}) => {
  const form = useForm<TCreateOrganizationRequest>({
    defaultValues: values,
  });

  return (
    <Step
      form={form}
      onNext={async (values) => {
        const { organization } = await createOrganization(values);
        onNext(organization);
      }}
      onPrevious={onPrevious}
      onStepChange={() => undefined}
      nextText="Lähetä"
      title="Yhteenveto"
    >
      <div className="flex flex-col gap-y-6">
        <div>
          <h2 className="text-xl mb-4">Organisaatio</h2>
          <dl>
            <dt className="font-bold">Nimi</dt>
            <dd className="mb-4">{values.organization.name}</dd>
          </dl>
        </div>
        <div>
          <h2 className="text-xl mb-4">Käyttötapaus</h2>
          <dl>
            <dt className="font-bold">Kuvaus</dt>
            <dd className="mb-4">{values.useCase.description}</dd>
          </dl>
        </div>
        <div>
          <h2 className="text-xl mb-4">Kohteesta kerättävät tiedot</h2>
          <div className="grid grid-cols-3 grap-y-4 [&>div]:px-4 [&>div]:py-2">
            <div className="grid grid-cols-subgrid col-span-3 bg-primary text-white">
              <div>Nimi</div>
              <div>Data tyyppi</div>
              <div>Kentän tyyppi</div>
            </div>
            {values.fields.map((field) => (
              <div
                key={field.name}
                className="grid grid-cols-subgrid col-span-3 even:bg-gray-100"
              >
                <div>{field.name}</div>
                <div>{field.data_type}</div>
                <div>{field.field_type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Step>
  );
};

const Wizard = () => {
  const router = useRouter();
  const [step, setStep] = useState("step1");
  const [fullState, setFullState] = useState<TCreateOrganizationRequest>({
    organization: {
      name: "",
    },
    fields: [],
    useCase: {
      description: "",
    },
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
        onStepChange={(values) => {
          setFullState((prev) => ({
            ...prev,
            organization: values,
          }));
          setStep("step3");
        }}
        values={fullState.organization}
      />
    );
  }

  if (step === "step3") {
    return (
      <UseCase
        onNext={() => setStep("step4")}
        onPrevious={() => setStep("step2")}
        onStepChange={(values) => {
          setFullState((prev) => ({
            ...prev,
            useCase: values,
          }));
        }}
        values={fullState.useCase}
      />
    );
  }

  if (step === "step4") {
    return (
      <LocationFieldsModel
        onNext={() => setStep("step5")}
        onPrevious={() => setStep("step3")}
        onStepChange={(values) => {
          setFullState((prev) => ({
            ...prev,
            fields: values.fields,
          }));
        }}
        values={fullState.fields}
      />
    );
  }

  return (
    <SummaryStep
      onNext={(organization) =>
        router.push(`wizard/thankyou/${organization.id}`)
      }
      onPrevious={() => setStep("step3")}
      values={fullState}
    />
  );
};

export default Wizard;
