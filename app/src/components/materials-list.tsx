"use client";

import { useState } from "react";
import db from "@/services/db";

export type Material = {
  id?: number;
  code: number;
  name: string;
  contents?: string | null;
};

interface Props {
  page?: number;
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

  // 👇 Tästä alkaa mockup-editoinnin logiikka
  return <EditableMaterialsList initialMaterials={current} title={title} page={page} total={materials.length} pageCount={pageCount} />;
}

function EditableMaterialsList({
  initialMaterials,
  title,
  page,
  total,
  pageCount,
}: {
  initialMaterials: Material[];
  title?: string;
  page: number;
  total: number;
  pageCount: number;
}) {
  const [materials, setMaterials] = useState(initialMaterials);
  const [editing, setEditing] = useState(false);

  const handleChange = (index: number, newName: string) => {
    const updated = [...materials];
    updated[index].name = newName;
    setMaterials(updated);
  };

  return (
    <div>
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}

      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setEditing(!editing)}
          className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
        >
          {editing ? "Lopeta muokkaus" : "Muokkaa listaa"}
        </button>
        {editing && <span className="text-xs text-gray-500">Mockup-editointi – ei tallenna tietokantaan</span>}
      </div>

      <ul className="list-disc ml-5 columns-1 md:columns-2 text-sm">
        {materials.map((m, i) => (
          <li key={m.code || m.id} className="break-inside-avoid mb-1">
            {editing ? (
              <input
                type="text"
                value={m.name}
                onChange={(e) => handleChange(i, e.target.value)}
                className="border rounded px-1 py-0.5 w-full"
              />
            ) : (
              m.name
            )}
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
          <div className="text-xs text-gray-500 ml-2">
            Näytetään {materials.length} / {total}
          </div>
        </div>
      )}
    </div>
  );
}