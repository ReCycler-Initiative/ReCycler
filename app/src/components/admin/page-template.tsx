import Container from "@/components/container";

export const PageTemplate = ({
  children,
  title,
}: {
  children?: React.ReactNode;
  title: string;
}) => (
  <Container className="flex flex-col gap-4 py-6 px-4">
    <h1 className="text-2xl font-bold">{title}</h1>
    {children}
  </Container>
);
