import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-8 py-2",
        sm: "h-9 rounded-md px-7",
        lg: "h-11 rounded-md px-12",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = ({
  ref,
  className,
  isLoading,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps & {
  ref?: React.RefObject<HTMLButtonElement>;
}) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size, className }),
        "group data-[loading=true]:text-transparent relative"
      )}
      ref={ref}
      data-loading={isLoading}
      disabled={isLoading || props.disabled}
      type={props.type || "button"}
      {...props}
    >
      <Slottable>{props.children}</Slottable>
      <Loader2Icon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden animate-spin group-data-[loading=true]:block" />
      <span className="sr-only">Loading...</span>
    </Comp>
  );
};
Button.displayName = "Button";

export { Button, buttonVariants };
