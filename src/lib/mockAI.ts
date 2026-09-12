import { artifactsForMode, getArtifact } from "@/data/artifacts";
import type {
  AIEvaluation,
  Artifact,
  ExhibitionState,
  ScoreSet,
  VisitorPerspective,
} from "@/types/exhibition";

function clamp(n: number, min = 58, max = 96): number {
  return Math.round(Math.min(max, Math.max(min, n)));
}

function tokenize(...texts: string[]): string[] {
  return texts
    .join(" ")
    .toLowerCase()
    .split(/[^0-9a-zA-Z가-힣]+/)
    .filter((t) => t.length >= 2);
}

export function evaluateExhibition(state: ExhibitionState): AIEvaluation {
  const mode = state.museumMode ?? "free";
  const selected = state.selectedArtifactIds
    .map((id) => getArtifact(id))
    .filter(Boolean);
  const placed = state.placedArtifacts
    .map((item) => ({
      ...item,
      artifact: getArtifact(item.artifactId),
    }))
    .filter((item) => item.artifact);

  const textTokens = new Set(
    tokenize(state.title, state.theme, state.description),
  );
  const artifactTokens = new Set(
    selected.flatMap((a) =>
      tokenize(
        a!.name,
        a!.period,
        a!.category,
        a!.material,
        a!.keywords.join(" "),
        (a!.themes ?? []).join(" "),
        a!.description,
      ),
    ),
  );

  let overlap = 0;
  textTokens.forEach((t) => {
    if (artifactTokens.has(t)) overlap += 1;
  });
  const overlapRatio =
    textTokens.size === 0 ? 0.35 : overlap / Math.max(4, textTokens.size);

  const periods = new Set(placed.map((p) => p.artifact!.period));
  const categories = new Set(placed.map((p) => p.artifact!.category));

  let themeConnection = 62 + overlapRatio * 38;
  if (placed.length === 0) themeConnection -= 18;
  if (mode !== "free" && mode !== "chuncheon" && periods.size > 2) {
    themeConnection -= 6;
  }
  if (state.title && state.theme) themeConnection += 4;

  let composition = 60;
  if (placed.length >= 3 && placed.length <= 8) composition += 16;
  else if (placed.length === 2) composition += 6;
  else if (placed.length > 10) composition -= 8;
  if (state.panels.length >= 1) composition += 8;
  if (state.panels.some((p) => p.kind === "title")) composition += 4;
  if (categories.size >= 2) composition += 6;

  const xs = placed.map((p) => p.x);
  const spread = xs.length > 1 ? Math.max(...xs) - Math.min(...xs) : 0;
  if (spread > 280) composition += 4;
  const ys = placed.map((p) => p.y);
  const spreadY = ys.length > 1 ? Math.max(...ys) - Math.min(...ys) : 0;
  if (spreadY < 80 && placed.length >= 3) composition -= 6;
  if (spread < 180 && placed.length >= 4) composition -= 5;

  let clustered = 0;
  for (let i = 0; i < placed.length; i += 1) {
    for (let j = i + 1; j < placed.length; j += 1) {
      const dist = Math.hypot(placed[i].x - placed[j].x, placed[i].y - placed[j].y);
      if (dist < 90) clustered += 1;
    }
  }
  if (clustered > 0) composition -= Math.min(10, clustered * 3);

  let routeScore = 58;
  const routeIds = state.route.filter((id) =>
    placed.some((p) => p.instanceId === id),
  );
  if (placed.length > 0) {
    const coverage = routeIds.length / placed.length;
    routeScore += coverage * 24;
  }
  if (routeIds.length >= 3) {
    const pts = routeIds
      .map((id) => placed.find((p) => p.instanceId === id))
      .filter(Boolean);
    let orderly = 0;
    for (let i = 1; i < pts.length; i += 1) {
      const dx = pts[i]!.x - pts[i - 1]!.x;
      const dy = pts[i]!.y - pts[i - 1]!.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 420) orderly += 1;
    }
    routeScore += (orderly / Math.max(1, pts.length - 1)) * 12;
  }
  if (routeIds.length === 0 && placed.length > 0) routeScore -= 10;

  let information = 60;
  const descLen = state.description.trim().length;
  if (descLen > 40) information += 8;
  if (descLen > 90) information += 6;
  information += Math.min(12, state.panels.length * 5);
  const panelText = state.panels.reduce(
    (sum, p) => sum + p.title.length + p.body.length,
    0,
  );
  if (panelText > 40) information += 8;
  if (placed.length > 0 && state.panels.length === 0) information -= 8;

  let experience = 64;
  if (placed.length >= 4) experience += 8;
  if (categories.size >= 3) experience += 6;
  if (state.panels.length >= 2) experience += 6;
  if (routeIds.length >= placed.length && placed.length >= 3) experience += 8;
  if (placed.length < 2) experience -= 12;

  const routeArtifacts = routeIds
    .map((id) => placed.find((p) => p.instanceId === id)?.artifact)
    .filter(Boolean) as Artifact[];
  const chuncheon =
    mode === "chuncheon"
      ? chuncheonFeedback(
          state,
          placed.map((p) => p.artifact!),
          routeArtifacts,
        )
      : null;
  if (chuncheon) {
    themeConnection += chuncheon.themeDelta;
    routeScore += chuncheon.routeDelta;
  }

  const scores: ScoreSet = {
    themeConnection: clamp(themeConnection),
    composition: clamp(composition),
    route: clamp(routeScore),
    information: clamp(information),
    experience: clamp(experience),
    overall: 0,
  };
  scores.overall = clamp(
    scores.themeConnection * 0.24 +
      scores.composition * 0.22 +
      scores.route * 0.2 +
      scores.information * 0.18 +
      scores.experience * 0.16,
  );

  const periodLabel =
    mode === "gongju"
      ? "백제"
      : mode === "gimhae"
        ? "가야"
        : mode === "gyeongju"
          ? "신라"
          : mode === "chuncheon"
            ? "강원"
            : mode === "jeju"
              ? "제주"
              : mode === "met"
                ? "세계 미술"
                : "한국사";
  const names = placed.slice(0, 3).map((p) => p.artifact!.name);

  const reasons: AIEvaluation["reasons"] = {
    themeConnection:
      overlapRatio > 0.35
        ? `선택한 유물들이 ‘${state.title || "현재 전시"}’의 주제와 전반적으로 잘 연결되어 있습니다. ${names[0] ? `특히 ${names.join(", ")} 등은 주제어와 맞닿아 있습니다.` : ""}`
        : `주제 문장과 유물 사이의 연결이 아직 느슨해 보입니다. 관람객이 ${periodLabel}의 어떤 질문을 따라가야 하는지, 제목과 유물 설명을 조금 더 맞추면 이해가 쉬워질 수 있습니다.`,
    composition:
      placed.length < 3
        ? "현재 전시 밀도는 다소 낮습니다. 이야기를 받쳐 줄 유물이나 설명 패널을 한두 점 더하면 공간이 비어 보이지 않을 수 있습니다."
        : placed.length > 9
          ? "유물이 많아 시선이 분산될 수 있습니다. 핵심 유물을 남기고 나머지를 보조 전시로 낮추면 구성이 또렷해질 수 있습니다."
          : `유물 ${placed.length}점과 패널 ${state.panels.length}점이 공간을 나누고 있습니다. 벽면과 중앙의 역할이 나뉘면 관람객이 전시 구조를 더 쉽게 읽을 수 있습니다.`,
    route:
      routeIds.length < Math.max(2, placed.length)
        ? "관람 동선이 아직 모든 전시품을 감싸지 않습니다. 입구에서 핵심 유물로 이어지는 순서를 정하면 관람객이 길을 잃지 않습니다."
        : clustered > 0
          ? "동선은 연결되어 있으나 유물이 한곳에 모여 있습니다. 벽면과 중앙을 나눠 쓰면 시선이 한곳에 머물지 않습니다."
          : spread < 180 && placed.length >= 4
            ? "동선이 짧고 공간이 충분히 쓰이지 않습니다. 입구에서 출구까지 전시품 사이 거리를 조금 더 벌려 보세요."
            : "동선은 대체로 연결되어 있습니다. 다만 유물 간 시대적 흐름이 한눈에 들어오도록, 도입 → 핵심 → 여운 순을 고려해 볼 수 있습니다.",
    information:
      state.panels.length === 0
        ? "유물 자체는 강하지만, 공간에 설명 패널이 없어 정보가 유물 카드에만 머무를 수 있습니다. 주제 문장을 짧은 패널로 벽에 두면 전달력이 높아집니다."
        : "설명 패널이 주제를 받아 주고 있습니다. 문장을 더 짧게 나누거나, 처음 보는 관람객을 위한 한 줄 정의를 앞에 두면 정보가 더 잘 전달될 수 있습니다.",
    experience:
      scores.experience >= 80
        ? "관람객이 머무르며 비교할 거리가 있습니다. 동선 끝에서 주제를 한 문장으로 다시 짚어 주면 경험이 완성됩니다."
        : "지금은 유물을 ‘보는’ 전시에 가깝습니다. 비교 가능한 두 점, 또는 만져볼 수 없는 유물 대신 제작 과정을 설명하는 패널이 있으면 경험이 풍부해질 수 있습니다.",
  };

  if (chuncheon?.themeReason) reasons.themeConnection = chuncheon.themeReason;
  if (chuncheon?.routeReason) reasons.route = chuncheon.routeReason;

  const visitorNotes: Record<VisitorPerspective, string> = {
    general:
      placed.length < 3
        ? "일반 관람객은 아직 이야기의 시작을 찾기 어려울 수 있습니다. 입구 가까이 주제 패널과 대표 유물 한 점을 두면 첫인상이 분명해집니다."
        : `일반 관람객은 ‘${state.title || "이 전시"}’라는 제목은 기억하지만, 유물 사이 관계를 스스로 연결해야 할 수 있습니다. 두 유물을 잇는 짧은 문장이 있으면 이해가 쉬워집니다.`,
    youth:
      mode === "chuncheon"
        ? "유물 설명이 길어 처음 보는 관람객에게는 어려울 수 있습니다. “이 주먹도끼는 누가 썼을까요?”, “나한상은 왜 서로 다른 얼굴을 하고 있을까요?”처럼 한 문장 질문을 패널에 두면 청소년도 전시에 머무를 수 있습니다."
        : "유물 설명이 다소 길어 처음 보는 관람객에게는 어려울 수 있습니다. 한 문장 질문(“이 금장식은 누가 썼을까요?”)을 패널에 두면 청소년도 전시에 머무를 수 있습니다.",
    foreign:
      mode === "met"
        ? "작품 제목은 이해되지만, 한국어만 있으면 외국인 관람객의 접근성이 떨어질 수 있습니다. 핵심 작품명 옆에 짧은 영문 설명을 두면 도움이 됩니다."
        : mode === "free"
        ? "외국인 관람객에게는 시대 이름만으로는 맥락이 부족할 수 있습니다. 전시 초반에 한반도 연표와 지역 이름을 함께 적으면 이해하기 쉬워질 수 있습니다."
        : mode === "chuncheon"
          ? "외국인 관람객에게는 ‘강원’과 영서·영동의 지리가 익숙하지 않을 수 있습니다. 전시 초반에 지도와 짧은 영문 지명(Gangwon, Yeongseo, Yeongdong)을 두면 이해하기 쉬워집니다."
          : `${periodLabel}에 대한 기본적인 설명을 전시 초반에 추가하면 이해하기 쉬워질 수 있습니다. 전시 제목은 이해하기 쉽지만 영어 설명이 제공되지 않아 접근성이 떨어질 수 있습니다.`,
    specialist:
      "역사 전공자에게는 출토지와 소장처, 제작 기법의 근거가 더 궁금해질 수 있습니다. 유물 옆에 출토 맥락을 한 줄씩 보강하면 전문 관람의 밀도가 높아집니다.",
  };

  const summary = `선택한 유물들이 ‘${state.theme || state.title || periodLabel}’라는 주제와 ${
    scores.themeConnection >= 80 ? "비교적 잘" : "부분적으로"
  } 연결되어 있습니다. ${reasons.route} AI는 정답을 대신 고르지 않습니다. 지금 구성에서 관람객이 길을 잃지 않도록, 동선과 설명의 리듬만 조금 다듬어 보시기를 권합니다.`;

  return {
    scores,
    summary,
    reasons,
    visitorNotes,
    createdAt: new Date().toISOString(),
  };
}

