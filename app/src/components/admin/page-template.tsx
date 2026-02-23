import Container from "@/components/container";
import { cn } from "@/lib/utils";

export const PageTemplate = ({
  actions,
  children,
  fullscreen = false,
  title,
}: {
  actions?: React.ReactNode;
  children?: React.ReactNode;
  fullscreen?: boolean;
  title?: string;
}) => {
  const Wrapper = fullscreen ? "div" : Container;

  return (
    <div
      className={cn("flex flex-1 flex-col", fullscreen && "overflow-hidden")}
    >
      {title && (
        <Wrapper className={cn("flex-none py-6 px-4", fullscreen && "w-full")}>
          <div className="flex justify-between">
            <h1 className="min-h-10 flex items-center text-2xl font-bold">
              {title}
            </h1>
            {actions && <div>{actions}</div>}
          </div>
        </Wrapper>
      )}
      <Wrapper
        className={cn(
          fullscreen
            ? "flex flex-1 flex-col overflow-hidden px-4"
            : "flex flex-col gap-6 px-4 pb-6"
        )}
      >
        {children}
      </Wrapper>
    </div>
  );
};
