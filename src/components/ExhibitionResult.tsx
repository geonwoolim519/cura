import { Share2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Curi } from "@/components/Curi";
import { ExhibitionCanvas2D } from "@/components/ExhibitionCanvas2D";
import { museums } from "@/data/museums";
import { kicker, page } from "@/lib/layout";
import { rememberExhibition } from "@/lib/storage";
import { useExhibition } from "@/store/ExhibitionContext";

export function ExhibitionResult() {
  const { state, dispatch } = useExhibition();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const museum = state.museumMode ? museums[state.museumMode] : null;

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setToast("전시 링크를 복사했습니다.");
    } catch {
      setToast("이 페이지 주소를 공유해 주세요.");
    }
    window.setTimeout(() => setToast(""), 1800);
  };

  return (
    <div className={page + " py-12"}>
      <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className={kicker}>EXHIBITION COMPLETE</p>
          <h2 className="mt-3 font-serif text-4xl leading-snug text-navy">
            당신의 전시가
            <br />
            완성되었습니다.
          </h2>
          <p className="mt-6 font-serif text-3xl text-ink">{state.title || "무제 전시"}</p>
          <p className="mt-2 text-sm tracking-[0.22em] text-warm">Curated by You</p>
          <p className="mt-4 text-sm text-muted">
            {museum?.name} · {state.theme}
          </p>
          <p className="mt-8 font-display text-6xl text-navy">
            {state.aiEvaluation?.overallScore ?? state.aiEvaluation?.scores.overall ?? "–"}
          </p>
          <p className="text-sm text-muted">AI CURATOR SCORE</p>
        </div>
        <Curi pose="wink" className="mx-auto h-56 w-56" />
      </div>

      <div className="mt-10">
        <ExhibitionCanvas2D interactive={false} showRoute />
      </div>

      <section className="mt-10 grid gap-4 border border-line bg-paper p-6 md:grid-cols-3">
        <div>
          <p className={kicker}>EXHIBITION SUMMARY</p>
          <p className="mt-3 font-serif text-2xl text-navy">
            유물 {state.placedArtifacts.length}점
          </p>
          <p className="mt-1 text-sm text-muted">
            설명 패널 {state.panels.filter((p) => p.kind === "panel").length}개 · 동선{" "}
            {state.route.length}단계
          </p>
        </div>
        <p className="font-serif text-lg leading-8 text-ink md:col-span-2">
          유물을 고르고, 공간을 구성하고, 관람객의 동선을 설계하고, AI 큐레이터의
          시선으로 전시를 다시 바라보았습니다.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            rememberExhibition(state);
            dispatch({ type: "SET_PREVIEW_INDEX", index: 0 });
            dispatch({ type: "SET_VIEW", view: "preview" });
          }}
        >
          전시 다시 보기
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            dispatch({ type: "SET_STEP", step: 4 });
            dispatch({ type: "SET_VIEW", view: "edit" });
          }}
        >
          전시 수정하기
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            dispatch({ type: "RESET" });
            navigate("/");
          }}
        >
          새 전시 만들기
        </button>
        <button type="button" className="btn btn-outline" onClick={() => void share()}>
          <Share2 size={14} />
          전시 공유하기
        </button>
      </div>
      {toast ? <p className="mt-4 text-sm text-muted">{toast}</p> : null}
    </div>
  );
}
