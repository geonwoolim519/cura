import type { MuseumMode } from "@/types/exhibition";
import { wikiThumb } from "@/lib/wiki";

export interface ThemePreset {
  title: string;
  theme: string;
  description: string;
  imageFile: string;
  image: string;
  keywords: string[];
}

export interface MuseumInfo {
  id: MuseumMode;
  name: string;
  shortName: string;
  headline: string;
  cardText: string;
  interiorText: string;
  image: string;
  imageFile: string;
  periodLabel: string;
  country: "kr" | "world";
  region: string;
  tags: string[];
  group: "korea" | "world" | "free";
  objectLabel: string;
  accent: string;
}

function theme(
  title: string,
  themeText: string,
  description: string,
  imageFile: string,
  keywords: string[] = [],
): ThemePreset {
  return {
    title,
    theme: themeText,
    description,
    imageFile,
    image: wikiThumb(imageFile, 900),
    keywords,
  };
}

export const museums: Record<MuseumMode, MuseumInfo> = {
  gongju: {
    id: "gongju",
    name: "국립공주박물관",
    shortName: "공주",
    headline: "백제 웅진기의 역사와 문화유산을\n바탕으로 나만의 전시를 만들어보세요.",
    cardText:
      "백제 웅진기의 역사와 문화유산을 바탕으로 나만의 전시를 만들어보세요.",
    interiorText:
      "무령왕릉과 웅진 백제의 유물을 따라 왕실·금속공예·생활의 전시를 구성해 보세요.",
    image: wikiThumb("Gongju National Museum 01.jpg", 1400),
    imageFile: "Gongju National Museum 01.jpg",
    periodLabel: "백제 · 웅진",
    country: "kr",
    region: "충청",
    tags: ["백제", "웅진", "왕실문화"],
    group: "korea",
    objectLabel: "유물",
    accent: "#8b5a3c",
  },
  gimhae: {
    id: "gimhae",
    name: "국립김해박물관",
    shortName: "김해",
    headline: "가야의 철과 바다, 교류의 역사를\n당신만의 전시로 만들어보세요.",
    cardText: "가야의 역사와 문화유산을 바탕으로 나만의 전시를 만들어보세요.",
    interiorText:
      "철기·토기·교역품을 배치하며 가야 사회의 생산과 교류를 전시로 풀어 보세요.",
    image: wikiThumb("Gimhae national museum2.jpg", 1400),
    imageFile: "Gimhae national museum2.jpg",
    periodLabel: "가야 · 영남",
    country: "kr",
    region: "영남",
    tags: ["가야", "철의 문화", "교류"],
    group: "korea",
    objectLabel: "유물",
    accent: "#3d5a4c",
  },
  gyeongju: {
    id: "gyeongju",
    name: "국립경주박물관",
    shortName: "경주",
    headline: "신라의 황금과 불교, 천년 왕경의 이야기를\n전시로 구성해 보세요.",
    cardText: "신라의 역사와 문화유산을 바탕으로 나만의 전시를 만들어보세요.",
    interiorText:
      "금관과 불교 조각, 토기를 통해 신라 왕실과 신앙의 공간을 설계해 보세요.",
    image: wikiThumb("Korea-Gyeongju.National.Museum-02.jpg", 1400),
    imageFile: "Korea-Gyeongju.National.Museum-02.jpg",
    periodLabel: "신라 · 경주",
    country: "kr",
    region: "경주",
    tags: ["신라", "황금문화", "불교"],
    group: "korea",
    objectLabel: "유물",
    accent: "#b0892e",
  },
  chuncheon: {
    id: "chuncheon",
    name: "국립춘천박물관",
    shortName: "춘천",
    headline: "약 10만 년 전부터 이어진 강원의 역사를\n당신만의 전시로 만들어보세요.",
    cardText:
      "약 10만 년 전부터 이어진 강원의 역사와 선사·고대·중세·근세의 문화유산을 만나보세요.",
    interiorText:
      "선사에서 근세까지, 삼국이 만난 길목과 산·바다의 불교문화를 따라 강원의 시간을 전시로 구성해 보세요.",
    image: wikiThumb("국립춘천박물관 정면.jpg", 1400),
    imageFile: "국립춘천박물관 정면.jpg",
    periodLabel: "강원의 역사",
    country: "kr",
    region: "강원",
    tags: ["강원", "선사", "불교문화"],
    group: "korea",
    objectLabel: "유물",
    accent: "#4d5c4a",
  },
  jeju: {
    id: "jeju",
    name: "국립제주박물관",
    shortName: "제주",
    headline: "바다와 선사, 탐라의 삶을\n개방적인 전시로 풀어 보세요.",
    cardText: "제주의 역사와 문화를 바탕으로 나만의 전시를 만들어보세요.",
    interiorText:
      "선사 유물과 해양 문화, 생활 자료를 배치해 제주의 시간을 구성해 보세요.",
    image: wikiThumb("Jeju Island 20141129 08.jpg", 1400),
    imageFile: "Jeju Island 20141129 08.jpg",
    periodLabel: "제주 · 해양문화",
    country: "kr",
    region: "제주",
    tags: ["제주", "선사문화", "해양문화"],
    group: "korea",
    objectLabel: "유물",
    accent: "#3d7ea6",
  },
  met: {
    id: "met",
    name: "The Metropolitan Museum of Art",
    shortName: "The Met",
    headline: "세계의 미술과 고대 문명을\n당신만의 전시로 큐레이션해 보세요.",
    cardText: "세계의 문화유산과 미술을 바탕으로 나만의 전시를 만들어보세요.",
    interiorText:
      "이집트·그리스·로마·유럽 미술의 공개 소장품으로 세계 미술의 방을 구성해 보세요.",
    image: wikiThumb("Metropolitan Museum of Art entrance NYC.JPG", 1400),
    imageFile: "Metropolitan Museum of Art entrance NYC.JPG",
    periodLabel: "세계 · 미술",
    country: "world",
    region: "뉴욕",
    tags: ["이집트", "그리스·로마", "유럽미술"],
    group: "world",
    objectLabel: "작품",
    accent: "#1d3557",
  },
  free: {
    id: "free",
    name: "자유주제",
    shortName: "자유",
    headline: "시대와 지역의 제한 없이\n당신이 상상하는 전시를 만들어보세요.",
    cardText: "시대와 지역의 제한 없이 나만의 전시를 만들어보세요.",
    interiorText:
      "여러 박물관의 공개 문화유산을 넘나들며 당신만의 질문을 전시로 만들어 보세요.",
    image: wikiThumb("National Museum of Korea.jpg", 1400),
    imageFile: "National Museum of Korea.jpg",
    periodLabel: "선사부터 세계까지",
    country: "kr",
    region: "한국·세계",
    tags: ["자유주제", "비교전시", "아카이브"],
    group: "free",
    objectLabel: "전시품",
    accent: "#0b2545",
  },
};

