import TitleBar from "@/components/title-bar";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <TitleBar />
    <main className="flex-1 flex flex-col bg-gray-100">{children}</main>
  </>
);

export default OrganizationLayout;
