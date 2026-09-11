import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import { museums } from "@/data/museums";
import { useExhibition } from "@/store/ExhibitionContext";
import { MuseumCard } from "./MuseumCard";

export function MuseumSelector() {
  const { dispatch } = useExhibition();
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-xs tracking-[0.28em] text-warm">VENUE</p>
      <h2 className="mt-3 font-serif text-3xl text-navy md:text-4xl">
        어디에서 전시를 만들어볼까요?
      </h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {(["gongju", "gimhae", "free"] as const).map((id) => (
          <MuseumCard
            key={id}
            museum={museums[id]}
            onSelect={() => {
              flushSync(() => {
                dispatch({ type: "SET_MUSEUM", mode: id });
              });
              navigate("/create");
            }}
          />
        ))}
      </div>
    </section>
  );
}
