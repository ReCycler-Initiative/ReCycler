import Container from "@/components/container";

export const PageTemplate = ({
  children,
  actions,
  title,
}: {
  actions?: React.ReactNode;
  children?: React.ReactNode;
  title: string;
}) => (
  <Container className="flex flex-col gap-6 py-6 px-4">
    <div className="flex justify-between">
      <h1 className="min-h-10 flex items-center text-2xl font-bold">{title}</h1>
      {actions && <div className="">{actions}</div>}
    </div>
    {children}
  </Container>
);
