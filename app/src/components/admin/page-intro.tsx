import { cn } from "@/lib/utils";
import { ChevronLeftIcon, LucideIcon } from "lucide-react";
import { Button } from "../ui/button";

type PageIntroProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  onBack?: () => void;
};

export function PageIntro({
  title,
  description,
  actions,
  className,
  icon: Icon,
  onBack,
}: PageIntroProps) {
  return (
    <section
      className={cn(
        "admin-intro-card rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(226,232,240,0.9),_rgba(255,255,255,1)_42%)] p-6 shadow-sm md:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-baseline gap-4">
            {onBack && (
              <Button
                className="mb-4 text-sm text-slate-500 hover:text-slate-700"
                onClick={onBack}
                size="icon"
                variant="ghost"
              >
                <ChevronLeftIcon />
              </Button>
            )}
            <div>
              {Icon && (
                <div className="admin-intro-icon mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
                {description}
              </p>
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
