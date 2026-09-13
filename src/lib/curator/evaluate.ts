import type { AIEvaluation, ExhibitionState, ScoreSet } from "@/types/exhibition";
import { artifactsForMode } from "@/data/artifacts";
import { analyzeExhibition } from "./analyze";
import { buildAnalysisInput } from "./input";
import { withJosa } from "./text";

export function evaluateExhibition(
  state: ExhibitionState,
  previous?: AIEvaluation | null,
): AIEvaluation {
  const input = buildAnalysisInput(state);
  const result = analyzeExhibition(input);
  const scores = toScoreSet(result.categories, result.overallScore);
  const theme = result.categories.find((c) => c.id === "theme")!;
  const artifacts = result.categories.find((c) => c.id === "artifacts")!;
  const layout = result.categories.find((c) => c.id === "layout")!;
  const information = result.categories.find((c) => c.id === "information")!;
  const visitor = result.categories.find((c) => c.id === "visitor")!;

  const prev = previous?.categories?.length
    ? previous.overallScore ?? previous.scores.overall
    : undefined;
  const scoreDelta = prev == null ? undefined : result.overallScore - prev;
  const comparisonNote =
    scoreDelta == null || prev == null
      ? undefined
      : comparisonMessage(scoreDelta, previous, result.categories);

  return {
    scores,
    summary: result.summary,
    reasons: {
      themeConnection: theme.reason,
      composition: artifacts.reason,
      route: layout.reason,
      information: information.reason,
      experience: visitor.reason,
    },
    visitorNotes: result.visitorNotes,
    createdAt: new Date().toISOString(),
    overallScore: result.overallScore,
    categories: result.categories,
    strengths: result.strengths,
    improvements: result.improvements,
    curatorComment: result.curatorComment,
    visitorPerspective: {
      type: state.visitorPerspective,
      comment: result.visitorComment,
    },
    previousOverallScore: prev,
    scoreDelta,
    comparisonNote,
  };
}

export function catalogHint(mode: ExhibitionState["museumMode"]): string {
  const count = artifactsForMode(mode ?? "free").length;
  return `현재 아카이브 ${count}점을 바탕으로 평가합니다.`;
}

export function verifyOverallScore(evaluation: AIEvaluation): boolean {
  if (!evaluation.categories?.length) return evaluation.overallScore === evaluation.scores.overall;
  const sum = evaluation.categories.reduce((total, item) => total + item.score, 0);
  return sum === evaluation.overallScore;
}

function toScoreSet(
  categories: NonNullable<AIEvaluation["categories"]>,
  overall: number,
): ScoreSet {
  const pct = (id: (typeof categories)[number]["id"]) => {
    const item = categories.find((c) => c.id === id);
    if (!item) return 0;
    return Math.round((item.score / item.maxScore) * 100);
  };
  return {
    themeConnection: pct("theme"),
    composition: pct("artifacts"),
    route: pct("layout"),
    information: pct("information"),
    experience: pct("visitor"),
    overall,
  };
}

function comparisonMessage(
  delta: number,
  previous: AIEvaluation | null | undefined,
  categories: NonNullable<AIEvaluation["categories"]>,
): string {
  if (delta === 0) {
    return "구성은 달라졌을 수 있으나 총점은 같습니다.";
  }
  if (!previous?.categories?.length) {
    return delta > 0
      ? `이전보다 ${delta}점 올랐습니다.`
      : `이전보다 ${Math.abs(delta)}점 낮아졌습니다. 전시를 다시 살펴보시면 좋겠습니다.`;
  }
  let best = categories[0];
  let bestDelta = -Infinity;
  for (const item of categories) {
    const old = previous.categories!.find((c) => c.id === item.id);
    if (!old) continue;
    const d = item.score - old.score;
    if (d > bestDelta) {
      bestDelta = d;
      best = item;
    }
  }
  if (delta > 0 && bestDelta > 0 && best) {
    return `${withJosa(best.name, "을/를")} 보완하면서 평가가 ${delta}점 높아졌습니다.`;
  }
  if (delta < 0) {
    return `일부 항목이 느슨해지며 이전보다 ${Math.abs(delta)}점 낮아졌습니다.`;
  }
  return `이전 점수 ${previous.overallScore}점에서 ${delta > 0 ? "+" : ""}${delta}점 움직였습니다.`;
}
