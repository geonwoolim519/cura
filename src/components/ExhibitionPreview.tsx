import { useState } from "react";
import { getArtifact } from "@/data/artifacts";
import { useExhibition } from "@/store/ExhibitionContext";
import { ExhibitionCanvas2D } from "./ExhibitionCanvas2D";
import { HeritageImage } from "./HeritageImage";

export function ExhibitionPreview() {
  const { state, dispatch } = useExhibition();
  const [openId, setOpenId] = useState<string | null>(null);
  const route = state.route.filter((id) =>
    state.placedArtifacts.some((p) => p.instanceId === id),
  );
  const currentId = route[state.previewIndex];
  const placed = state.placedArtifacts.find((p) => p.instanceId === currentId);
  const artifact = placed ? getArtifact(placed.artifactId) : undefined;
  const last = state.previewIndex >= route.length;

  if (last || route.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-xs tracking-[0.28em] text-warm">PREVIEW</p>
        <h2 className="mt-4 font-serif text-4xl text-navy">전시 관람 완료</h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          당신이 설계한 동선을 따라 전시를 한 바퀴 돌아보았습니다.
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_VIEW", view: "result" })}
          className="mt-8 h-11 bg-navy px-6 text-sm text-ivory"
        >
          완성 화면으로
        </button>
      </div>
    );
  }

  return (
    <div className="bg-ivory px-4 py-8">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs tracking-[0.28em] text-warm">EXHIBITION</p>
        <h2 className="mt-2 font-serif text-4xl text-navy">
          {state.title || "무제 전시"}
        </h2>
        <p className="mt-2 text-sm text-muted">{state.theme}</p>
      </div>
      <div className="mx-auto mt-8 max-w-5xl">
        <ExhibitionCanvas2D
          interactive={false}
          showRoute
          highlightId={currentId}
        />
      </div>
      {artifact && placed ? (
        <div className="mx-auto mt-6 flex max-w-3xl gap-4 border border-line bg-paper p-4">
          <div className="h-28 w-28 shrink-0 bg-mist">
            <HeritageImage src={artifact.image} alt={artifact.name} />
          </div>
          <div>
            <p className="text-xs text-warm">
              {state.previewIndex + 1} / {route.length}
            </p>
            <h3 className="font-serif text-2xl text-navy">{artifact.name}</h3>
            <p className="mt-1 text-sm text-muted">
              {artifact.period} · {artifact.material}
            </p>
            <button
              type="button"
              className="mt-2 text-xs underline"
              onClick={() => setOpenId(artifact.id)}
            >
              상세 설명 보기
            </button>
          </div>
        </div>
      ) : null}
      <div className="mx-auto mt-6 flex max-w-3xl justify-between">
        <button
          type="button"
          className="h-10 border border-line px-4 text-sm"
          onClick={() =>
            dispatch({
              type: "SET_PREVIEW_INDEX",
              index: Math.max(0, state.previewIndex - 1),
            })
          }
        >
          ← 이전
        </button>
        <button
          type="button"
          className="h-10 bg-navy px-4 text-sm text-ivory"
          onClick={() =>
            dispatch({
              type: "SET_PREVIEW_INDEX",
              index: state.previewIndex + 1,
            })
          }
        >
          다음 →
        </button>
      </div>
      {openId && artifact ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-navy/50 p-6">
          <div className="max-w-lg border border-line bg-paper p-6">
            <h3 className="font-serif text-2xl text-navy">{artifact.name}</h3>
            <p className="mt-4 text-sm leading-7">{artifact.description}</p>
            <button
              type="button"
              className="mt-6 h-9 bg-navy px-4 text-sm text-ivory"
              onClick={() => setOpenId(null)}
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
