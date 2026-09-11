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
  return (
    <div
      data-canvas-item="artifact"
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        zIndex: item.displayOrder + (selected ? 20 : 0),
      }}
      className={cn(
        "absolute bg-paper",
        selected ? "ring-1 ring-navy" : "ring-1 ring-line",
        interactive ? "cursor-grab" : "cursor-pointer",
      )}
      onPointerDown={onPointerDown}
    >
      <div className="h-[72%] bg-mist">
        <HeritageImage src={artifact.image} alt={artifact.name} />
      </div>
      <p className="px-1 py-1 text-center text-[10px] leading-tight text-navy">
        {artifact.name}
      </p>
      {routeIndex ? (
        <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center bg-navy text-[11px] text-ivory">
          {routeIndex}
        </span>
      ) : null}
    </div>
  );
}
