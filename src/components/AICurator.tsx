import { Curi } from "@/components/Curi";
import { VisitorPerspective } from "@/components/VisitorPerspective";
import { useExhibition } from "@/store/ExhibitionContext";
import type { ScoreSet } from "@/types/exhibition";

const LABELS: { key: keyof Omit<ScoreSet, "overall">; label: string }[] = [
  { key: "themeConnection", label: "주제와 유물의 연결성" },
  { key: "composition", label: "전시 구성" },
  { key: "route", label: "관람 동선" },
  { key: "information", label: "정보 전달력" },
  { key: "experience", label: "관람객 경험" },
];

export function AICurator() {
  const { state, dispatch } = useExhibition();
  const evaln = state.aiEvaluation;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid items-start gap-8 md:grid-cols-[200px_1fr]">
        <Curi pose="think" className="mx-auto h-52 w-44" />
        <div>
          <p className="text-xs tracking-[0.28em] text-warm">AI CURATOR 큐리</p>
          <h2 className="mt-2 font-serif text-3xl text-navy">
            AI 큐레이터의 시선으로
            <br />
            당신의 전시를 돌아보세요.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            큐리는 정답을 대신 고르지 않습니다. 현재 전시 데이터를 바탕으로,
            관람객이 길을 잃지 않을지 조언합니다.
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: "EVALUATE" })}
            className="mt-6 h-11 bg-navy px-5 text-sm text-ivory"
          >
            AI 큐레이터에게 평가받기
          </button>
        </div>
      </div>

      {evaln ? (
        <div className="mt-10 border border-line bg-paper p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.2em] text-warm">OVERALL</p>
              <p className="font-display text-6xl text-navy">
                {evaln.scores.overall}
              </p>
            </div>
            <Curi pose="wink" className="h-24 w-24" />
          </div>
          <div className="mt-8 space-y-5">
            {LABELS.map((item) => (
              <div key={item.key}>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm">{item.label}</p>
                  <p className="font-display text-2xl text-navy">
                    {evaln.scores[item.key]}
                  </p>
                </div>
                <div className="mt-1 h-px bg-line">
                  <div
                    className="h-px bg-navy"
                    style={{ width: `${evaln.scores[item.key]}%` }}
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {evaln.reasons[item.key]}
                </p>
              </div>
            ))}
          </div>
          <blockquote className="mt-8 border-l-2 border-gold pl-4 font-serif text-xl leading-9 text-ink">
            {evaln.summary}
          </blockquote>
          <VisitorPerspective />
        </div>
      ) : null}
    </div>
  );
}
