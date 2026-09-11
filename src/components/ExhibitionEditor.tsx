import { getArtifact } from "@/data/artifacts";
import { useExhibition } from "@/store/ExhibitionContext";
import { HeritageImage } from "./HeritageImage";
import { ExhibitionCanvas2D } from "./ExhibitionCanvas2D";
import { PropertyPanel } from "./PropertyPanel";

export function ExhibitionEditor() {
  const { state, dispatch } = useExhibition();
  const unplaced = state.selectedArtifactIds.filter(
    (id) => !state.placedArtifacts.some((p) => p.artifactId === id),
  );

  return (
    <div className="grid gap-4 px-4 py-6 lg:grid-cols-[220px_1fr_280px]">
      <aside className="border border-line bg-paper p-3">
        <p className="text-xs tracking-[0.2em] text-warm">LIBRARY</p>
        <p className="mt-1 text-sm text-muted">유물을 공간으로 끌어 놓으세요.</p>
        <ul className="mt-3 space-y-2">
          {state.selectedArtifactIds.map((id) => {
            const artifact = getArtifact(id);
            if (!artifact) return null;
            const placed = state.placedArtifacts.some((p) => p.artifactId === id);
            return (
              <li
                key={id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/x-cura-artifact", id);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className="flex cursor-grab gap-2 border border-line p-2"
              >
                <div className="h-12 w-12 shrink-0 bg-mist">
                  <HeritageImage src={artifact.image} alt={artifact.name} />
                </div>
                <div>
                  <p className="text-xs leading-4">{artifact.name}</p>
                  <p className="text-[10px] text-warm">
                    {placed ? "배치됨" : "대기"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
      <section>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="h-9 border border-line px-3 text-xs"
            onClick={() => {
              const id = unplaced[0];
              if (!id) return;
              const index = state.placedArtifacts.length;
              dispatch({
                type: "PLACE_ARTIFACT",
                artifactId: id,
                x: 160 + (index % 4) * 180,
                y: 140 + Math.floor(index / 4) * 170,
              });
            }}
          >
            + 유물
          </button>
          <button
            type="button"
            className="h-9 border border-line px-3 text-xs"
            onClick={() => dispatch({ type: "ADD_PANEL", kind: "panel" })}
          >
            + 설명 패널
          </button>
          <button
            type="button"
            className="h-9 border border-line px-3 text-xs"
            onClick={() => dispatch({ type: "ADD_PANEL", kind: "title" })}
          >
            + 제목
          </button>
        </div>
        <ExhibitionCanvas2D interactive showRoute={false} />
      </section>
      <PropertyPanel />
    </div>
  );
}
