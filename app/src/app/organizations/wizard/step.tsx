import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { createContext, useContext } from "react";
import { FieldValues, useFormContext, UseFormReturn } from "react-hook-form";

type StepActionsContextProps = {
  onNext?: (value: any) => void;
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
  form: UseFormReturn<T, any>;
  nextText?: string;
  onNext?: (value: T) => Promise<void> | void;
  onPrevious?: () => void;
  onStepChange: (values: T) => void;
  title: string;
};

function Step<T extends FieldValues>({
  children,
  form,
  nextText,
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
          onSubmit={form.handleSubmit(async (values) => {
            onStepChange(values);
            await onNext?.(values);
          })}
        >
          <h1 className="text-2xl text-center py-6 border-b bg-gray-50 text-primary">
            {title}
          </h1>
          <div className="py-12">
            <div className="mx-auto max-w-4xl">
              {children}
              <StepActions>
                {onNext && <StepNext>{nextText}</StepNext>}
                {onPrevious && <StepPrevious />}
              </StepActions>
            </div>
          </div>
        </form>
      </Form>
    </StepActionsContext.Provider>
  );
}

export default Step;
