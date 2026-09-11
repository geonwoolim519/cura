import { getArtifact } from "@/data/artifacts";
import { kicker } from "@/lib/layout";
import { useExhibition } from "@/store/ExhibitionContext";
import type { DisplayStyle } from "@/types/exhibition";
import { HeritageImage } from "./HeritageImage";

export function PropertyPanel() {
  const { state, dispatch } = useExhibition();
  const selection = state.selection;

  if (!selection) {
    return (
      <div className="rounded-sm border border-line bg-paper p-4 text-sm text-muted">
        <p className={kicker}>SELECTED ITEM</p>
        <p className="mt-3">전시공간의 유물이나 패널을 선택하면 속성이 나타납니다.</p>
      </div>
    );
  }

  if (selection.type === "artifact") {
    const placed = state.placedArtifacts.find(
      (p) => p.instanceId === selection.instanceId,
    );
    const artifact = placed ? getArtifact(placed.artifactId) : undefined;
    if (!placed || !artifact) return null;
    return (
      <div className="rounded-sm border border-line bg-paper p-4">
        <p className={kicker}>SELECTED ITEM</p>
        <div className="mt-3 h-36 bg-mist">
          <HeritageImage src={artifact.image} alt={artifact.name} />
        </div>
        <h3 className="mt-3 font-serif text-xl text-navy">{artifact.name}</h3>
        <dl className="mt-3 space-y-1 text-sm text-muted">
          <div>시대 · {artifact.period}</div>
          <div>재질 · {artifact.material}</div>
          <div>분류 · {artifact.category}</div>
          <div>소장 · {artifact.museum}</div>
        </dl>
        <p className="mt-3 text-sm leading-6 text-ink">{artifact.description}</p>
        <label className="mt-4 block text-xs text-warm">전시 방식</label>
        <select
          value={placed.displayStyle ?? "pedestal"}
          onChange={(e) =>
            dispatch({
              type: "SET_DISPLAY",
              instanceId: placed.instanceId,
              displayStyle: e.target.value as DisplayStyle,
            })
          }
          className="mt-1 h-10 w-full border border-line px-2 text-sm"
        >
          <option value="pedestal">전시대</option>
          <option value="wall">벽면</option>
          <option value="case">쇼케이스</option>
        </select>
        <label className="mt-3 block text-xs text-warm">
          회전 {placed.rotation || 0}°
        </label>
        <input
          type="range"
          min={-30}
          max={30}
          value={placed.rotation || 0}
          onChange={(e) =>
            dispatch({
              type: "ROTATE_ITEM",
              instanceId: placed.instanceId,
              rotation: Number(e.target.value),
            })
          }
          className="mt-1 w-full"
        />
        <p className="mt-3 text-[11px] text-warm">
          위치 {Math.round(placed.x)}, {Math.round(placed.y)} · 크기{" "}
          {Math.round(placed.width)}×{Math.round(placed.height)}
        </p>
        <p className="mt-3 text-[11px] text-warm">
          출처: {artifact.source} ·{" "}
          <a href={artifact.sourceUrl} target="_blank" rel="noreferrer" className="underline">
            원문
          </a>
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: "DELETE_SELECTION" })}
          className="mt-4 h-9 w-full border border-line text-sm text-muted"
        >
          삭제
        </button>
      </div>
    );
  }

  const panel = state.panels.find((p) => p.id === selection.id);
  if (!panel) return null;

  return (
    <div className="rounded-sm border border-line bg-paper p-4">
      <p className={kicker}>
        {panel.kind === "title" ? "TITLE" : panel.kind === "pedestal" ? "PEDESTAL" : "PANEL"}
      </p>
      <label className="mt-3 block text-xs text-warm">제목</label>
      <input
        value={panel.title}
        onChange={(e) =>
          dispatch({
            type: "UPDATE_PANEL",
            id: panel.id,
            title: e.target.value,
            body: panel.body,
          })
        }
        className="mt-1 h-10 w-full border border-line px-3 text-sm outline-none"
      />
      <label className="mt-3 block text-xs text-warm">설명</label>
      <textarea
        value={panel.body}
        onChange={(e) =>
          dispatch({
            type: "UPDATE_PANEL",
            id: panel.id,
            title: panel.title,
            body: e.target.value,
          })
        }
        rows={6}
        className="mt-1 w-full border border-line px-3 py-2 text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => dispatch({ type: "DELETE_SELECTION" })}
        className="mt-4 h-9 w-full border border-line text-sm text-muted"
      >
        삭제
      </button>
    </div>
  );
}
