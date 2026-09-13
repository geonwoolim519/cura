import type { MuseumMode } from "@/types/exhibition";
import { museums } from "@/data/museums";
import type { AnalysisMuseum } from "./types";

const EXTRA: Record<
  MuseumMode,
  { culture: string; description: string; keywords: string[] }
> = {
  gongju: {
    culture: "백제",
    description:
      "백제 웅진기의 역사와 문화유산을 다루는 박물관이다. 무령왕과 왕실, 금속공예가 핵심 맥락이다.",
    keywords: ["백제", "웅진", "무령왕", "왕실", "왕릉", "금속공예"],
  },
  gimhae: {
    culture: "가야",
    description:
      "가야의 철과 교역, 기마문화를 다루는 박물관이다. 철기·토기·해상교류가 핵심 맥락이다.",
    keywords: ["가야", "철", "교역", "기마", "토기", "해상교류"],
  },
  gyeongju: {
    culture: "신라",
    description:
      "신라 왕경과 황금문화, 불교를 다루는 박물관이다. 왕권과 생활문화가 핵심 맥락이다.",
    keywords: ["신라", "황금", "왕권", "불교", "금관", "왕경"],
  },
  chuncheon: {
    culture: "강원",
    description:
      "강원 지역의 선사부터 근세까지 역사와 문화유산을 다루는 박물관이다. 삼국의 교차와 영서·영동, 불교문화가 핵심 맥락이다.",
    keywords: [
      "강원",
      "선사",
      "고구려",
      "백제",
      "신라",
      "통일신라",
      "고려",
      "불교",
      "영서",
      "영동",
    ],
  },
  jeju: {
    culture: "제주",
    description:
      "제주 선사와 탐라, 해양문화와 제주인의 생활을 다루는 박물관이다.",
    keywords: ["제주", "선사", "탐라", "해양", "생활", "교역"],
  },
  met: {
    culture: "세계",
    description:
      "이집트·그리스·로마·유럽 미술의 공개 소장품을 다루는 미술관이다.",
    keywords: ["이집트", "그리스", "로마", "유럽", "미술"],
  },
  free: {
    culture: "비교",
    description:
      "시대와 지역의 제한 없이 여러 문화유산을 비교할 수 있는 자유 전시 모드다.",
    keywords: ["비교", "교류", "한국사", "세계"],
  },
};

export function museumAnalysisProfile(mode: MuseumMode): AnalysisMuseum {
  const info = museums[mode];
  const extra = EXTRA[mode];
  return {
    id: mode,
    name: info.name,
    culture: extra.culture,
    description: extra.description,
    keywords: extra.keywords,
  };
}
