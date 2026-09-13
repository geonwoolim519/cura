import type {
  CuratorCategoryScore,
  CuratorSuggestion,
  VisitorPerspective,
} from "@/types/exhibition";
import { artifactRelevance, themeKeywords } from "@/lib/themeRelevance";
import { getArtifact } from "@/data/artifacts";
import {
  clampScore,
  dominantShare,
  eraRank,
  joinNames,
  overlapRatio,
  themeIntent,
  tokenize,
  josa,
  withJosa,
} from "./text";
import type { AnalysisArtifact, ExhibitionAnalysisInput } from "./types";
import { CATEGORY_DEFS } from "./types";

export interface CuratorEngineResult {
  overallScore: number;
  summary: string;
  categories: CuratorCategoryScore[];
  strengths: string[];
  improvements: CuratorSuggestion[];
  curatorComment: string;
  visitorNotes: Record<VisitorPerspective, string>;
  visitorComment: string;
}

export function analyzeExhibition(input: ExhibitionAnalysisInput): CuratorEngineResult {
  const artifacts = input.artifacts;
  const placed = artifacts.filter((item) => item.x != null && item.y != null);
  const names = artifacts.map((item) => item.name);
  const nameList = joinNames(names);
  const title = input.exhibition.title.trim() || "제목 없는 전시";
  const topic = input.exhibition.topic.trim();
  const description = input.exhibition.description.trim();
  const intent = themeIntent(title, topic, description);
  const themeTokens = themeKeywords(
    input.museum.id,
    input.exhibition.title,
    input.exhibition.topic,
    input.exhibition.description,
  );
  const hay = artifacts
    .map(
      (item) =>
        `${item.name} ${item.period} ${item.culture} ${item.region} ${item.category} ${item.themes.join(" ")} ${item.description}`,
    )
    .join(" ")
    .toLowerCase();
  const overlap = overlapRatio(themeTokens, hay);
  const cultures = artifacts.map((item) => item.culture);
  const periods = artifacts.map((item) => item.period);
  const cultureDom = dominantShare(cultures);
  const periodDom = dominantShare(periods);
  const routeIds = input.route.filter((id) => id !== "entrance" && id !== "exit");
  const routeArtifacts = routeIds
    .map((id) => artifacts.find((item) => item.instanceId === id))
    .filter(Boolean) as AnalysisArtifact[];
  const explainPanels = input.panels.filter((p) => p.kind === "panel" || p.kind === "title");
  const panelText = explainPanels.map((p) => `${p.title} ${p.content}`).join(" ");
  const unplaced = input.selectedArtifactIds.length - placed.length;

  const theme = scoreTheme({
    title,
    topic,
    description,
    overlap,
    count: artifacts.length,
    nameList,
    museum: input.museum.culture,
  });
  const artifactScore = scoreArtifacts({
    artifacts,
    title,
    topic,
    intent,
    overlap,
    cultureDom,
    museum: input.museum,
    nameList,
  });
  const flow = scoreFlow({
    artifacts,
    routeArtifacts,
    intent,
    panelText,
    nameList,
    title,
  });
  const layout = scoreLayout({
    placed,
    routeIds,
    artifacts,
    overlap,
    themeTokens,
    panels: input.panels,
    unplaced,
    nameList,
  });
  const information = scoreInformation({
    description,
    panels: explainPanels,
    placedCount: placed.length,
    themeTokens,
    title,
    artifacts,
  });
  const visitor = scoreVisitor({
    perspective: input.visitorPerspective,
    artifacts,
    placed,
    panels: explainPanels,
    routeArtifacts,
    title,
    museum: input.museum,
    description,
    panelText,
  });

  const categories = [theme, artifactScore, flow, layout, information, visitor];
  const overallScore = categories.reduce((sum, item) => sum + item.score, 0);

  const strengths = categories
    .filter((item) => item.score / item.maxScore >= 0.72)
    .map((item) => item.strength)
    .slice(0, 3);
  if (strengths.length === 0 && nameList) {
    strengths.push(
      `현재 전시는 ${nameList} 등 제공된 유물을 바탕으로 이야기를 쌓고 있습니다.`,
    );
  }

  const improvements = pickImprovements(categories, {
    intent,
    cultureDom,
    title,
    museumId: input.museum.id,
    artifacts,
    explainPanels,
    placed,
  });

  const visitorNotes = visitorNotesFor(input, {
    artifacts,
    placed,
    explainPanels,
    panelText,
    title,
  });

  const summary = buildSummary(title, overallScore, categories, nameList);
  const curatorComment = buildComment(title, input.museum.culture, categories, nameList, intent);

  return {
    overallScore,
    summary,
    categories,
    strengths: strengths.slice(0, 3),
    improvements,
    curatorComment,
    visitorNotes,
    visitorComment: visitorNotes[input.visitorPerspective],
  };
}

