import Container from "@/components/container";
import { cn } from "@/lib/utils";

export const PageTemplate = ({
  actions,
  children,
  mode = "default",
  title,
}: {
  actions?: React.ReactNode;
  children?: React.ReactNode;
  mode?: "default" | "fullScreen";
  title?: string;
}) => {
  const Wrapper = mode === "fullScreen" ? "div" : Container;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        mode === "fullScreen" && "overflow-hidden"
      )}
    >
      {title && (
        <Wrapper
          className={cn(
            "flex-none py-6 px-4",
            mode === "fullScreen" && "w-full"
          )}
        >
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
          { "flex flex-col gap-6 px-4 pb-6": mode === "default" },
          {
            "flex flex-1 flex-col overflow-hidden px-4": mode === "fullScreen",
          }
        )}
      >
        {children}
      </Wrapper>
    </div>
  );
};
