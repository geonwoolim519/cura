import { Check } from "lucide-react";
import { STEPS } from "@/types/exhibition";
import { page } from "@/lib/layout";
import { cn } from "@/lib/cn";

export function ProgressBar({ step }: { step: number }) {
  return (
    <div className="border-b border-line bg-paper">
      <ol className={cn(page, "flex items-center justify-between gap-2 py-4")}>
        {STEPS.map((item, index) => {
          const active = item.id === step;
          const done = item.id < step;
          return (
            <li key={item.id} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-[10px]",
                    active && "border-navy bg-navy text-ivory",
                    done && "border-teal-deep bg-teal-deep text-ivory",
                    !active && !done && "border-line text-warm",
                  )}
                >
                  {done ? <Check size={12} /> : String(item.id).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "truncate text-[11px]",
                    active ? "text-navy" : "text-muted",
                  )}
                >
                  {item.label}
                </span>
              </div>
              {index < STEPS.length - 1 ? (
                <span
                  className={cn(
                    "mx-2 mb-4 h-px flex-1",
                    done || active ? "bg-navy/40" : "bg-line",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
