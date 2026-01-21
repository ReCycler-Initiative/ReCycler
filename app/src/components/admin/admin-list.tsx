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
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export const AdminList = ({
  items,
  emptyMessage = "Ei kohteita.",
  className,
  selectedId,
  onSelect,
}: AdminListProps) => {
  return (
    <section className={cn(className)}>
      <div className="space-y-1">
        {items.length === 0 && (
          <div className="border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            {emptyMessage}
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect?.(item.id)}
            className={cn(
              "flex flex-col gap-3 border border-gray-200 p-4 text-sm md:flex-row md:items-center md:justify-between rounded-xl bg-white",
              onSelect && "cursor-pointer hover:bg-gray-100 transition-colors",
              selectedId === item.id && "ring-2 ring-primary bg-primary/5"
            )}
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
