import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AdminListItem = {
  id: string;
  title: string;
  description?: string;
  badges?: ReactNode;
  metadata?: ReactNode;
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
            className="flex flex-col gap-3 border border-gray-200 bg-gray-50 p-4 text-sm md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {item.title}
                </h3>
                {item.badges}
              </div>
              {item.description && (
                <p className="text-xs text-gray-600">{item.description}</p>
              )}
              {item.metadata}
            </div>
            {item.actions && (
              <div className="flex flex-wrap gap-2 md:justify-end">
                {item.actions}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