function scoreTheme(args: {
  title: string;
  topic: string;
  description: string;
  overlap: number;
  count: number;
  nameList: string;
  museum: string;
}): CuratorCategoryScore {
  let score = 5;
  if (args.title.length >= 2) score += 3;
  if (args.title.length >= 8) score += 2;
  if (args.topic.length >= 8) score += 2;
  if (args.description.length >= 24) score += 2;
  if (args.description.length >= 70) score += 2;
  score += Math.round(args.overlap * 6);
  if (args.count === 0) score -= 7;
  if (!args.title || args.title === "제목 없는 전시") score -= 4;

  const strength = args.nameList
    ? `제목 ‘${args.title}’${josa(args.title, "이/가")} ${withJosa(args.nameList, "와/과")} 같은 방향으로 읽히기 시작합니다.`
    : `전시 제목이 ${args.museum}의 맥락을 먼저 제시하고 있습니다.`;
  const improvement = args.count === 0
    ? "주제를 뒷받침할 유물을 한두 점 고르면 핵심 메시지가 구체화됩니다."
    : args.overlap < 0.35
      ? "제목·설명의 주제어와 유물 설명이 더 맞닿도록 문장을 다듬거나, 주제를 받쳐 줄 유물을 보강해 보세요."
      : "관람객이 전시장에 들어왔을 때 한 문장으로 주제를 읽도록, 입구 제목 패널을 짧게 정리해 보세요.";
  const reason = args.count === 0
    ? `제목은 ‘${args.title}’이지만, 아직 주제를 증명할 유물이 없어 메시지가 추상적으로 남습니다.`
    : args.overlap >= 0.4
      ? `제목과 설명이 ${withJosa(args.nameList, "와/과")} 맞닿아, 관람객이 ${args.museum}의 어떤 질문을 따라가야 하는지 비교적 분명합니다.`
      : `‘${args.title}’이라는 질문은 있으나, 선택한 유물과의 연결이 느슨해 핵심 메시지가 한 번에 읽히지 않을 수 있습니다.`;

  return category("theme", score, reason, strength, improvement);
}

