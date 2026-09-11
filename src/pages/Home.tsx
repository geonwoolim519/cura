import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Curi } from "@/components/Curi";
import { MuseumSelector } from "@/components/MuseumSelector";
import { asset } from "@/lib/asset";
import { useExhibition } from "@/store/ExhibitionContext";

export function Home() {
  const { state } = useExhibition();
  const canResume = Boolean(state.museumMode && state.step > 1);

  return (
    <div className="min-h-screen bg-ivory">
      <AppHeader kicker="디지털 헤리티지 큐레이터 양성과정" />
      <section className="relative overflow-hidden bg-navy text-ivory">
        <div className="absolute inset-0 opacity-40 museum-grid" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <p className="text-xs tracking-[0.32em] text-teal">
              DIGITAL MUSEUM STUDIO
            </p>
            <img
              src={asset("branding/logo.png")}
              alt="Cura"
              className="mt-6 h-24 w-24 object-contain"
            />
            <h1 className="mt-8 font-display text-6xl tracking-[0.12em] md:text-7xl">
              CURA
            </h1>
            <p className="mt-3 text-sm tracking-[0.28em] text-teal">
              CURATE YOUR EXHIBITION
            </p>
            <p className="mt-8 max-w-xl font-serif text-2xl leading-10 text-ivory/95 md:text-[28px]">
              당신이 큐레이터가 되어
              <br />
              하나의 전시를 만들어보세요.
            </p>
            <p className="mt-6 max-w-lg text-sm leading-7 text-ivory/70">
              문화유산을 고르고, 전시공간에 배치하고, 관람 동선을 설계합니다.
              AI 큐레이터 큐리가 관람객의 시선으로 전시를 함께 돌아봅니다.
            </p>
            {canResume ? (
              <Link
                to="/create"
                className="mt-8 inline-flex h-11 items-center bg-ivory px-5 text-sm text-navy"
              >
                저장한 전시 이어하기
              </Link>
            ) : null}
          </div>
          <div className="relative mx-auto w-[320px] md:w-[360px]">
            <div className="relative h-[380px] overflow-hidden md:h-[440px]">
              <div className="pointer-events-none absolute inset-6 z-10 border border-gold/40" />
              <Curi pose="main" className="h-full w-full" />
            </div>
            <p className="mt-3 text-center text-[11px] tracking-[0.2em] text-teal">
              AI CURATOR 큐리
            </p>
          </div>
        </div>
      </section>
      <MuseumSelector />
      <footer className="border-t border-line px-6 py-10 text-center text-xs text-warm">
        Cura MVP · 디지털헤리티지큐레이터양성과정 · 문화유산 이미지는 Wikimedia
        Commons 공개 자료를 사용합니다.
      </footer>
    </div>
  );
}
