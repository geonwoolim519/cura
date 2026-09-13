import { initialExhibitionState, type ExhibitionState, type ExhibitionPanel } from "@/types/exhibition";

function place(
  ids: string[],
  pattern: "spread" | "cluster" | "chrono",
): ExhibitionState["placedArtifacts"] {
  return ids.map((artifactId, index) => {
    const x =
      pattern === "cluster"
        ? 420 + (index % 2) * 20
        : pattern === "chrono"
          ? 80 + index * 160
          : 70 + (index % 4) * 240;
    const y =
      pattern === "cluster"
        ? 260
        : pattern === "chrono"
          ? 120
          : 90 + Math.floor(index / 4) * 180;
    return {
      instanceId: `inst-${artifactId}`,
      artifactId,
      x,
      y,
      width: 132,
      height: 132,
      rotation: 0,
      displayOrder: index + 1,
      displayStyle: "pedestal" as const,
    };
  });
}

function panel(title: string, body: string, x = 80, y = 480): ExhibitionPanel {
  return {
    id: `panel-${title.slice(0, 8)}`,
    kind: "panel",
    title,
    body,
    x,
    y,
    width: 240,
    height: 150,
  };
}

function exhibition(
  partial: Partial<ExhibitionState> & Pick<ExhibitionState, "museumMode" | "title">,
): ExhibitionState {
  const ids = partial.selectedArtifactIds ?? [];
  const placed = partial.placedArtifacts ?? place(ids, "spread");
  return {
    ...initialExhibitionState,
    ...partial,
    theme: partial.theme ?? "",
    description: partial.description ?? "",
    selectedArtifactIds: ids,
    placedArtifacts: placed,
    route: partial.route ?? placed.map((item) => item.instanceId),
    panels: partial.panels ?? [],
    step: 6,
  };
}

export const curatorFixtures: Record<string, ExhibitionState> = {
  gongjuRoyal: exhibition({
    museumMode: "gongju",
    title: "무령왕과 왕릉",
    theme: "웅진 백제 왕실의 권위는 어떻게 장례로 표현되었는가?",
    description:
      "무령왕릉 출토 유물을 따라 백제 왕의 삶과 죽음, 왕실 의례를 구성한다.",
    selectedArtifactIds: [
      "gj-crown-king",
      "gj-seoksu",
      "gj-jiseok",
      "gj-coffin",
      "gj-earrings-king",
    ],
    placedArtifacts: place(
      ["gj-crown-king", "gj-seoksu", "gj-jiseok", "gj-coffin", "gj-earrings-king"],
      "spread",
    ),
    panels: [
      panel("왜 무령왕릉인가", "웅진 백제의 왕실 장례는 금공과 석수로 권위를 드러냈습니다."),
    ],
  }),
  gimhaeIron: exhibition({
    museumMode: "gimhae",
    title: "철의 왕국, 가야",
    theme: "철은 어떻게 가야를 하나의 사회로 만들었는가?",
    description: "갑옷, 칼, 말갑옷 등 철기를 통해 가야의 생산력과 군사 문화를 구성한다.",
    selectedArtifactIds: ["gh-armor", "gh-armor-helmet", "gh-swords", "gh-horse-armor", "gh-pedestal"],
    placedArtifacts: place(
      ["gh-armor", "gh-armor-helmet", "gh-swords", "gh-horse-armor", "gh-pedestal"],
      "spread",
    ),
    panels: [panel("철이 만든 사회", "가야의 갑옷과 무기는 생산과 교역의 힘을 보여 줍니다.")],
  }),
  gyeongjuGold: exhibition({
    museumMode: "gyeongju",
    title: "신라의 황금문화",
    theme: "금관과 장신구는 신라 왕실의 권위를 어떻게 보여 주었는가?",
    description: "금관과 귀걸이, 허리띠를 중심으로 신라 황금공예의 상징 체계를 구성한다.",
    selectedArtifactIds: ["gy-crown", "gy-earrings", "gy-belt", "gy-crown-ornament"],
    placedArtifacts: place(["gy-crown", "gy-earrings", "gy-belt", "gy-crown-ornament"], "spread"),
    panels: [panel("금의 언어", "신라 금관은 왕권을 눈에 보이는 형식으로 만들었습니다.")],
  }),
  chuncheonThreeKingdoms: exhibition({
    museumMode: "chuncheon",
    title: "삼국이 만난 땅, 강원",
    theme: "고구려·백제·신라가 오간 전략적 길목",
    description:
      "북한강과 남한강, 동해안을 따라 고구려·백제·신라의 문화가 만난 강원의 역사를 전시합니다.",
    selectedArtifactIds: [
      "chuncheon_005",
      "chuncheon_006",
      "chuncheon_007",
      "chuncheon_001",
    ],
    placedArtifacts: place(
      ["chuncheon_005", "chuncheon_006", "chuncheon_007", "chuncheon_001"],
      "chrono",
    ),
    panels: [
      panel(
        "강원은 왜 중요한 지역이었을까?",
        "영서와 영동을 잇는 길목에서 고구려·백제·신라가 만났습니다.",
      ),
    ],
  }),
  chuncheonSillaHeavy: exhibition({
    museumMode: "chuncheon",
    title: "삼국이 만난 땅, 강원",
    theme: "고구려·백제·신라가 오간 전략적 길목",
    description: "고구려·백제·신라가 강원 지역에서 만난 역사를 보여주는 전시",
    selectedArtifactIds: ["chuncheon_007", "chuncheon_008", "chuncheon_010"],
    placedArtifacts: place(["chuncheon_007", "chuncheon_008", "chuncheon_010"], "cluster"),
  }),
  jejuLife: exhibition({
    museumMode: "jeju",
    title: "제주 사람들의 삶",
    theme: "돌과 토기는 제주 사람들의 생활을 어떻게 기억하는가?",
    description: "생활 용기와 석조 자료를 통해 섬 공동체의 일상을 구성한다.",
    selectedArtifactIds: ["jj-stone-child", "jj-hareubang", "jj-onggi", "jj-comb"],
    placedArtifacts: place(["jj-stone-child", "jj-hareubang", "jj-onggi", "jj-comb"], "spread"),
    panels: [panel("섬의 하루", "제주 사람들의 생활은 돌과 그릇에 남아 있습니다.")],
  }),
  freeCustom: exhibition({
    museumMode: "free",
    title: "바다가 전한 기술",
    theme: "해상 교류는 물건의 형태를 어떻게 바꾸었는가?",
    description:
      "유리와 배, 바다를 건너온 기물을 비교하며 이동과 만남의 전시를 만든다.",
    selectedArtifactIds: ["gh-glass", "gy-glass", "gh-boat", "jj-boat"],
    placedArtifacts: place(["gh-glass", "gy-glass", "gh-boat", "jj-boat"], "spread"),
    panels: [panel("바다의 선물", "먼 바닷길에서 온 유리와 배 모양 토기가 교류를 증언합니다.")],
  }),
};
