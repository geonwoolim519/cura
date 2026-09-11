import type { Artifact } from "@/types/exhibition";
import { cn } from "@/lib/cn";
import { HeritageImage } from "./HeritageImage";

export function ArtifactCard({
  artifact,
  selected,
  onToggle,
}: {
  artifact: Artifact;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={cn(
        "flex flex-col border bg-paper",
        selected ? "border-navy" : "border-line",
      )}
    >
      <div className="relative h-40 bg-mist">
        <HeritageImage src={artifact.image} alt={artifact.name} />
        {selected ? (
          <span className="absolute left-2 top-2 bg-navy px-2 py-1 text-[10px] tracking-widest text-ivory">
            선택됨
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-3 py-3">
        <h3 className="font-serif text-base leading-6 text-navy">
          {artifact.name}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {artifact.period} · {artifact.material} · {artifact.category}
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-warm">
          {artifact.museum}
        </p>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "mt-3 h-9 text-xs tracking-wide",
            selected ? "border border-navy text-navy" : "bg-navy text-ivory",
          )}
        >
          {selected ? "선택 해제" : "전시에 추가"}
        </button>
      </div>
    </article>
  );
}
