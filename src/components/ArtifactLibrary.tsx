import { useMemo, useState } from "react";
import { artifactsForMode, getArtifact } from "@/data/artifacts";
import { objectLabel } from "@/data/museums";
import { kicker, page } from "@/lib/layout";
import { useExhibition } from "@/store/ExhibitionContext";
import type { Artifact } from "@/types/exhibition";
import { ArtifactCard } from "./ArtifactCard";
import { ArtifactFilter } from "./ArtifactFilter";
import { HeritageImage } from "./HeritageImage";

export function ArtifactLibrary() {
  const { state, dispatch } = useExhibition();
  const mode = state.museumMode ?? "free";
  const noun = objectLabel(mode);
  const artifacts = artifactsForMode(mode);
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("");
  const [material, setMaterial] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [recommended, setRecommended] = useState(false);
  const [detail, setDetail] = useState<Artifact | null>(null);

  const periods = [...new Set(artifacts.map((a) => a.period))];
  const materials = [...new Set(artifacts.map((a) => a.material))];
  const categories = [...new Set(artifacts.map((a) => a.category))];
  const regions = [...new Set(artifacts.map((a) => a.region))];

  const themeTokens = `${state.title} ${state.theme} ${state.description}`.toLowerCase();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return artifacts.filter((a) => {
      if (period && a.period !== period) return false;
      if (material && a.material !== material) return false;
      if (category && a.category !== category) return false;
      if (region && a.region !== region) return false;
      if (recommended) {
        const hay = `${a.name} ${a.keywords.join(" ")} ${a.description}`.toLowerCase();
        if (!themeTokens.split(/\s+/).some((t) => t.length > 1 && hay.includes(t))) {
          return false;
        }
      }
      if (!q) return true;
      const hay = `${a.name} ${a.keywords.join(" ")} ${a.description} ${a.museum}`.toLowerCase();
      return hay.includes(q);
    });
  }, [artifacts, query, period, material, category, region, recommended, themeTokens]);

  return (
    <div className={page + " grid gap-6 py-8 lg:grid-cols-[220px_1fr_280px]"}>
      <aside className="h-fit rounded-sm border border-line bg-paper p-4 lg:sticky lg:top-4">
        <ArtifactFilter
          query={query}
          onQuery={setQuery}
          period={period}
          onPeriod={setPeriod}
          material={material}
          onMaterial={setMaterial}
          category={category}
          onCategory={setCategory}
          region={region}
          onRegion={setRegion}
          recommended={recommended}
          onRecommended={setRecommended}
          periods={periods}
          materials={materials}
          categories={categories}
          regions={regions}
          noun={noun}
        />
      </aside>
      <section>
        <p className={kicker}>ARCHIVE</p>
        <h2 className="mt-2 font-serif text-3xl text-navy">{noun} 아카이브</h2>
        <p className="mt-2 text-sm text-muted">
          {filtered.length}점 · 카드를 누르면 상세 정보가 열립니다.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((artifact) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              noun={noun}
              selected={state.selectedArtifactIds.includes(artifact.id)}
              onToggle={() => dispatch({ type: "TOGGLE_ARTIFACT", id: artifact.id })}
              onDetail={() => setDetail(artifact)}
            />
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-sm border border-line bg-paper p-4 lg:sticky lg:top-4">
        <p className={kicker}>SELECTED ARTIFACTS</p>
        <h3 className="mt-2 font-serif text-xl text-navy">
          선택한 {noun} {state.selectedArtifactIds.length}
        </h3>
        <p className="mt-2 text-xs leading-5 text-muted">
          선택한 {noun}은 전시 공간에서 배치할 수 있습니다.
        </p>
        <ul className="mt-4 space-y-3">
          {state.selectedArtifactIds.map((id) => {
            const artifact = getArtifact(id);
            if (!artifact) return null;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setDetail(artifact)}
                  className="flex w-full gap-3 border-b border-line pb-3 text-left"
                >
                  <div className="h-14 w-14 shrink-0 bg-mist">
                    <HeritageImage src={artifact.image} alt={artifact.name} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm">{artifact.name}</p>
                    <p className="text-xs text-muted">{artifact.period}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {detail ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-navy/40">
          <div className="h-full w-full max-w-md overflow-auto bg-paper p-6 shadow-xl">
            <div className="h-56 bg-mist">
              <HeritageImage src={detail.image} alt={detail.name} />
            </div>
            <h3 className="mt-4 font-serif text-2xl text-navy">{detail.name}</h3>
            <p className="mt-2 text-sm text-muted">
              {detail.period} · {detail.material} · {detail.category} · {detail.region}
            </p>
            <p className="mt-4 text-sm leading-7 text-ink">{detail.description}</p>
            <p className="mt-4 text-xs text-warm">소장 · {detail.museum}</p>
            <p className="mt-2 text-xs text-warm">
              출처: {detail.source} ·{" "}
              <a href={detail.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                이미지 원문
              </a>
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                className="btn btn-primary flex-1"
                onClick={() => dispatch({ type: "TOGGLE_ARTIFACT", id: detail.id })}
              >
                {state.selectedArtifactIds.includes(detail.id) ? "선택 해제" : "전시에 추가"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setDetail(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
