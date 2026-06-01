"use client";

import { useState } from "react";
import { useMessages } from "@/i18n/locale-provider";

export type Material = {
  id?: number;
  code: number;
  name: string;
  contents?: string | null;
};

interface Props {
  initialMaterials: Material[];
  page?: number;
  title?: string;
  total: number;
  pageCount: number;
}

export default function MaterialsList({
  initialMaterials,
  title,
  page = 1,
  total,
  pageCount,
}: Props) {
  const messages = useMessages();
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
          {editing ? messages.materialsList.stopEditing : messages.materialsList.editList}
        </button>
        {editing && <span className="text-xs text-gray-500">{messages.materialsList.mockupEditing}</span>}
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
            {messages.materialsList.showing} {materials.length} / {total}
          </div>
        </div>
      )}
    </div>
  );
}