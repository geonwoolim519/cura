import { useState } from "react";
import { Curi } from "@/components/Curi";
import { VisitorPerspective } from "@/components/VisitorPerspective";
import { kicker, page } from "@/lib/layout";
import { useExhibition } from "@/store/ExhibitionContext";
import type { ScoreSet } from "@/types/exhibition";

const LABELS: { key: keyof Omit<ScoreSet, "overall">; label: string }[] = [
  { key: "themeConnection", label: "주제와 유물의 연결성" },
  { key: "composition", label: "전시 구성" },
  { key: "route", label: "관람 동선" },
  { key: "information", label: "정보 전달" },
  { key: "experience", label: "관람객 경험" },
];

function tone(score: number) {
  if (score >= 85) return "좋은 전시입니다.";
  if (score >= 75) return "흐름이 보이기 시작합니다.";
  return "조금 더 다듬을 여지가 있습니다.";
}

export function AICurator() {
  const { state, dispatch } = useExhibition();
  const evaln = state.aiEvaluation;
  const [busy, setBusy] = useState(false);

  return (
    <div className={page + " py-10"}>
      <div className="grid items-center gap-8 md:grid-cols-[200px_1fr]">
        <Curi pose="think" className="mx-auto h-48 w-48" />
        <div>
          <p className={kicker}>AI CURATOR</p>
          <h2 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
            AI 큐레이터가 당신의 전시를 평가합니다.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            큐리는 정답을 대신 고르지 않습니다. 현재 전시 데이터를 바탕으로 관람객이
            길을 잃지 않을지 조언합니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setBusy(true);
              window.setTimeout(() => {
                dispatch({ type: "EVALUATE" });
                setBusy(false);
              }, 900);
            }}
            className="btn btn-primary mt-6"
          >
            {busy ? "큐리가 전시를 살펴보는 중…" : "AI 큐레이터에게 평가받기"}
          </button>
        </div>
      </div>

      {evaln ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-sm border border-line bg-paper p-6 md:p-8">
            <p className={kicker}>OVERALL SCORE</p>
            <div className="mt-2 flex items-end gap-4">
              <p className="font-display text-7xl text-navy">{evaln.scores.overall}</p>
              <p className="mb-3 font-serif text-xl text-ink">
                {tone(evaln.scores.overall)}
              </p>
            </div>
            <div className="mt-8 space-y-5">
              {LABELS.map((item, i) => (
                <div key={item.key}>
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm">
                      {String(i + 1).padStart(2, "0")} {item.label}
                    </p>
                    <p className="font-display text-2xl text-navy">
                      {evaln.scores[item.key]}
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 bg-mist">
                    <div
                      className="h-1.5 bg-navy"
                      style={{ width: `${evaln.scores[item.key]}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {evaln.reasons[item.key]}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-sm border border-line bg-paper p-6">
            <p className={kicker}>CURATOR'S NOTE</p>
            <blockquote className="mt-4 font-serif text-xl leading-9 text-ink">
              {evaln.summary}
            </blockquote>
            <VisitorPerspective />
          </div>
        </div>
      ) : null}
    </div>
  );
}
