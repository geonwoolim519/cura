import type { Artifact } from "@/types/exhibition";
import { cn } from "@/lib/cn";
import { HeritageImage } from "./HeritageImage";

export function ArtifactCard({
  artifact,
  selected,
  noun,
  onToggle,
  onDetail,
}: {
  artifact: Artifact;
  selected: boolean;
  noun: string;
  onToggle: () => void;
  onDetail: () => void;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-sm border bg-paper",
        selected ? "border-navy" : "border-line",
      )}
    >
      {selected ? (
        <span className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center bg-navy text-[10px] text-ivory">
          ✓
        </span>
      ) : null}
      <button type="button" onClick={onDetail} className="relative h-40 bg-mist">
        <HeritageImage src={artifact.image} alt={artifact.name} />
        {selected ? (
          <span className="absolute bottom-2 right-2 bg-navy px-2 py-0.5 text-[10px] tracking-widest text-ivory">
            선택됨
          </span>
        ) : null}
      </button>
      <div className="flex flex-1 flex-col px-3 py-3">
        <h3 className="font-serif text-[15px] leading-5 text-navy">{artifact.name}</h3>
        <p className="mt-1 text-[11px] text-muted">
          {artifact.period} · {artifact.material} · {artifact.category}
        </p>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-warm">
          {artifact.description}
        </p>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "mt-3 h-9 rounded-sm text-xs tracking-wide",
            selected ? "border border-navy text-navy" : "bg-navy text-ivory",
          )}
        >
          {selected ? "선택 해제" : `전시에 추가`}
        </button>
      </div>
    </article>
  );
}
