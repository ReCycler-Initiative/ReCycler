"use client";

import FormInput from "@/components/form/form-input";
import FormSelect from "@/components/form/form-select";
import { FormTextArea } from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/locale-provider";
import { createOrganization } from "@/services/api";
import {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  NewUseCase,
} from "@/types";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
  const messages = useMessages();
  const form = useForm();

  return (
    <Step
      form={form}
      nextText={messages.wizard.start}
      onNext={onNext}
      onStepChange={onStepChange}
      title={messages.wizard.welcomeTitle}
    >
      <p>{messages.wizard.welcomeBody}</p>
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
  const messages = useMessages();
  const form = useForm<TCreateOrganizationRequest["organization"]>({
    defaultValues: values,
  });

  return (
    <Step
      form={form}
      onNext={onNext}
      onPrevious={onPrevious}
      onStepChange={onStepChange}
      title={messages.wizard.organizationTitle}
    >
      <FormInput
        label={messages.wizard.nameLabel}
        name="name"
        rules={{ required: messages.wizard.nameRequired }}
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
  const messages = useMessages();
  const form = useForm<UseCaseFormState>({
    defaultValues: values,
  });

  return (
    <Step
      form={form}
      onNext={onNext}
      onPrevious={onPrevious}
      onStepChange={onStepChange}
      title={messages.wizard.useCaseTitle}
    >
      <div className="flex flex-col gap-6">
        <FormInput
          label={messages.wizard.nameLabel}
          name="name"
          rules={{
            required: messages.wizard.nameRequired,
          }}
        />
        <FormTextArea
          label={messages.wizard.descriptionLabel}
          name="description"
          rules={{
            required: messages.wizard.descriptionRequired,
          }}
        />
      </div>
    </Step>
  );
};



const SummaryStep = ({
  onPrevious,
  onNext,
  values,
}: {
  onNext: (result: z.infer<typeof CreateOrganizationResponse>) => void;
  onPrevious: () => void;
  values: TCreateOrganizationRequest;
}) => {
  const messages = useMessages();
  const form = useForm<TCreateOrganizationRequest>({
    defaultValues: values,
  });

  return (
    <Step
      form={form}
      onNext={async (values) => {
        const result = await createOrganization(values);
        onNext(result);
      }}
      onPrevious={onPrevious}
      onStepChange={() => undefined}
      nextText={messages.wizard.submit}
      title={messages.wizard.summaryTitle}
    >
      <div className="flex flex-col gap-y-6">
        <div>
          <h2 className="text-xl mb-4">{messages.wizard.organizationSectionTitle}</h2>
          <dl>
            <dt className="font-bold">{messages.wizard.nameLabel}</dt>
            <dd className="mb-4">{values.organization.name}</dd>
          </dl>
        </div>
        <div>
          <h2 className="text-xl mb-4">{messages.wizard.useCaseSectionTitle}</h2>
          <dl>
            <dt className="font-bold">{messages.wizard.descriptionLabel}</dt>
            <dd className="mb-4">{values.useCase.description}</dd>
          </dl>
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
    useCase: {
      name: "",
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

  return (
    <SummaryStep
      onNext={(result) => {
        router.push(`wizard/thankyou/${result.organization.id}`);
      }}
      onPrevious={() => setStep("step3")}
      values={fullState}
    />
  );
};

export default Wizard;
