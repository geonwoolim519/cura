import { useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AICurator } from "@/components/AICurator";
import { AppHeader } from "@/components/AppHeader";
import { ArtifactLibrary } from "@/components/ArtifactLibrary";
import { ExhibitionEditor } from "@/components/ExhibitionEditor";
import { ExhibitionPreview } from "@/components/ExhibitionPreview";
import { ExhibitionResult } from "@/components/ExhibitionResult";
import { ExhibitionTheme } from "@/components/ExhibitionTheme";
import { ProgressBar } from "@/components/ProgressBar";
import { RouteEditor } from "@/components/RouteEditor";
import { museums } from "@/data/museums";
import { useExhibition } from "@/store/ExhibitionContext";

export function ExhibitionCreate() {
  const { state, dispatch, hydrated } = useExhibition();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      dispatch({ type: "DELETE_SELECTION" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  if (!hydrated) {
    return <div className="min-h-screen bg-ivory" />;
  }

  if (!state.museumMode) return <Navigate to="/" replace />;

  const museum = museums[state.museumMode];
  const step = state.view === "preview" || state.view === "result" ? 7 : state.step;

  const goNext = () => {
    if (state.step === 6) {
      if (!state.aiEvaluation) dispatch({ type: "EVALUATE" });
      dispatch({ type: "SET_STEP", step: 7 });
      dispatch({ type: "SET_VIEW", view: "preview" });
      return;
    }
    dispatch({ type: "SET_STEP", step: Math.min(6, state.step + 1) });
  };

  const goPrev = () => {
    if (state.view === "preview" || state.view === "result") {
      dispatch({ type: "SET_VIEW", view: "edit" });
      dispatch({ type: "SET_STEP", step: 6 });
      return;
    }
    if (state.step <= 2) {
      navigate("/");
      return;
    }
    dispatch({ type: "SET_STEP", step: state.step - 1 });
  };

  return (
    <div className="min-h-screen bg-ivory pb-40">
      <AppHeader kicker={museum.name} />
      <ProgressBar step={step} />
      {state.view === "edit" && state.step !== 4 && state.step !== 5 ? (
        <div className="border-b border-line bg-paper/80">
          <div className="mx-auto flex max-w-[1480px] items-end justify-between px-5 py-5 xl:px-8">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-warm">
                {museum.periodLabel}
              </p>
              <h1 className="mt-1 font-serif text-2xl text-navy md:text-3xl">
                {museum.name}
              </h1>
            </div>
            <p className="hidden text-xs text-warm md:block">자동 저장됨</p>
          </div>
        </div>
      ) : null}

      {state.view === "preview" ? <ExhibitionPreview /> : null}
      {state.view === "result" ? <ExhibitionResult /> : null}
      {state.view === "edit" && state.step === 2 ? <ExhibitionTheme /> : null}
      {state.view === "edit" && state.step === 3 ? <ArtifactLibrary /> : null}
      {state.view === "edit" && state.step === 4 ? <ExhibitionEditor /> : null}
      {state.view === "edit" && state.step === 5 ? <RouteEditor /> : null}
      {state.view === "edit" && state.step === 6 ? <AICurator /> : null}

      {state.view === "edit" ? (
        <div
          className={
            state.step === 6
              ? "border-t border-line bg-paper/95"
              : "fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-paper/95"
          }
        >
          <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 py-3 xl:px-8">
            <button
              type="button"
              onClick={goPrev}
              className="btn btn-ghost"
            >
              ← 이전
            </button>
            <Link to="/" className="text-xs text-warm">
              처음으로
            </Link>
            {state.view === "edit" ? (
              <button
                type="button"
                onClick={goNext}
                className="btn btn-primary"
              >
                {state.step === 6 ? "전시 보기" : "다음 →"}
              </button>
            ) : (
              <span />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
