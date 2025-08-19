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
        <div className="ml-8">
          <nav className="[&>a]:inline-block [&>a]:py-3 [&>a]:px-4">
            <Link href={`/admin/organizations/${id}/general_info`}>
              General Info
            </Link>
            <Link href={`/admin/organizations/${id}/locations`}>Locations</Link>
          </nav>
        </div>
      </TitleBar>
      <main className="flex-1 flex flex-col bg-gray-100">{children}</main>
    </div>
  );
};

export default AdminLayout;
