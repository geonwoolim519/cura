import { cn } from "@/lib/cn";
import { useExhibition } from "@/store/ExhibitionContext";
import type { VisitorPerspective } from "@/types/exhibition";

const OPTIONS: { id: VisitorPerspective; label: string }[] = [
  { id: "general", label: "일반 관람객" },
  { id: "youth", label: "청소년" },
  { id: "foreign", label: "외국인 관람객" },
  { id: "specialist", label: "역사 전공자" },
];

export function VisitorPerspective() {
  const { state, dispatch } = useExhibition();
  const note = state.aiEvaluation?.visitorNotes[state.visitorPerspective];

  return (
    <section className="mt-8 border border-line bg-paper p-5">
      <p className="text-xs tracking-[0.22em] text-warm">VISITOR PERSPECTIVE</p>
      <h3 className="mt-2 font-serif text-2xl text-navy">
        관람객은 이 전시를 어떻게 경험할까요?
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => dispatch({ type: "SET_VISITOR", visitor: opt.id })}
            className={cn(
              "h-9 px-3 text-xs",
              state.visitorPerspective === opt.id
                ? "bg-navy text-ivory"
                : "border border-line text-muted",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {note ? (
        <p className="mt-4 font-serif text-lg leading-8 text-ink">{note}</p>
      ) : (
        <p className="mt-4 text-sm text-muted">
          먼저 AI 큐레이터에게 평가를 받으면, 관람객 관점의 조언이 열립니다.
        </p>
      )}
    </section>
  );
}
