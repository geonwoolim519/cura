import { useState } from "react";
import { Curi } from "@/components/Curi";
import { VisitorPerspective } from "@/components/VisitorPerspective";
import { cn } from "@/lib/cn";
import { kicker, page } from "@/lib/layout";
import { useExhibition } from "@/store/ExhibitionContext";
import type { CuratorCategoryScore, CuratorSuggestion } from "@/types/exhibition";

function tone(score: number) {
  if (score >= 82) return "좋은 전시입니다.";
  if (score >= 68) return "골격이 보이기 시작합니다.";
  return "이야기를 조금 더 다듬을 여지가 있습니다.";
}

function suggestionLabel(item: CuratorSuggestion, index: number) {
  if (item.type === "artifact") return `${String(index + 1).padStart(2, "0")}  유물 구성을 보완해보세요.`;
  if (item.type === "panel") return `${String(index + 1).padStart(2, "0")}  입구 설명을 보강해 보세요.`;
  if (item.type === "layout" || item.type === "route") {
    return `${String(index + 1).padStart(2, "0")}  공간과 동선을 다듬어 보세요.`;
  }
  if (item.type === "theme") return `${String(index + 1).padStart(2, "0")}  주제 문장을 선명하게 해보세요.`;
  return `${String(index + 1).padStart(2, "0")}  마지막 메시지를 강화해보세요.`;
}

function actionLabel(type: CuratorSuggestion["type"]) {
  if (type === "artifact") return "유물 찾아보기";
  if (type === "panel") return "패널 수정";
  if (type === "layout") return "공간으로 이동";
  if (type === "route") return "동선 다듬기";
  if (type === "theme") return "주제 다듬기";
  return "전시 수정하기";
}

export function AICurator() {
  const { state, dispatch } = useExhibition();
  const evaln = state.aiEvaluation;
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const structured = Boolean(evaln?.categories?.length);
  const overall = evaln?.overallScore ?? evaln?.scores.overall ?? 0;

  const run = () => {
    setBusy(true);
    window.setTimeout(() => {
      dispatch({ type: "EVALUATE" });
      setBusy(false);
      setOpenId(null);
    }, 700);
  };

  const apply = (item: CuratorSuggestion) => {
    dispatch({ type: "SET_STEP", step: item.targetStep ?? 4 });
    dispatch({ type: "SET_VIEW", view: "edit" });
  };

  return (
    <div className={page + " py-8 md:py-10"}>
      <div className="grid items-center gap-5 md:grid-cols-[200px_1fr] md:gap-8">
        <Curi pose="think" className="mx-auto h-32 w-32 md:h-48 md:w-48" />
        <div>
          <p className={kicker}>AI CURATOR REVIEW</p>
          <h2 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
            당신이 만든 전시를 분석했습니다.
          </h2>
          <div className="relative z-30 mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={run} className="btn btn-primary">
              {busy
                ? "큐리가 전시를 살펴보는 중…"
                : evaln
                  ? "AI 다시 평가하기"
                  : "AI 큐레이터에게 평가받기"}
            </button>
            {evaln ? (
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
            ) : null}
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            큐리는 전시를 대신 만들지 않습니다. 선택한 유물과 위치, 동선, 설명을
            읽고 동료 큐레이터처럼 의견을 남깁니다.
          </p>
        </div>
      </div>

      {evaln ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-sm border border-line bg-paper p-6 md:p-8">
            <p className={kicker}>OVERALL SCORE</p>
            <div className="mt-2 flex items-end gap-3">
              <p className="font-display text-7xl leading-none text-navy">{overall}</p>
              <p className="mb-2 font-serif text-2xl text-muted">/100</p>
            </div>
            <p className="mt-3 font-serif text-xl text-ink">{tone(overall)}</p>
            {evaln.previousOverallScore != null && evaln.scoreDelta != null ? (
              <p className="mt-4 text-sm leading-6 text-muted">
                이전 점수 {evaln.previousOverallScore} → 현재 점수 {overall}
                {evaln.scoreDelta === 0
                  ? ""
                  : ` (${evaln.scoreDelta > 0 ? "+" : ""}${evaln.scoreDelta}점)`}
                {evaln.comparisonNote ? ` · ${evaln.comparisonNote}` : ""}
              </p>
            ) : null}

            {structured ? (
              <div className="mt-8 space-y-3">
                {evaln.categories!.map((item) => (
                  <CategoryRow
                    key={item.id}
                    item={item}
                    open={openId === item.id}
                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-8 text-sm text-muted">
                이전 형식의 평가입니다. 다시 평가하면 항목별 분석이 열립니다.
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-sm border border-line bg-paper p-6">
              <p className={kicker}>CURATOR'S NOTE</p>
              <blockquote className="mt-4 font-serif text-xl leading-9 text-ink">
                {evaln.curatorComment || evaln.summary}
              </blockquote>
              {evaln.strengths?.length ? (
                <ul className="mt-5 space-y-2 text-sm leading-6 text-muted">
                  {evaln.strengths.map((line) => (
                    <li key={line}>· {line}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <VisitorPerspective />
          </div>
        </div>
      ) : null}

      {evaln?.improvements?.length ? (
        <section className="mt-10">
          <p className={kicker}>AI CURATOR'S SUGGESTIONS</p>
          <h3 className="mt-2 font-serif text-2xl text-navy">핵심 개선안</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {evaln.improvements.map((item, index) => (
              <article key={`${item.type}-${index}`} className="border border-line bg-paper p-5">
                <p className="font-serif text-lg leading-7 text-navy">
                  {suggestionLabel(item, index)}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">{item.message}</p>
                <p className="mt-3 text-sm leading-6 text-ink">{item.action}</p>
                <button
                  type="button"
                  className="btn btn-outline mt-5 w-full"
                  onClick={() => apply(item)}
                >
                  {actionLabel(item.type)}
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function CategoryRow({
  item,
  open,
  onToggle,
}: {
  item: CuratorCategoryScore;
  open: boolean;
  onToggle: () => void;
}) {
  const ratio = item.maxScore === 0 ? 0 : item.score / item.maxScore;
  return (
    <div className="border-b border-line pb-3">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-4 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm">{item.name}</p>
            <p className="shrink-0 font-display text-xl text-navy">
              {item.score} / {item.maxScore}
            </p>
          </div>
          <div className="mt-2 h-1.5 bg-mist">
            <div className="h-1.5 bg-navy" style={{ width: `${Math.round(ratio * 100)}%` }} />
          </div>
        </div>
      </button>
      {open ? (
        <div className={cn("mt-3 space-y-2 text-sm leading-6 text-muted")}>
          <p>{item.reason}</p>
          <p className="text-ink">잘한 점 · {item.strength}</p>
          <p>개선점 · {item.improvement}</p>
        </div>
      ) : null}
    </div>
  );
}