function scoreArtifacts(args: {
  artifacts: AnalysisArtifact[];
  title: string;
  topic: string;
  intent: ReturnType<typeof themeIntent>;
  overlap: number;
  cultureDom: { key: string; share: number; count: number };
  museum: ExhibitionAnalysisInput["museum"];
  nameList: string;
}): CuratorCategoryScore {
  const n = args.artifacts.length;
  let score = 6;
  if (n === 0) score = 3;
  else if (n === 1) score += 0;
  else if (n === 2) score += 2;
  else if (n === 3) score += 3;
  else if (n === 4) score += 4;
  else if (n >= 5 && n <= 8) score += 5;
  else if (n <= 10) score += 2;
  else score -= 2;

  score += Math.round(args.overlap * 7);
  const museumHay = `${args.title} ${args.topic} ${args.artifacts
    .map((item) => `${item.name} ${item.period} ${item.culture} ${item.themes.join(" ")} ${item.description}`)
    .join(" ")}`;
  const museumHits = args.museum.keywords.filter((key) => museumHay.includes(key)).length;
  if (museumHits >= 4) score += 2;
  else if (museumHits >= 2) score += 1;
  if (args.museum.id === "gimhae") {
    const iron = args.artifacts.filter((item) =>
      /철|갑옷|칼|말갑옷/.test(`${item.name} ${item.material} ${item.category}`),
    ).length;
    if (iron >= 3) score += 2;
  } else if (args.museum.id === "gyeongju") {
    const gold = args.artifacts.filter((item) => /금|관|귀걸이|허리띠/.test(item.name)).length;
    if (gold >= 3 && args.artifacts.length <= 4) score += 1;
  }

  const keywords = themeKeywords(args.museum.id, args.title, args.topic, "");
  const relevances = args.artifacts.map((item) => {
    const raw = getArtifact(item.id);
    return raw ? artifactRelevance(raw, keywords) : 0;
  });
  const avgRel = relevances.length
    ? relevances.reduce((a, b) => a + b, 0) / relevances.length
    : 0;
  if (avgRel >= 6) score += 2;

  if (args.intent === "diversity" && args.cultureDom.share >= 0.7 && n >= 3) {
    score -= 6;
  }
  if (args.intent === "focus" && args.cultureDom.share >= 0.6 && n >= 2) {
    score += 3;
  }
  if (
    args.museum.id === "gongju" &&
    /백제|무령|왕/.test(`${args.title} ${args.topic}`) &&
    args.cultureDom.key !== "백제" &&
    n >= 2
  ) {
    score -= 4;
  }
  if (args.museum.id === "chuncheon" && /삼국/.test(`${args.title} ${args.topic}`)) {
    const set = new Set(args.artifacts.map((a) => a.culture));
    const kingdoms = ["고구려", "백제", "신라", "통일신라"].filter((k) => set.has(k));
    if (kingdoms.length >= 3) score += 3;
    else if (kingdoms.length <= 1 && n >= 3) score -= 5;
  }

  const strength =
    args.intent === "focus" && args.cultureDom.share >= 0.6
      ? `${args.cultureDom.key} 관련 유물의 결이 분명해, 주제가 한쪽으로 흩어지지 않습니다.`
      : args.nameList
        ? `${withJosa(args.nameList, "이/가")} 주제의 뼈대를 이루고 있습니다.`
        : "유물 구성의 방향이 보이기 시작합니다.";

  let improvement =
    "주제를 받쳐 줄 유물을 한두 점 보강하면 구성의 설득력이 높아집니다.";
  if (args.intent === "diversity" && args.cultureDom.share >= 0.7) {
    improvement = `현재 ${args.cultureDom.key} 관련 유물의 비중이 높습니다. 다른 문화권 자료를 1~2점 더하면 주제의 균형이 살아납니다.`;
  } else if (n < 3) {
    improvement = "이야기를 받쳐 줄 유물을 한두 점 더하면 주제가 빈약해 보이지 않습니다.";
  } else if (n > 9) {
    improvement = "핵심 유물을 남기고 보조 전시를 줄이면 시선이 분산되지 않습니다.";
  }

  const reason =
    n === 0
      ? "선택한 유물이 없어 주제 적합성을 판단할 자료가 부족합니다. 제공된 정보만으로 구성을 단정하기 어렵습니다."
      : args.intent === "diversity" && args.cultureDom.share >= 0.7
        ? `선택한 유물 대부분이 ${args.cultureDom.key}와 관련되어 있습니다. ‘${args.title}’처럼 여러 문화가 만나는 주제라면 구성이 한쪽으로 기울어 보일 수 있습니다.`
        : `${withJosa(args.nameList, "을/를")} 중심으로 유물 ${n}점이 주제를 ${args.overlap >= 0.4 ? "비교적 잘" : "부분적으로"} 뒷받침합니다.`;

  return category("artifacts", score, reason, strength, improvement);
}