export const featuredMuseums: MuseumMode[] = [
  "gongju",
  "gimhae",
  "gyeongju",
  "chuncheon",
  "jeju",
];

export const themePresets: Record<MuseumMode, ThemePreset[]> = {
  gongju: [
    theme(
      "무령왕과 왕릉",
      "웅진 백제 왕실의 권위는 어떻게 장례로 표현되었는가?",
      "무령왕릉 출토 유물을 따라 백제 왕의 삶과 죽음, 왕실 의례를 구성한다.",
      "무령왕릉 석수.jpg",
    ),
    theme(
      "백제의 금속공예",
      "금과 동은 백제 사람들의 권위와 미감을 어떻게 만들었는가?",
      "관식, 귀걸이, 거울 등 금속유물을 중심으로 백제의 기술과 미학을 살펴본다.",
      "무령왕 금제관식.jpg",
    ),
    theme(
      "웅진 백제의 생활",
      "공주에서 꽃핀 백제의 정치와 신앙, 생활은 어떤 모습이었을까?",
      "왕실 유물과 불교 조각, 토기를 함께 놓아 웅진 시기 백제의 문화를 조망한다.",
      "Jar.Stoneware.Baekje kingdom.Gongju National Museum.jpg",
    ),
  ],
  gimhae: [
    theme(
      "철의 왕국, 가야",
      "철은 어떻게 가야를 하나의 사회로 만들었는가?",
      "갑옷, 칼, 말갑옷 등 철기를 통해 가야의 생산력과 군사 문화를 구성한다.",
      "Gaya amour(5th c).jpg",
    ),
    theme(
      "가야인의 생활",
      "무덤 속 물건은 가야인의 일상을 어떻게 말해 주는가?",
      "토기와 장신구, 생활 용기를 통해 가야 사람들의 삶과 의례를 살펴본다.",
      "Jar, pedestal.Gaya.Gimhae National Museum.jpg",
    ),
    theme(
      "바다를 건넌 가야",
      "가야는 무엇을 주고받으며 세계를 만났는가?",
      "유리기, 청동솥, 배모양토기 등을 통해 가야의 교역과 교류를 조명한다.",
      "Gaya Confederacy Pottery Boat (17972191906).jpg",
    ),
  ],
  gyeongju: [
    theme(
      "신라의 황금문화",
      "금관과 장신구는 신라 왕실의 권위를 어떻게 보여 주었는가?",
      "금관과 귀걸이, 허리띠를 중심으로 신라 황금공예의 상징 체계를 구성한다.",
      "Gold Crown of Silla Kingdom 01b.jpg",
    ),
    theme(
      "신라와 불교",
      "신앙은 천년 왕경의 공간을 어떻게 바꾸었는가?",
      "불상과 범종, 사찰 관련 유물을 통해 신라 불교의 시각 문화를 살펴본다.",
      "Pensive Bodhisattva (National Treasure No. 78) 01.jpg",
    ),
    theme(
      "천년왕국 신라의 일상",
      "왕경 사람들의 생활과 의례는 어떤 물건에 남아 있는가?",
      "토기와 기마 인물형 토기 등을 통해 신라의 일상과 내세관을 조명한다.",
      "Duck-shaped pottery 오리형 토기.jpg",
    ),
  ],
  chuncheon: [
    theme(
      "10만 년의 시간, 강원의 역사",
      "사람이 살기 시작한 땅에서 철기시대까지",
      "구석기부터 철기시대까지, 강원에서 살아온 사람들의 생활과 문화를 따라가 봅니다.",
      "국립춘천박물관 내부.jpg",
      ["구석기", "신석기", "청동기", "철기", "정착", "생활", "선사", "주먹도끼", "토기"],
    ),
    theme(
      "삼국이 만난 땅, 강원",
      "고구려·백제·신라가 오간 전략적 길목",
      "북한강과 남한강, 동해안을 따라 고구려·백제·신라의 문화가 만난 강원의 역사를 전시합니다.",
      "국립춘천박물관 전시 철불.jpg",
      ["고구려", "백제", "신라", "교통로", "영서", "영동", "통일신라", "삼국"],
    ),
    theme(
      "강원의 불교문화, 산과 바다에 피어나다",
      "신라부터 고려까지 이어진 강원의 불교문화",
      "오대산과 금강산, 낙산사와 원주를 중심으로 강원에서 발전한 불교문화와 불교미술을 살펴봅니다.",
      "국립춘천박물관 소장 나한상 1.jpg",
      ["불교", "불상", "사찰", "오대산", "금강산", "낙산사", "원주", "고려", "나한"],
    ),
  ],
  jeju: [
    theme(
      "제주 사람들의 삶",
      "돌과 토기는 제주 사람들의 생활을 어떻게 기억하는가?",
      "생활 용기와 석조 자료를 통해 섬 공동체의 일상을 구성한다.",
      "朝鲜童子石.jpg",
    ),
    theme(
      "바다와 제주",
      "바다는 제주의 이동과 생업을 어떻게 만들었는가?",
      "해양과 교류의 흔적이 남은 자료를 따라 제주의 바다를 전시한다.",
      "Jeju Island 20141129 08.jpg",
    ),
    theme(
      "제주 선사문화",
      "선사 제주의 사람들은 어떤 도구로 섬을 살았는가?",
      "석기와 토기를 통해 제주의 오랜 거주 역사를 살펴본다.",
      "Comb-pattern Pottery. Suga-ri, Gimhae. Gimhae National Museum.jpg",
    ),
  ],
  met: [
    theme(
      "고대 이집트의 세계",
      "사후와 신성, 왕권은 이집트 미술에서 어떻게 조형되었는가?",
      "조각과 관, 신전 건축을 통해 나일 문명의 시각 세계를 구성한다.",
      "Temple of Dendur, Metropolitan Museum of Art, New York City NY.jpg",
    ),
    theme(
      "신과 영웅 — 그리스·로마",
      "신화는 대리석과 도자기 위에서 어떻게 이야기가 되었는가?",
      "조각과 항아리, 신화 도상을 따라 고전 세계의 영웅과 신을 전시한다.",
      "Marble statue of a kouros (youth) MET DP118539.jpg",
    ),
    theme(
      "유럽 미술과 인간",
      "회화와 조각은 인간을 어떻게 바라보았는가?",
      "유럽의 회화와 장식미술을 통해 인물·공간·일상의 재현을 살펴본다.",
      "Johannes Vermeer - Young Woman with a Water Pitcher - Google Art Project.jpg",
    ),
  ],
  free: [
    theme(
      "금속으로 보는 한국사",
      "금속은 한국인의 삶을 어떻게 변화시켰을까?",
      "시대별 금속문화유산을 통해 한국의 기술과 생활문화를 살펴본다.",
      "무령왕 금제관식.jpg",
    ),
    theme(
      "한국인의 아름다움",
      "장신구와 도자는 어떤 미감을 남겼는가?",
      "금관, 귀걸이, 청자, 백자를 나란히 놓아 한국 미의 결을 따라간다.",
      "White Porcelain Moon Jar (National Treasure No. 262) 03.jpg",
    ),
    theme(
      "세계와 마주한 유물",
      "교류는 물건의 형태를 어떻게 바꾸었는가?",
      "한반도 유물과 세계 미술을 비교하며 이동과 만남의 전시를 만든다.",
      "Metropolitan Museum of Art entrance NYC.JPG",
    ),
  ],
};

export function objectLabel(mode: MuseumMode | null): string {
  if (!mode) return "전시품";
  return museums[mode].objectLabel;
}
