import type { PointerEvent as ReactPointerEvent } from "react";
import type { ExhibitionPanel as Panel } from "@/types/exhibition";
import { cn } from "@/lib/cn";

export function ExhibitionPanel({
  panel,
  selected,
  interactive,
  onPointerDown,
}: {
  panel: Panel;
  selected: boolean;
  interactive: boolean;
  onPointerDown: (e: ReactPointerEvent) => void;
}) {
  return (
    <div
      data-canvas-item="panel"
      style={{
        left: panel.x,
        top: panel.y,
        width: panel.width,
        height: panel.height,
      }}
      className={cn(
        "absolute bg-ivory/95 px-3 py-3",
        panel.kind === "title" ? "border border-navy" : "border border-gold",
        selected && "ring-1 ring-navy",
        interactive ? "cursor-grab" : "cursor-default",
      )}
      onPointerDown={onPointerDown}
    >
      <p
        className={cn(
          "text-navy",
          panel.kind === "title"
            ? "font-serif text-lg leading-6"
            : "text-xs tracking-widest",
        )}
      >
        {panel.title}
      </p>
      {panel.body ? (
        <p className="mt-2 text-[11px] leading-5 text-muted">{panel.body}</p>
      ) : null}
    </div>
  );
}