function scoreFlow(args: {
  artifacts: AnalysisArtifact[];
  routeArtifacts: AnalysisArtifact[];
  intent: ReturnType<typeof themeIntent>;
  panelText: string;
  nameList: string;
  title: string;
}): CuratorCategoryScore {
  const n = args.artifacts.length;
  let score = 7;
  const periodCount = new Set(args.artifacts.map((a) => a.period)).size;
  const cultures = new Set(args.artifacts.map((a) => a.culture));
  const kingdoms = ["고구려", "백제", "신라", "통일신라", "가야"].filter((k) => cultures.has(k));
  const explained = /시대|전후|이후|부터|흐름|교차|만난|삼국|교류|길목|나란히/.test(
    `${args.panelText} ${args.title}`,
  );
  const prehistoricInKingdoms =
    /삼국/.test(args.title) && args.artifacts.some((item) => /구석기|신석기|청동기/.test(item.period));

  if (n < 2) {
    score = 6;
  } else if (args.intent === "chronology") {
    const ranks = (args.routeArtifacts.length >= 2 ? args.routeArtifacts : args.artifacts).map(
      (item) => eraRank(item.period),
    );
    let inversions = 0;
    for (let i = 1; i < ranks.length; i += 1) {
      if (ranks[i] < ranks[i - 1]) inversions += 1;
    }
    if (inversions === 0) score += 5;
    else if (inversions >= 2) score -= 4;
    else score += 1;
  } else if (args.intent === "diversity") {
    if (kingdoms.length >= 3) score += 5;
    else if (kingdoms.length === 2) score += 3;
    else if (kingdoms.length <= 1 && n >= 3) score -= 4;
    if (explained) score += 2;
    else if (periodCount >= 3) score -= 1;
    if (prehistoricInKingdoms) score -= 2;
  } else if (args.intent === "focus" && periodCount <= 2) {
    score += 4;
  } else if (periodCount >= 3 && !explained) {
    score -= 2;
  } else if (periodCount >= 2 && explained) {
    score += 3;
  } else {
    score += 2;
  }

  const strength =
    args.intent === "diversity" && kingdoms.length >= 2
      ? "서로 다른 문화가 한자리에 모여, 교류와 길목이라는 주제가 흐름으로 읽힙니다."
      : args.intent === "chronology"
        ? "시간 순으로 읽히면 관람객이 강원·한반도의 긴 호흡을 따라가기 쉽습니다."
        : "주제 중심으로 유물을 묶어, 반드시 연표 순일 필요는 없는 구성입니다.";
  const improvement = prehistoricInKingdoms
    ? "삼국 주제라면 선사 유물은 도입부에 짧게 두거나, 왜 함께 놓였는지를 한 줄로 밝혀 주세요."
    : args.intent === "chronology"
      ? "입구에서 이른 시대로 시작해 뒤로 이어지면 역사적 흐름이 더 잘 읽힙니다."
      : args.intent === "diversity" && kingdoms.length <= 1
        ? "여러 문화가 만난다는 주제라면, 한 문화권에만 머물지 않도록 구성을 넓혀 보세요."
        : periodCount >= 3 && !explained
          ? "서로 다른 시대가 한 공간에 있으므로, 왜 나란히 놓였는지를 패널로 한 줄 설명해 보세요."
          : "유물 사이 관계를 짧은 문장으로 잇으면 문화적 연결이 분명해집니다.";
  const reason =
    n < 2
      ? "유물이 적어 시대적 흐름을 판단하기 어렵습니다. 제공된 정보만으로 단정하지 않겠습니다."
      : args.intent === "diversity" && kingdoms.length >= 2
        ? `${quoted(args.title, "은/는")} 여러 문화가 만나는 전시로 읽히며, ${kingdoms.join("·")} 자료가 주제를 받쳐 줍니다.${
            prehistoricInKingdoms ? " 다만 선사 자료가 함께 있어 시대 비약의 이유를 밝혀 주면 좋겠습니다." : ""
          }`
        : args.intent === "focus"
          ? `${quoted(args.title, "은/는")} 주제 중심 전시로 읽히며, ${withJosa(args.nameList, "이/가")} 같은 결을 유지하고 있습니다.`
          : `서로 다른 시대가 ${periodCount}겹 등장합니다. ${explained ? "설명이 그 이유를 받쳐 줍니다." : "시대가 바뀌는 이유가 공간에서 충분히 설명되지 않을 수 있습니다."}`;

  return category("historical_flow", score, reason, strength, improvement);
}

