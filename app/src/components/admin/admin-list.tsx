import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AdminListItem = {
  id: string;
  title: string;
  actions?: ReactNode;
};

export interface AdminListProps {
  items: AdminListItem[];
  emptyMessage?: string;
  className?: string;
}

export const AdminList = ({
  items,
  emptyMessage = "Ei kohteita.",
  className,
}: AdminListProps) => {
  return (
    <section
      className={cn("border border-gray-200 bg-white p-1 shadow-sm", className)}
    >
      <div className="space-y-1">
        {items.length === 0 && (
          <div className="border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            {emptyMessage}
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border border-gray-200 bg-gray-50 p-4"
          >
            <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
            {item.actions && (
              <div className="flex gap-2">{item.actions}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
