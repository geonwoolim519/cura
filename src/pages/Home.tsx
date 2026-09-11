import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Curi } from "@/components/Curi";
import { MuseumSelector } from "@/components/MuseumSelector";
import { museums } from "@/data/museums";
import { wikiThumb } from "@/lib/wiki";
import { kicker, page } from "@/lib/layout";
import { loadHistory } from "@/lib/storage";
import { useExhibition } from "@/store/ExhibitionContext";
import { STEPS } from "@/types/exhibition";
import {
  Landmark,
  Library,
  LayoutGrid,
  Route,
  Sparkles,
  CheckCircle2,
  Compass,
} from "lucide-react";

const HERO_BG = wikiThumb("Korea-Gyeongju.National.Museum-04.jpg", 1800);

const ICONS = [Landmark, Compass, Library, LayoutGrid, Route, Sparkles, CheckCircle2];

export function Home() {
  const { state } = useExhibition();
  const canResume = Boolean(state.museumMode && state.step > 1);
  const history = loadHistory();

  return (
    <div className="min-h-screen bg-ivory">
      <AppHeader />
      <section className="relative overflow-hidden bg-navy text-ivory">
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt=""
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/88 to-navy/40" />
        </div>
        <div
          className={
            page +
            " relative grid min-h-[78vh] items-center gap-8 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-20"
          }
        >
          <div>
            <p className="text-xs tracking-[0.32em] text-teal">
              CURATE YOUR EXHIBITION
            </p>
            <h1 className="mt-6 font-serif text-4xl leading-tight md:text-6xl">
              당신이 큐레이터가 되어
              <br />
              하나의 전시를 만들어보세요.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-ivory/75">
              문화유산을 선택하고, 공간을 구성하고, 당신만의 이야기를 전시로
              만들어보세요. AI 큐레이터 큐리가 관람객의 시선으로 전시를 함께
              돌아봅니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#museums" className="btn btn-primary bg-ivory text-navy hover:bg-mist">
                전시 만들기 →
              </a>
              <a href="#museums" className="btn btn-secondary">
                유물 아카이브 보기
              </a>
              {canResume ? (
                <Link to="/create" className="btn btn-secondary">
                  저장한 전시 이어하기
                </Link>
              ) : null}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[520px]">
            <Curi pose="main" className="relative z-10 h-[420px] w-full md:h-[520px]" />
          </div>
        </div>
      </section>

      <MuseumSelector />

      <section id="how" className="border-y border-line bg-paper py-16">
        <div className={page}>
          <p className={kicker}>HOW IT WORKS</p>
          <h2 className="mt-3 font-serif text-3xl text-navy md:text-4xl">
            CURA로 전시를 만드는 7단계
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-7">
            {STEPS.map((step, index) => {
              const Icon = ICONS[index];
              return (
                <li key={step.id} className="relative border border-line bg-ivory p-4">
                  <span className="font-display text-sm text-navy">
                    {String(step.id).padStart(2, "0")}
                  </span>
                  <Icon className="mt-3 text-navy" size={18} />
                  <p className="mt-3 font-serif text-lg text-navy">{step.label}</p>
                  {index < STEPS.length - 1 ? (
                    <span className="absolute -right-3 top-8 hidden h-px w-6 bg-line md:block" />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section id="my-exhibitions" className={page + " py-16"}>
        <p className={kicker}>MY EXHIBITIONS</p>
        <h2 className="mt-3 font-serif text-3xl text-navy">최근 만든 전시</h2>
        {history.length === 0 && !canResume ? (
          <p className="mt-6 text-sm text-muted">
            아직 저장된 전시가 없습니다. 박물관을 선택해 첫 전시를 만들어 보세요.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {canResume && state.museumMode ? (
              <Link
                to="/create"
                className="border border-line bg-paper p-5 hover:border-navy"
              >
                <p className="text-[11px] tracking-[0.2em] text-warm">최근 작업</p>
                <h3 className="mt-2 font-serif text-2xl text-navy">
                  {state.title || "제목 없는 전시"}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {museums[state.museumMode].name}
                </p>
                <p className="mt-4 text-sm text-navy">
                  AI Score {state.aiEvaluation?.scores.overall ?? "–"}
                </p>
              </Link>
            ) : null}
            {history.map((item) => (
              <article key={item.id} className="border border-line bg-paper p-5">
                <p className="text-[11px] tracking-[0.2em] text-warm">저장됨</p>
                <h3 className="mt-2 font-serif text-2xl text-navy">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">
                  {museums[item.museumMode]?.name}
                </p>
                <p className="mt-4 text-sm text-navy">
                  AI Score {item.score ?? "–"} · 전시품 {item.artifactCount}점
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-navy py-16 text-ivory">
        <div className={page + " grid gap-10 md:grid-cols-[1.2fr_0.8fr]"}>
          <div>
            <p className="text-[11px] tracking-[0.28em] text-teal">ABOUT CURA</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              큐레이터의 생각을 경험하다.
            </h2>
            <p className="mt-6 max-w-2xl font-serif text-xl leading-9 text-ivory/90">
              CURA는 전시를 보여주는 서비스가 아니라, 전시를 만드는 과정을
              경험하게 합니다.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-ivory/70">
              유물을 고르고, 공간을 구성하고, 관람객의 동선을 설계하고, AI
              큐레이터의 시선으로 전시를 다시 바라봅니다.
            </p>
          </div>
          <Curi pose="wink" className="mx-auto h-56 w-56" />
        </div>
      </section>

      <footer className="border-t border-line px-6 py-10 text-center text-xs text-warm">
        Cura · 디지털헤리티지큐레이터양성과정 · 문화유산 이미지는 Wikimedia Commons
        공개 자료를 사용합니다.
      </footer>
    </div>
  );
}