function scoreLayout(args: {
  placed: AnalysisArtifact[];
  routeIds: string[];
  artifacts: AnalysisArtifact[];
  overlap: number;
  themeTokens: string[];
  panels: ExhibitionAnalysisInput["panels"];
  unplaced: number;
  nameList: string;
}): CuratorCategoryScore {
  const n = args.placed.length;
  let score = 5;
  if (n === 0) score = 3;
  if (n >= 3) score += 2;
  const coverage = n === 0 ? 0 : args.routeIds.length / n;
  score += Math.round(coverage * 4);

  let clustered = 0;
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const dist = Math.hypot(
        (args.placed[i].x ?? 0) - (args.placed[j].x ?? 0),
        (args.placed[i].y ?? 0) - (args.placed[j].y ?? 0),
      );
      if (dist < 90) clustered += 1;
    }
  }
  if (clustered > 0) score -= Math.min(4, clustered);
  const xs = args.placed.map((p) => p.x ?? 0);
  const spread = xs.length > 1 ? Math.max(...xs) - Math.min(...xs) : 0;
  if (spread > 280) score += 2;
  if (spread < 160 && n >= 4) score -= 2;
  if (args.unplaced > 0) score -= 1;
  if (args.panels.some((p) => p.kind === "title")) score += 1;

  const ranked = args.placed
    .map((item) => ({
      item,
      rel: overlapRatio(args.themeTokens, `${item.name} ${item.themes.join(" ")} ${item.period}`.toLowerCase()),
    }))
    .sort((a, b) => b.rel - a.rel);
  const key = ranked[0]?.item;
  const keyIsFirst =
    key && args.routeIds[0] && key.instanceId === args.routeIds[0];
  const keyNearEntry = key && (key.x ?? 200) < 140 && (key.y ?? 0) > 420;
  if (keyIsFirst || keyNearEntry) score -= 2;
  if (args.routeIds.length >= 3) score += 1;

  const strength =
    coverage >= 0.8 && n >= 3
      ? "입구에서 출구로 이어지는 순서가 있어 관람객이 길을 찾기 쉽습니다."
      : "공간이 이야기를 담을 뼈대를 갖추기 시작했습니다.";
  const improvement = clustered
    ? "유물이 한곳에 모여 있습니다. 벽면과 중앙을 나눠 쓰면 시선이 머무를 자리가 생깁니다."
    : keyIsFirst || keyNearEntry
      ? "핵심 유물이 입구에서 바로 노출되면 전개가 약해질 수 있습니다. 앞에 배경 패널을 두고 핵심을 조금 뒤에 배치해 보세요."
      : args.unplaced > 0
        ? "선택한 유물 가운데 아직 공간에 없는 점이 있습니다. 배치하면 동선이 완성됩니다."
        : "시작 → 전개 → 절정 → 마무리의 리듬이 보이도록 동선 번호만 다듬어 보세요.";
  const reason =
    n === 0
      ? "공간에 놓인 유물이 없어 동선을 평가할 수 없습니다."
      : clustered
        ? `${withJosa(args.nameList, "이/가")} 가까운 자리에 모여 있어, 관람객의 시선이 한곳에 머무를 수 있습니다.`
        : `유물 ${n}점의 동선 반영 비율은 ${Math.round(coverage * 100)}%입니다. ${
            key ? `핵심으로 읽히는 ${key.name}의 위치가 전시의 리듬을 좌우합니다.` : ""
          }`;

  return category("layout", score, reason, strength, improvement);
}

function scoreInformation(args: {
  description: string;
  panels: ExhibitionAnalysisInput["panels"];
  placedCount: number;
  themeTokens: string[];
  title: string;
  artifacts: AnalysisArtifact[];
}): CuratorCategoryScore {
  let score = 5;
  if (args.description.length >= 24) score += 2;
  if (args.description.length >= 70) score += 2;
  if (args.panels.length >= 1) score += 3;
  if (args.panels.length >= 2) score += 2;
  const panelLen = args.panels.reduce((s, p) => s + p.title.length + p.content.length, 0);
  if (panelLen > 40) score += 2;
  if (args.placedCount > 0 && args.panels.length === 0) score -= 4;
  const panelHay = args.panels.map((p) => `${p.title} ${p.content}`).join(" ").toLowerCase();
  if (overlapRatio(args.themeTokens, panelHay) >= 0.25) score += 2;
  if (args.panels.some((p) => p.kind === "title")) score += 1;

  const strength =
    args.panels.length >= 1
      ? "설명 패널이 주제를 말로 받아 주어, 유물만으로 부족한 맥락을 보완합니다."
      : "전시 설명문이 주제의 방향을 잡고 있습니다.";
  const improvement =
    args.panels.length === 0
      ? `‘${args.title}’의 한 줄 정의를 입구 패널로 두면 정보가 유물 카드에만 머물지 않습니다.`
      : panelLen > 220
        ? "문장을 더 짧게 나누면 처음 온 관람객도 읽기를 포기하지 않습니다."
        : "유물 옆 캡션과 전체 메시지가 같은 단어를 쓰도록 맞춰 보세요.";
  const reason =
    args.panels.length === 0
      ? args.placedCount > 0
        ? "유물 자체는 강하지만, 공간에 설명 패널이 없어 정보가 개별 유물 설명에만 머무를 수 있습니다."
        : "전시 설명과 패널이 모두 짧아, 관람객에게 필요한 배경이 부족할 수 있습니다."
      : `패널 ${args.panels.length}개가 ${quoted(args.title, "을/를")} 풀어 주고 있습니다. ${
          args.artifacts[0] ? `${args.artifacts[0].name} 같은 개별 유물과 전체 메시지가 만나는지가 관건입니다.` : ""
        }`;

  return category("information", score, reason, strength, improvement);
}

