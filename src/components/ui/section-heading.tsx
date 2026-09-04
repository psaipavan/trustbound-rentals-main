import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl animate-[fade-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl font-extrabold text-balance-tight sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-base text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