export function catalogHint(mode: ExhibitionState["museumMode"]): string {
  const count = artifactsForMode(mode ?? "free").length;
  return `현재 아카이브 ${count}점을 바탕으로 평가합니다.`;
}

function eraRank(period: string): number {
  if (/구석기/.test(period)) return 0;
  if (/신석기/.test(period)) return 1;
  if (/청동기/.test(period)) return 2;
  if (/철기/.test(period)) return 3;
  if (/통일신라/.test(period)) return 5;
  if (/고구려|백제|신라/.test(period)) return 4;
  if (/고려/.test(period)) return 6;
  if (/조선/.test(period)) return 7;
  return 5;
}

function chuncheonFeedback(
  state: ExhibitionState,
  artifacts: Artifact[],
  routeArtifacts: Artifact[],
): {
  themeDelta: number;
  routeDelta: number;
  themeReason?: string;
  routeReason?: string;
} {
  const title = `${state.title} ${state.theme} ${state.description}`;
  const blob = artifacts
    .map(
      (item) =>
        `${item.name} ${item.period} ${item.keywords.join(" ")} ${(item.themes ?? []).join(" ")} ${item.description}`,
    )
    .join(" ");
  let themeDelta = 0;
  let routeDelta = 0;
  let themeReason: string | undefined;
  let routeReason: string | undefined;

  const hasGoguryeo = /고구려/.test(blob);
  const hasBaekje = /백제/.test(blob);
  const hasSilla = /신라/.test(blob);
  const kingdoms = [hasGoguryeo, hasBaekje, hasSilla].filter(Boolean).length;

  if (/삼국/.test(title) && hasSilla && kingdoms < 2) {
    themeDelta -= 10;
    themeReason =
      "현재 전시는 신라 관련 유물의 비중이 높습니다. ‘삼국이 만난 강원’이라는 주제를 강화하려면 고구려·백제와 관련된 유물을 추가하거나 영서와 영동의 역사적 차이를 설명하는 패널을 배치해보세요.";
  } else if (/삼국/.test(title) && kingdoms >= 2) {
    themeDelta += 6;
    themeReason = `고구려·백제·신라가 강원에서 만난 흔적이 유물에 드러납니다. 영서와 영동의 길목을 패널로 한 줄 더 짚으면 ‘${state.title}’이 또렷해집니다.`;
  }

  if (
    /10만|선사|구석기/.test(title) &&
    !/구석기|신석기|청동기|철기|주먹도끼|빗살무늬/.test(blob)
  ) {
    themeDelta -= 8;
    themeReason =
      "‘10만 년의 시간’을 말하기에는 선사 석기·토기의 비중이 낮습니다. 구석기 주먹도끼나 신석기·청동기 토기를 입구 가까이에 두면 강원의 긴 시간이 읽히기 시작합니다.";
  }

  if (/불교/.test(title) && !/불|나한|보살|사찰|금강산/.test(blob)) {
    themeDelta -= 8;
    themeReason =
      "강원 불교문화를 말하기에는 불상·불화의 비중이 낮습니다. 창령사 나한이나 한송사지 보살, 금강산 신앙 자료를 중심에 두면 산과 바다의 불교가 드러납니다.";
  }

  if (routeArtifacts.length >= 3) {
    const ranks = routeArtifacts.map((item) => eraRank(item.period));
    let inversions = 0;
    for (let i = 1; i < ranks.length; i += 1) {
      if (ranks[i] < ranks[i - 1]) inversions += 1;
    }
    if (inversions >= 2) {
      routeDelta -= 8;
      routeReason =
        "동선이 시대 순과 어긋나 있습니다. 입구에서 선사 → 고대 → 중세 → 근세로 이어지면 강원의 시간이 더 잘 읽힙니다.";
    } else if (inversions === 0) {
      routeDelta += 4;
      routeReason =
        "동선이 선사에서 근세로 이어져 강원의 시간 흐름이 읽힙니다. 구간마다 짧은 섹션 제목을 두면 관람객이 시대를 놓치지 않습니다.";
    }
  }

  return { themeDelta, routeDelta, themeReason, routeReason };
}