function scoreVisitor(args: {
  perspective: VisitorPerspective;
  artifacts: AnalysisArtifact[];
  placed: AnalysisArtifact[];
  panels: ExhibitionAnalysisInput["panels"];
  routeArtifacts: AnalysisArtifact[];
  title: string;
  museum: ExhibitionAnalysisInput["museum"];
  description: string;
  panelText: string;
}): CuratorCategoryScore {
  let score = 5;
  if (args.placed.length >= 3) score += 1;
  if (args.routeArtifacts.length >= 2) score += 1;
  if (args.panels.length >= 1) score += 1;
  const last = args.routeArtifacts[args.routeArtifacts.length - 1];
  if (last && tokenize(args.title).some((t) => `${last.name} ${last.themes.join(" ")}`.includes(t))) {
    score += 1;
  }

  const avgPanel =
    args.panels.length === 0
      ? 0
      : args.panels.reduce((s, p) => s + p.content.length, 0) / args.panels.length;
  const hasQuestion = /[?] |까요|무엇|왜 /.test(args.panelText + args.description);
  const hasBackground = new RegExp(args.museum.keywords.slice(0, 3).join("|")).test(
    args.panelText + args.description,
  );
  const specialistHint = /출토|기법|소장|명문|양식/.test(args.panelText);

  if (args.perspective === "youth") {
    if (avgPanel > 90) score -= 3;
    else score += 1;
    if (hasQuestion) score += 4;
    else score -= 1;
  } else if (args.perspective === "foreign") {
    if (hasBackground && (args.description.length >= 40 || args.panels.length >= 1)) score += 4;
    else score -= 3;
  } else if (args.perspective === "specialist") {
    if (specialistHint) score += 4;
    else score -= 2;
    if (new Set(args.artifacts.map((a) => a.period)).size >= 2) score += 1;
  } else {
    if (args.panels.length >= 1 && args.placed.length >= 3) score += 3;
    if (args.placed.length < 2) score -= 3;
  }

  const labels: Record<VisitorPerspective, string> = {
    general: "처음 온 관람객",
    youth: "청소년 관람객",
    foreign: "한국사 배경이 적은 관람객",
    specialist: "역사 전공 관람객",
  };
  const strength =
    args.perspective === "youth"
      ? "질문이 있으면 청소년도 전시에 머무를 이유가 생깁니다."
      : "관람이 끝날 때 주제가 한 문장으로 남도록 여운을 둘 자리가 있습니다.";
  const improvement =
    args.perspective === "foreign"
      ? `${args.museum.culture}이 어떤 시공간인지 입구에서 한 줄로 풀어 주면 사전 지식 없이도 따라올 수 있습니다.`
      : args.perspective === "youth"
        ? "짧은 질문형 패널이 있으면 전문 용어 앞에서도 발걸음이 멈추지 않습니다."
        : args.perspective === "specialist"
          ? "출토 맥락이나 제작 기법을 한 줄씩 보강하면 전공 관람의 밀도가 높아집니다."
          : "마지막에 핵심 질문을 다시 던지면 전시가 기억에 남습니다.";
  const reason = `${labels[args.perspective]}의 시선에서 보면, ${
    args.placed.length < 2
      ? "아직 이야기의 시작을 찾기 어려울 수 있습니다."
      : `${quoted(args.title, "을/를")} 따라가며 궁금증이 ${hasQuestion ? "생기고 일부 해소될" : "생길 수는 있으나 해소 지점이 분명치 않을"} 수 있습니다.`
  }`;

  return category("visitor", score, reason, strength, improvement);
}

function quoted(title: string, pair: Parameters<typeof josa>[1]): string {
  return `‘${title}’${josa(title, pair)}`;
}

function category(
  id: CuratorCategoryScore["id"],
  score: number,
  reason: string,
  strength: string,
  improvement: string,
): CuratorCategoryScore {
  const def = CATEGORY_DEFS.find((item) => item.id === id)!;
  return {
    id,
    name: def.name,
    score: clampScore(score, def.maxScore),
    maxScore: def.maxScore,
    reason,
    strength,
    improvement,
  };
}

