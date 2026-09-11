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
  if (panel.kind === "pedestal") {
    return (
      <div
        data-canvas-item="panel"
        style={{ left: panel.x, top: panel.y, width: panel.width, height: panel.height }}
        className={cn(
          "absolute bg-[#cbb896] shadow-[inset_0_8px_0_#b89d72]",
          selected && "ring-1 ring-navy",
          interactive ? "cursor-grab" : "cursor-default",
        )}
        onPointerDown={onPointerDown}
      >
        <p className="px-2 py-1 text-[10px] tracking-widest text-navy/70">{panel.title}</p>
      </div>
    );
  }

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
