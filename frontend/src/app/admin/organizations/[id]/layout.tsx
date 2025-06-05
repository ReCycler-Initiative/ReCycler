import TitleBar from "@/components/title-bar";
import Link from "next/link";

const AdminLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return (
    <div className="flex flex-col h-full">
      <TitleBar toHomeHref={`/admin/organizations/${id}`}>
        <Link href={`${id}/general_info`}>General Info</Link>
      </TitleBar>
      <main className="flex-1 flex flex-col bg-gray-100">{children}</main>
    </div>
  );
};

export default AdminLayout;
