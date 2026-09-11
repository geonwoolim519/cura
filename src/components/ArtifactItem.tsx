import type { PointerEvent as ReactPointerEvent } from "react";
import type { Artifact, PlacedArtifact } from "@/types/exhibition";
import { cn } from "@/lib/cn";
import { HeritageImage } from "./HeritageImage";

export function ArtifactItem({
  item,
  artifact,
  selected,
  interactive,
  routeIndex,
  onPointerDown,
}: {
  item: PlacedArtifact;
  artifact: Artifact;
  selected: boolean;
  interactive: boolean;
  routeIndex?: number;
  onPointerDown: (e: ReactPointerEvent) => void;
}) {
  const style = item.displayStyle ?? "pedestal";
  return (
    <div
      data-canvas-item="artifact"
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        zIndex: item.displayOrder + (selected ? 20 : 0),
        transform: `rotate(${item.rotation || 0}deg)`,
      }}
      className={cn(
        "absolute",
        interactive ? "cursor-grab" : "cursor-pointer",
      )}
      onPointerDown={onPointerDown}
    >
      <div
        className="pointer-events-none absolute -inset-6 spot-glow"
        style={{ ["--spot" as string]: "rgba(255, 244, 214, 0.35)" }}
      />
      <div
        className={cn(
          "relative h-full overflow-hidden bg-paper",
          selected ? "ring-1 ring-navy" : "ring-1 ring-line/80",
          style === "case" && "ring-1 ring-teal/40 bg-ivory/80",
          style === "wall" && "shadow-[4px_8px_0_0_rgba(11,37,69,0.08)]",
        )}
      >
        <div className={style === "pedestal" ? "h-[68%] bg-mist" : "h-[74%] bg-mist"}>
          <HeritageImage src={artifact.image} alt={artifact.name} />
        </div>
        <p className="px-1 py-1 text-center text-[10px] leading-tight text-navy">
          {artifact.name}
        </p>
        {style === "pedestal" ? (
          <span className="absolute inset-x-3 bottom-0 h-2 bg-[#c4b59a]/80" />
        ) : null}
      </div>
      {routeIndex ? (
        <span className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center bg-navy text-[11px] text-ivory">
          {String(routeIndex).padStart(2, "0")}
        </span>
      ) : null}
    </div>
  );
}