function pickImprovements(
  categories: CuratorCategoryScore[],
  ctx: {
    intent: ReturnType<typeof themeIntent>;
    cultureDom: { key: string; share: number };
    title: string;
    museumId: string;
    artifacts: AnalysisArtifact[];
    explainPanels: ExhibitionAnalysisInput["panels"];
    placed: AnalysisArtifact[];
  },
): CuratorSuggestion[] {
  const ranked = [...categories].sort(
    (a, b) => a.score / a.maxScore - b.score / b.maxScore,
  );
  const suggestions: CuratorSuggestion[] = [];
  const usedTypes = new Set<string>();

  const push = (item: CuratorSuggestion) => {
    if (suggestions.length >= 3) return;
    if (usedTypes.has(item.type) && suggestions.length > 0 && item.priority === "low") return;
    usedTypes.add(item.type);
    suggestions.push(item);
  };

  for (const item of ranked) {
    const ratio = item.score / item.maxScore;
    if (ratio >= 0.85) continue;
    push(suggestionFromCategory(item, ctx, ratio));
  }

  if (ctx.explainPanels.length === 0 && ctx.placed.length > 0) {
    push({
      priority: "medium",
      type: "panel",
      targetStep: 4,
      message: "입구에 전시의 질문을 받아 주는 설명이 없습니다.",
      action: `${quoted(ctx.title, "을/를")} 한 문장으로 적은 패널을 입구 가까이에 배치해 보세요.`,
    });
  }

  if (suggestions.length < 3) {
    push({
      priority: "medium",
      type: "panel",
      targetStep: 4,
      message: `${quoted(ctx.title, "을/를")} 여는 배경을 입구에서 짧게 건네면 관람이 수월해집니다.`,
      action: "주제 질문을 담은 짧은 패널을 입구 가까이에 배치해 보세요.",
    });
  }

  if (suggestions.length < 3) {
    push({
      priority: "low",
      type: "visitor",
      targetStep: 4,
      message: `전시가 끝나는 지점에서 ${quoted(ctx.title, "이/가")} 한 문장으로 남는지 다시 보면 좋겠습니다.`,
      action: "마지막에 핵심 질문을 던지는 패널이나 대표 유물을 두어 여운을 남겨 보세요.",
    });
  }

  if (suggestions.length < 3 && ctx.placed.length >= 2) {
    push({
      priority: "low",
      type: "layout",
      targetStep: 4,
      message: "시작·전개·절정의 리듬이 동선만으로 읽히는지 한 번 더 살펴볼 만합니다.",
      action: "핵심 유물은 중후반에 두고, 앞에는 배경이 되는 자료와 설명을 배치해 보세요.",
    });
  }

  return suggestions.slice(0, 3);
}

function suggestionFromCategory(
  item: CuratorCategoryScore,
  ctx: {
    intent: ReturnType<typeof themeIntent>;
    cultureDom: { key: string; share: number };
    title: string;
    museumId: string;
    artifacts: AnalysisArtifact[];
    explainPanels: ExhibitionAnalysisInput["panels"];
    placed: AnalysisArtifact[];
  },
  ratio: number,
): CuratorSuggestion {
  const gap = 1 - ratio;
  const priority = gap >= 0.4 ? "high" : gap >= 0.22 ? "medium" : "low";
  if (item.id === "artifacts") {
    const extra =
      ctx.intent === "diversity" && ctx.cultureDom.share >= 0.65 && ctx.museumId === "chuncheon"
        ? {
            message: `현재 ‘${ctx.title}’ 전시는 ${ctx.cultureDom.key} 관련 유물의 비중이 높습니다.`,
            action:
              "고구려 또는 백제 관련 유물을 1~2점 추가해 삼국 간 관계를 보완해보세요.",
          }
        : {
            message: item.reason,
            action: item.improvement,
          };
    return { priority, type: "artifact", targetStep: 3, ...extra };
  }
  if (item.id === "layout" || item.id === "historical_flow") {
    return {
      priority,
      type: item.id === "layout" ? "layout" : "route",
      targetStep: item.id === "layout" ? 4 : 5,
      message: item.reason,
      action: item.improvement,
    };
  }
  if (item.id === "information") {
    return {
      priority,
      type: "panel",
      targetStep: 4,
      message: item.reason,
      action: item.improvement,
    };
  }
  if (item.id === "theme") {
    return {
      priority,
      type: "theme",
      targetStep: 2,
      message: item.reason,
      action: item.improvement,
    };
  }
  return {
    priority,
    type: "visitor",
    targetStep: 4,
    message: item.reason,
    action: item.improvement,
  };
}

