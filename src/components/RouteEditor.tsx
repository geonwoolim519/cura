import { ArrowDown, ArrowUp } from "lucide-react";
import { getArtifact } from "@/data/artifacts";
import { useExhibition } from "@/store/ExhibitionContext";
import { ExhibitionCanvas2D } from "./ExhibitionCanvas2D";
import { HeritageImage } from "./HeritageImage";

export function RouteEditor() {
  const { state, dispatch } = useExhibition();

  const move = (index: number, dir: -1 | 1) => {
    const next = [...state.route];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    dispatch({ type: "SET_ROUTE", route: next });
  };

  const autoLeftToRight = () => {
    const sorted = [...state.placedArtifacts].sort((a, b) => a.x - b.x || a.y - b.y);
    dispatch({
      type: "SET_ROUTE",
      route: sorted.map((p) => p.instanceId),
    });
  };

  return (
    <div className="grid gap-4 px-4 py-6 lg:grid-cols-[280px_1fr]">
      <aside className="border border-line bg-paper p-4">
        <p className="text-xs tracking-[0.2em] text-warm">ROUTE</p>
        <h3 className="mt-1 font-serif text-xl text-navy">관람 순서를 정하세요</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          관람객이 어떤 유물부터 보게 할지 직접 결정합니다. 번호와 화살표가 공간에
          표시됩니다.
        </p>
        <button
          type="button"
          onClick={autoLeftToRight}
          className="mt-4 h-9 w-full border border-line text-xs"
        >
          왼쪽부터 자동 정렬
        </button>
        <ol className="mt-4 space-y-2">
          {state.route.map((instanceId, index) => {
            const placed = state.placedArtifacts.find(
              (p) => p.instanceId === instanceId,
            );
            const artifact = placed
              ? getArtifact(placed.artifactId)
              : undefined;
            if (!placed || !artifact) return null;
            return (
              <li
                key={instanceId}
                className="flex items-center gap-2 border border-line p-2"
              >
                <span className="flex h-6 w-6 items-center justify-center bg-navy text-[11px] text-ivory">
                  {index + 1}
                </span>
                <div className="h-10 w-10 bg-mist">
                  <HeritageImage src={artifact.image} alt={artifact.name} />
                </div>
                <p className="flex-1 text-xs">{artifact.name}</p>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  className="text-muted"
                  aria-label="위로"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  className="text-muted"
                  aria-label="아래로"
                >
                  <ArrowDown size={14} />
                </button>
              </li>
            );
          })}
        </ol>
      </aside>
      <ExhibitionCanvas2D interactive={false} showRoute />
    </div>
  );
}
