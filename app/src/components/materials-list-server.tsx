import { cookies } from "next/headers";
import MaterialsList, { Material } from "@/components/materials-list";
import db from "@/services/db";
import {
  getMessages,
} from "@/i18n/messages";
import { LOCALE_COOKIE_NAME, resolveLocale } from "@/i18n/locale-config";

interface Props {
  page?: number;
  title?: string;
}

export default async function MaterialsListServer({ page = 1, title }: Props) {
  const materials: Material[] = await db("recycler.materials").orderBy("name");
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  const messages = getMessages(locale);

  if (!materials || materials.length === 0) {
    return <div className="text-sm text-gray-500">{messages.materialsList.noMaterials}</div>;
  }

  let pages: Material[][] = [materials];
  let pageCount = 1;

  if (materials.length > 30) {
    pageCount = 2;
    const half = Math.ceil(materials.length / 2);
    pages = [materials.slice(0, half), materials.slice(half)];
  }

  const current =
    pages[Math.max(0, Math.min(pageCount - 1, page - 1))] || pages[0];

  return (
    <MaterialsList
      initialMaterials={current}
      title={title}
      page={page}
      total={materials.length}
      pageCount={pageCount}
    />
  );
}