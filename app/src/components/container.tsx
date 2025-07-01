import { cn } from "@/utils/shadcn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const Container = ({ children, className }: ContainerProps) => (
  <div className={cn("container py-6", className)}>{children}</div>
);

export default Container;
