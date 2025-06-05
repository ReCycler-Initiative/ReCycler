import TitleBar from "@/components/title-bar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col h-full">
    <TitleBar />
    <main className="flex-1 flex flex-col bg-gray-100">{children}</main>
  </div>
);

export default AdminLayout;
