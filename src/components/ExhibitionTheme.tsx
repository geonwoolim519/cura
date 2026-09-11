import { themePresets } from "@/data/museums";
import { useExhibition } from "@/store/ExhibitionContext";
import type { MuseumMode } from "@/types/exhibition";

export function ExhibitionTheme() {
  const { state, dispatch } = useExhibition();
  const mode = (state.museumMode ?? "free") as MuseumMode;
  const presets = themePresets[mode];

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section>
        <p className="text-xs tracking-[0.28em] text-warm">THEME</p>
        <h2 className="mt-2 font-serif text-3xl text-navy">
          전시의 질문을 먼저 정해 보세요
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          제목과 주제, 설명이 있어야 유물 선택과 AI 평가가 같은 방향을 봅니다.
        </p>
        <div className="mt-8 space-y-5">
          <label className="block">
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
              placeholder="예: 백제의 금속문화"
              className="mt-2 h-12 w-full border border-line bg-paper px-4 outline-none focus:border-navy"
            />
          </label>
          <label className="block">
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
              placeholder="예: 금속은 백제 왕실의 권위를 어떻게 보여 주었을까?"
              className="mt-2 h-12 w-full border border-line bg-paper px-4 outline-none focus:border-navy"
            />
          </label>
          <label className="block">
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
              rows={5}
              placeholder="관람객에게 전하고 싶은 이야기를 적어 주세요."
              className="mt-2 w-full border border-line bg-paper px-4 py-3 outline-none focus:border-navy"
            />
          </label>
        </div>
      </section>
      <aside className="border border-line bg-paper p-6">
        <p className="text-xs tracking-[0.2em] text-warm">SUGGESTED THEMES</p>
        <ul className="mt-4 space-y-3">
          {presets.map((preset) => (
            <li key={preset.title}>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "SET_THEME",
                    title: preset.title,
                    theme: preset.theme,
                    description: preset.description,
                  })
                }
                className="w-full border border-line px-4 py-4 text-left hover:border-navy hover:bg-ivory"
              >
                <p className="font-serif text-lg text-navy">{preset.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{preset.theme}</p>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-5 text-warm">
          예시를 고른 뒤에도 문장을 직접 고칠 수 있습니다.
        </p>
      </aside>
    </div>
  );
}
