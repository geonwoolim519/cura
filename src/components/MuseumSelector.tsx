import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import { featuredMuseums, museums } from "@/data/museums";
import { kicker, page } from "@/lib/layout";
import { useExhibition } from "@/store/ExhibitionContext";
import type { MuseumMode } from "@/types/exhibition";
import { MuseumCard } from "./MuseumCard";

export function MuseumSelector() {
  const { dispatch } = useExhibition();
  const navigate = useNavigate();

  const start = (id: MuseumMode) => {
    flushSync(() => {
      dispatch({ type: "SET_MUSEUM", mode: id });
    });
    navigate("/create");
  };

  return (
    <section id="museums" className={page + " py-16 md:py-20"}>
      <p className={kicker}>MUSEUM SELECTION</p>
      <h2 className="mt-3 max-w-3xl font-serif text-3xl leading-snug text-navy md:text-5xl">
        어떤 박물관에서
        <br />
        전시를 만들어볼까요?
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
        각 박물관의 문화유산과 소장품을 바탕으로 나만의 전시를 기획해보세요.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {featuredMuseums.map((id) => (
          <MuseumCard key={id} museum={museums[id]} onSelect={() => start(id)} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => start("free")}
        className="btn btn-outline mt-8"
      >
        + 자유주제
      </button>
    </section>
  );
}
