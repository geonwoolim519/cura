import { STEPS } from "@/types/exhibition";
import { cn } from "@/lib/cn";

export function ProgressBar({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-7 border-b border-line bg-paper">
      {STEPS.map((item) => {
        const active = item.id === step;
        const done = item.id < step;
        return (
          <li
            key={item.id}
            className={cn(
              "flex flex-col items-center gap-1 px-1 py-3 text-center",
              active && "bg-ivory",
            )}
          >
            <span
              className={cn(
                "font-display text-xs tracking-[0.2em]",
                active ? "text-navy" : done ? "text-teal-deep" : "text-warm",
              )}
            >
              {String(item.id).padStart(2, "0")}
            </span>
            <span
              className={cn(
                "text-[11px]",
                active ? "text-ink" : "text-muted",
              )}
            >
              {item.label}
            </span>
            <span
              className={cn(
                "h-px w-8",
                active ? "bg-navy" : done ? "bg-teal" : "bg-line",
              )}
            />
          </li>
        );
      })}
    </ol>
  );
}
