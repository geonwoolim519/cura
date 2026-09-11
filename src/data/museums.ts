import type { MuseumMode } from "@/types/exhibition";
import { wikiThumb } from "@/lib/wiki";

export interface MuseumInfo {
  id: MuseumMode;
  name: string;
  headline: string;
  cardText: string;
  interiorText: string;
  image: string;
  imageFile: string;
  periodLabel: string;
}

export const museums: Record<MuseumMode, MuseumInfo> = {
  gongju: {
    id: "gongju",
    name: "국립공주박물관",
    headline: "백제의 이야기를\n당신만의 전시로 만들어보세요.",
    cardText: "백제의 역사와 문화유산을 바탕으로\n나만의 전시를 만들어보세요.",
    interiorText: "백제의 역사와 문화를 따라\n당신만의 전시를 만들어보세요.",
    image: wikiThumb("Gongju National Museum 01.jpg", 1400),
    imageFile: "Gongju National Museum 01.jpg",
    periodLabel: "백제 · 충청",
  },
  gimhae: {
    id: "gimhae",
    name: "국립김해박물관",
    headline: "가야의 이야기를\n당신만의 전시로 만들어보세요.",
    cardText: "가야의 역사와 문화유산을 바탕으로\n나만의 전시를 만들어보세요.",
    interiorText: "가야의 역사와 문화를 따라\n당신만의 전시를 만들어보세요.",
    image: wikiThumb("Gimhae national museum2.jpg", 1400),
    imageFile: "Gimhae national museum2.jpg",
    periodLabel: "가야 · 영남",
  },
  free: {
    id: "free",
    name: "자유주제",
    headline: "당신이 상상하는 전시를 만들어보세요.",
    cardText: "시대와 지역의 제한 없이\n나만의 전시를 만들어보세요.",
    interiorText: "시대와 지역의 제한 없이\n당신만의 전시를 구성할 수 있습니다.",
    image: wikiThumb("National Museum of Korea.jpg", 1400),
    imageFile: "National Museum of Korea.jpg",
    periodLabel: "선사부터 조선까지",
  },
};

export const themePresets: Record<
  MuseumMode,
  { title: string; theme: string; description: string }[]
> = {
  gongju: [
    {
      title: "무령왕의 삶과 죽음",
      theme: "웅진 백제 왕실의 권위는 어떻게 장례로 표현되었는가?",
      description:
        "무령왕릉 출토 유물을 따라 백제 왕의 삶과 죽음, 그리고 왕실 의례를 구성한다.",
    },
    {
      title: "백제의 금속공예",
      theme: "금과 동은 백제 사람들의 권위와 미감을 어떻게 만들었는가?",
      description:
        "관식, 귀걸이, 거울 등 금속유물을 중심으로 백제의 기술과 미학을 살펴본다.",
    },
    {
      title: "웅진 백제의 문화",
      theme: "공주에서 꽃핀 백제의 정치와 신앙, 생활은 어떤 모습이었을까?",
      description:
        "왕실 유물과 불교 조각, 토기를 함께 놓아 웅진 시기 백제의 문화를 조망한다.",
    },
  ],
  gimhae: [
    {
      title: "철의 왕국 가야",
      theme: "철은 어떻게 가야를 하나의 사회로 만들었는가?",
      description:
        "갑옷, 칼, 말갑옷 등 철기를 통해 가야의 생산력과 군사 문화를 구성한다.",
    },
    {
      title: "가야인의 생활",
      theme: "무덤 속 물건은 가야인의 일상을 어떻게 말해 주는가?",
      description:
        "토기와 장신구, 생활 용기를 통해 가야 사람들의 삶과 의례를 살펴본다.",
    },
    {
      title: "가야와 교역",
      theme: "가야는 무엇을 주고받으며 세계를 만났는가?",
      description:
        "유리기, 청동솥, 배모양토기 등을 통해 가야의 교역과 교류를 조명한다.",
    },
  ],
  free: [
    {
      title: "금속으로 보는 한국사",
      theme: "금속은 한국인의 삶을 어떻게 변화시켰을까?",
      description:
        "시대별 금속문화유산을 통해 한국의 기술과 생활문화를 살펴본다.",
    },
    {
      title: "한국인의 아름다움",
      theme: "장신구와 도자는 어떤 미감을 남겼는가?",
      description:
        "금관, 귀걸이, 청자, 백자를 나란히 놓아 한국 미의 결을 따라간다.",
    },
    {
      title: "전쟁과 문화유산",
      theme: "무기와 갑옷은 갈등 너머 어떤 기술을 남겼는가?",
      description:
        "칼, 갑옷, 마구를 중심으로 전쟁과 기술이 남긴 문화유산을 전시한다.",
    },
  ],
};
