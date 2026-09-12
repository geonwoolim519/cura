import { useState } from "react";
import { museums, objectLabel, themePresets } from "@/data/museums";
import { kicker, page } from "@/lib/layout";
import { cn } from "@/lib/cn";
import { useExhibition } from "@/store/ExhibitionContext";
import type { MuseumMode } from "@/types/exhibition";
import { HeritageImage } from "./HeritageImage";

export function ExhibitionTheme() {
  const { state, dispatch } = useExhibition();
  const mode = (state.museumMode ?? "free") as MuseumMode;
  const museum = museums[mode];
  const presets = themePresets[mode];
  const [customOpen, setCustomOpen] = useState(
    Boolean(state.title) && !presets.some((p) => p.title === state.title),
  );
  const noun = objectLabel(mode);

  return (
    <div className={page + " grid gap-8 py-10 lg:grid-cols-[280px_1fr]"}>
      <aside className="h-fit overflow-hidden rounded-sm border border-line bg-paper">
        <div className="h-44 bg-mist">
          <HeritageImage src={museum.image} alt={museum.name} />
        </div>
        <div className="p-5">
          <p className={kicker}>{museum.periodLabel}</p>
          <h2 className="mt-2 font-serif text-2xl text-navy">{museum.name}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{museum.interiorText}</p>
        </div>
      </aside>

      <section>
        <p className={kicker}>THEME</p>
        <h2 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
          전시 주제를 정해 볼까요?
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          추천 주제 가운데 고르거나, 직접 질문을 만들어 {noun} 선택과 AI 평가가
          같은 방향을 보게 하세요.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {presets.map((preset) => {
            const active = state.title === preset.title;
            return (
              <button
                key={preset.title}
                type="button"
                onClick={() => {
                  setCustomOpen(false);
                  dispatch({
                    type: "SET_THEME",
                    title: preset.title,
                    theme: preset.theme,
                    description: preset.description,
                  });
                }}
                className={cn(
                  "overflow-hidden rounded-sm border bg-paper text-left",
                  active ? "border-navy" : "border-line hover:border-navy/50",
                )}
              >
                <div className="h-36 bg-mist">
                  <HeritageImage src={preset.image} alt={preset.title} />
                </div>
                <div className="p-4">
                  {active ? (
                    <p className="text-[10px] tracking-[0.2em] text-navy">선택됨</p>
                  ) : null}
                  <h3 className="font-serif text-xl text-navy">{preset.title}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-navy/70">{preset.theme}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setCustomOpen(true)}
          className="btn btn-outline mt-6"
        >
          + 직접 주제 만들기
        </button>
        {customOpen ? (
          <div className="mt-6 grid gap-4 border border-line bg-paper p-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-xs tracking-widest text-warm">전시 제목</span>
              <input
                value={state.title}
                onChange={(e) =>
                  dispatch({
                    type: "SET_THEME",
                    title: e.target.value,
                    theme: state.theme,
                    description: state.description,
                  })
                }
                className="mt-2 h-12 w-full rounded-sm border border-line bg-ivory px-4 outline-none focus:border-navy"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs tracking-widest text-warm">전시 주제</span>
              <input
                value={state.theme}
                onChange={(e) =>
                  dispatch({
                    type: "SET_THEME",
                    title: state.title,
                    theme: e.target.value,
                    description: state.description,
                  })
                }
                className="mt-2 h-12 w-full rounded-sm border border-line bg-ivory px-4 outline-none focus:border-navy"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs tracking-widest text-warm">전시 설명</span>
              <textarea
                value={state.description}
                onChange={(e) =>
                  dispatch({
                    type: "SET_THEME",
                    title: state.title,
                    theme: state.theme,
                    description: e.target.value,
                  })
                }
                rows={4}
                className="mt-2 w-full rounded-sm border border-line bg-ivory px-4 py-3 outline-none focus:border-navy"
              />
            </label>
          </div>
        ) : null}
      </section>
    </div>
  );
}
