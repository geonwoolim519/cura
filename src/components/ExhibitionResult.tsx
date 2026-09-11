import { Share2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExhibition } from "@/store/ExhibitionContext";

export function ExhibitionResult() {
  const { state, dispatch } = useExhibition();
  const navigate = useNavigate();
  const [toast, setToast] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <p className="text-xs tracking-[0.28em] text-warm">COMPLETE</p>
      <h2 className="mt-4 font-serif text-4xl leading-snug text-navy">
        당신만의 전시가 완성되었습니다.
      </h2>
      <p className="mt-8 font-serif text-3xl text-ink">
        {state.title || "무제 전시"}
      </p>
      <p className="mt-2 text-sm tracking-[0.2em] text-warm">CURATED BY YOU</p>
      <dl className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-4 text-sm">
        <div className="border border-line bg-paper py-4">
          유물 {state.placedArtifacts.length}개
        </div>
        <div className="border border-line bg-paper py-4">
          패널 {state.panels.length}개
        </div>
        <div className="border border-line bg-paper py-4">
          관람 동선 {state.route.length}단계
        </div>
        <div className="border border-line bg-paper py-4">
          AI 큐레이터 {state.aiEvaluation?.scores.overall ?? "–"}점
        </div>
      </dl>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="h-11 bg-navy px-5 text-sm text-ivory"
          onClick={() => {
            dispatch({ type: "SET_PREVIEW_INDEX", index: 0 });
            dispatch({ type: "SET_VIEW", view: "preview" });
          }}
        >
          전시 다시 보기
        </button>
        <button
          type="button"
          className="h-11 border border-navy px-5 text-sm text-navy"
          onClick={() => {
            dispatch({ type: "SET_STEP", step: 4 });
            dispatch({ type: "SET_VIEW", view: "edit" });
          }}
        >
          전시 수정
        </button>
        <button
          type="button"
          className="h-11 border border-line px-5 text-sm"
          onClick={() => {
            dispatch({ type: "RESET" });
            navigate("/");
          }}
        >
          새 전시 만들기
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 border border-line px-5 text-sm"
          onClick={() => {
            setToast(true);
            window.setTimeout(() => setToast(false), 1800);
          }}
        >
          <Share2 size={14} />
          공유
        </button>
      </div>
      {toast ? (
        <p className="mt-6 text-sm text-muted">준비 중인 기능입니다.</p>
      ) : null}
    </div>
  );
}
