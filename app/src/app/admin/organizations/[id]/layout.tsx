import TitleBar from "@/components/title-bar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <div className="flex ml-8">
          <div className="flex items-center">
            <Label className="mr-4">Use case</Label>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Recycler</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <nav className="[&>a]:inline-block [&>a]:py-3 [&>a]:px-4 ml-4">
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
