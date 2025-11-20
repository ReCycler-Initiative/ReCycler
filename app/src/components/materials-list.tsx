import db from "@/services/db";

export type Material = {
  id?: number;
  code: number;
  name: string;
  contents?: string | null;
};

interface Props {
  page?: number; // 1 or 2 when >30 materials
  title?: string;
}

export default async function MaterialsList({ page = 1, title }: Props) {
  // Fetch materials from DB (server-side)
  const materials: Material[] = await db("recycler.materials").orderBy("name");

  if (!materials || materials.length === 0) {
    return <div className="text-sm text-gray-500">Ei materiaaleja.</div>;
  }

  let pages: Material[][] = [materials];
  let pageCount = 1;

  if (materials.length > 30) {
    pageCount = 2;
    const half = Math.ceil(materials.length / 2);
    pages = [materials.slice(0, half), materials.slice(half)];
  }

  const current = pages[Math.max(0, Math.min(pageCount - 1, page - 1))] || pages[0];

  return (
    <div>
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}

      <ul className="list-disc ml-5 columns-1 md:columns-2 text-sm">
        {current.map((m) => (
          <li key={m.code || m.id} className="break-inside-avoid">
            {m.name}
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <div className="mt-3 flex items-center gap-3">
          <a
            className={`px-3 py-1 rounded border ${page === 1 ? "bg-gray-200" : "bg-white"}`}
            href={`?materialsPage=1`}
          >
            1
          </a>
          <a
            className={`px-3 py-1 rounded border ${page === 2 ? "bg-gray-200" : "bg-white"}`}
            href={`?materialsPage=2`}
          >
            2
          </a>
          <div className="text-xs text-gray-500 ml-2">Näytetään {current.length} / {materials.length}</div>
        </div>
      )}
    </div>
  );
}
