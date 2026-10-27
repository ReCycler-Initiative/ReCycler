import { cn } from "@/lib/utils";

export const LocationTypeChips = ({
  types,
  isActive,
  onToggle,
}: {
  types: { id: string; name: string }[];
  isActive: (typeId: string) => boolean;
  onToggle: (typeId: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {types.map((type) => {
      const active = isActive(type.id);
      return (
        <button
          key={type.id}
          type="button"
          aria-pressed={active}
          onClick={() => onToggle(type.id)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            active
              ? "border-primary bg-primary text-primary-foreground"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          )}
        >
          {type.name}
        </button>
      );
    })}
  </div>
);