function visitorNotesFor(
  input: ExhibitionAnalysisInput,
  ctx: {
    artifacts: AnalysisArtifact[];
    placed: AnalysisArtifact[];
    explainPanels: ExhibitionAnalysisInput["panels"];
    panelText: string;
    title: string;
  },
): Record<VisitorPerspective, string> {
  const sample = joinNames(ctx.artifacts.map((a) => a.name));
  const culture = input.museum.culture;
  return {
    general:
      ctx.placed.length < 3
        ? "일반 관람객은 아직 이야기의 시작을 찾기 어려울 수 있습니다. 입구 가까이 주제 패널과 대표 유물 한 점을 두면 첫인상이 분명해집니다."
        : `일반 관람객은 ${quoted(ctx.title, "이/가")}라는 제목은 기억하지만, ${sample || "유물"} 사이 관계를 스스로 연결해야 할 수 있습니다. 두 점을 잇는 짧은 문장이 있으면 이해가 쉬워집니다.`,
    youth: /[?] |까요/.test(ctx.panelText)
      ? "질문형 문장이 있어 청소년도 발걸음을 멈추기 쉽습니다. 용어가 나오면 바로 아래에 쉬운 풀어쓰기를 덧붙여 보세요."
      : `유물 설명이 다소 길어 처음 보는 관람객에게는 어려울 수 있습니다. “${withJosa(ctx.artifacts[0]?.name ?? "이 유물", "은/는")} 누가 썼을까요?”처럼 한 문장 질문을 패널에 두면 청소년도 전시에 머무를 수 있습니다.`,
    foreign:
      ctx.explainPanels.length === 0
        ? `${culture}에 대한 기본 설명을 전시 초반에 더하면, 한국사 배경이 적은 관람객도 시공간을 먼저 그릴 수 있습니다.`
        : `${culture}의 지명과 시대를 입구에서 한 줄로 번역·풀어 주면 접근성이 높아집니다. 제목만으로는 맥락이 부족할 수 있습니다.`,
    specialist:
      /출토|기법|소장/.test(ctx.panelText)
        ? "출토와 기법 언급이 있어 전공 관람의 단서가 있습니다. 유물 옆에 소장처와 제작 맥락을 한 줄씩 보강하면 밀도가 높아집니다."
        : "역사 전공자에게는 출토지와 소장처, 제작 기법의 근거가 더 궁금해질 수 있습니다. 제공된 메타데이터 밖의 연대를 단정하지는 않겠습니다.",
  };
}

function buildSummary(
  title: string,
  overall: number,
  categories: CuratorCategoryScore[],
  nameList: string,
): string {
  const weak = [...categories].sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)[0];
  const strong = [...categories].sort((a, b) => b.score / b.maxScore - a.score / a.maxScore)[0];
  const tone =
    overall >= 82 ? "주제와 유물의 연결이 또렷합니다." : overall >= 68 ? "골격은 갖추었고, 리듬을 다듬을 여지가 있습니다." : "지금은 이야기의 뼈대를 세우는 단계입니다.";
  return `${tone} ‘${title}’${josa(title, "은/는")} ${nameList ? `${withJosa(nameList, "을/를")} 축으로 ` : ""}${withJosa(strong.name, "이/가")} 상대적으로 단단합니다. ${withJosa(weak.name, "을/를")} 손보면 관람 경험이 한결 분명해질 수 있습니다.`;
}

function buildComment(
  title: string,
  culture: string,
  categories: CuratorCategoryScore[],
  nameList: string,
  intent: ReturnType<typeof themeIntent>,
): string {
  const art = categories.find((c) => c.id === "artifacts")!;
  const info = categories.find((c) => c.id === "information")!;
  const first = nameList || `${culture} 관련 자료`;
  const a =
    art.score >= 14
      ? `현재 전시는 ${withJosa(first, "을/를")} 중심으로 ‘${title}’의 이미지를 효과적으로 보여주고 있습니다.`
      : `현재 구성은 ${first}에 기대고 있으나, ${quoted(title, "와/과")} 비교하면 유물 선택이 주제를 아직 충분히 증명하지는 않습니다.`;
  const b =
    info.score >= 10
      ? "설명은 주제를 받아 주고 있으니, 문장만 조금 나누면 처음 온 관람객도 따라오기 쉽습니다."
      : "다만 공간의 설명이 짧아, 유물 사이를 잇는 한 줄이 있으면 메시지가 더 풍부해질 수 있습니다.";
  const c =
    intent === "diversity"
      ? "여러 문화가 한자리에 모인 만큼, 왜 나란히 놓였는지를 관람객에게 먼저 건네는 편이 좋습니다."
      : "핵심 유물 앞에 짧은 배경을 두면 전개의 호흡이 살아납니다.";
  return `${a} ${b} ${c}`;
}
