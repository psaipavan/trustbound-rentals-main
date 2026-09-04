import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface-card p-10 text-center", className)}>
      {Icon ? (
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      ) : null}
      <p className="mt-4 font-semibold">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center gap-2">{action}</div> : null}
    </div>
  );
}
