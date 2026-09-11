import { ArrowDown, ArrowUp } from "lucide-react";
import { getArtifact } from "@/data/artifacts";
import { kicker } from "@/lib/layout";
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
    <div className="grid gap-4 px-5 py-6 lg:grid-cols-[300px_1fr] xl:px-8">
      <aside className="rounded-sm border border-line bg-paper p-4">
        <p className={kicker}>ROUTE</p>
        <h3 className="mt-2 font-serif text-2xl text-navy">관람 동선을 설계하세요</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          전시실의 유물을 클릭하면 동선 번호가 지정됩니다. 입구에서 출구까지 관람객의
          이동을 바닥 위에 표시합니다.
        </p>
        <ol className="mt-5 space-y-2 text-sm text-muted">
          <li>① 입구</li>
          {state.route.map((_, i) => (
            <li key={i}>② 동선 {String(i + 1).padStart(2, "0")}</li>
          ))}
          <li>출구</li>
        </ol>
        <button
          type="button"
          onClick={autoLeftToRight}
          className="btn btn-outline mt-4 w-full"
        >
          왼쪽부터 자동 정렬
        </button>
        <ol className="mt-4 space-y-2">
          {state.route.map((instanceId, index) => {
            const placed = state.placedArtifacts.find((p) => p.instanceId === instanceId);
            const artifact = placed ? getArtifact(placed.artifactId) : undefined;
            if (!placed || !artifact) return null;
            return (
              <li
                key={instanceId}
                className="flex items-center gap-2 border border-line p-2"
              >
                <span className="flex h-6 w-6 items-center justify-center bg-navy text-[11px] text-ivory">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="h-10 w-10 bg-mist">
                  <HeritageImage src={artifact.image} alt={artifact.name} />
                </div>
                <p className="flex-1 text-xs">{artifact.name}</p>
                <button type="button" onClick={() => move(index, -1)} aria-label="위로">
                  <ArrowUp size={14} />
                </button>
                <button type="button" onClick={() => move(index, 1)} aria-label="아래로">
                  <ArrowDown size={14} />
                </button>
              </li>
            );
          })}
        </ol>
      </aside>
      <ExhibitionCanvas2D interactive={false} showRoute routeEdit />
    </div>
  );
}
