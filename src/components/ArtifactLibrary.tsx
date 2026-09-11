import { useMemo, useState } from "react";
import { artifactsForMode, getArtifact } from "@/data/artifacts";
import { useExhibition } from "@/store/ExhibitionContext";
import { ArtifactCard } from "./ArtifactCard";
import { ArtifactFilter } from "./ArtifactFilter";
import { HeritageImage } from "./HeritageImage";

export function ArtifactLibrary() {
  const { state, dispatch } = useExhibition();
  const mode = state.museumMode ?? "free";
  const artifacts = artifactsForMode(mode);
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("");
  const [material, setMaterial] = useState("");
  const [category, setCategory] = useState("");

  const periods = [...new Set(artifacts.map((a) => a.period))];
  const materials = [...new Set(artifacts.map((a) => a.material))];
  const categories = [...new Set(artifacts.map((a) => a.category))];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return artifacts.filter((a) => {
      if (period && a.period !== period) return false;
      if (material && a.material !== material) return false;
      if (category && a.category !== category) return false;
      if (!q) return true;
      const hay = `${a.name} ${a.keywords.join(" ")} ${a.description} ${a.museum}`.toLowerCase();
      return hay.includes(q);
    });
  }, [artifacts, query, period, material, category]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_280px]">
      <section>
        <p className="text-xs tracking-[0.28em] text-warm">ARCHIVE</p>
        <h2 className="mt-2 font-serif text-3xl text-navy">유물을 고르세요</h2>
        <p className="mt-2 text-sm text-muted">
          {artifacts.length}점의 공개 문화유산 아카이브입니다. 여러 점을 선택할 수
          있습니다.
        </p>
        <div className="mt-5">
          <ArtifactFilter
            query={query}
            onQuery={setQuery}
            period={period}
            onPeriod={setPeriod}
            material={material}
            onMaterial={setMaterial}
            category={category}
            onCategory={setCategory}
            periods={periods}
            materials={materials}
            categories={categories}
          />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((artifact) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              selected={state.selectedArtifactIds.includes(artifact.id)}
              onToggle={() =>
                dispatch({ type: "TOGGLE_ARTIFACT", id: artifact.id })
              }
            />
          ))}
        </div>
      </section>
      <aside className="h-fit border border-line bg-paper p-4 lg:sticky lg:top-4">
        <p className="text-xs tracking-[0.2em] text-warm">SELECTED</p>
        <h3 className="mt-1 font-serif text-xl text-navy">
          선택한 유물 {state.selectedArtifactIds.length}
        </h3>
        <ul className="mt-4 space-y-3">
          {state.selectedArtifactIds.map((id) => {
            const artifact = getArtifact(id);
            if (!artifact) return null;
            return (
              <li key={id} className="flex gap-3 border-b border-line pb-3">
                <div className="h-14 w-14 shrink-0 bg-mist">
                  <HeritageImage src={artifact.image} alt={artifact.name} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm">{artifact.name}</p>
                  <p className="text-xs text-muted">{artifact.period}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
