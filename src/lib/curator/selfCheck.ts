import { evaluateExhibition, verifyOverallScore } from "./evaluate";
import { curatorFixtures } from "./fixtures";

export function runCuratorSelfCheck(): { name: string; overall: number; summary: string }[] {
  const rows = Object.entries(curatorFixtures).map(([name, state]) => {
    const evaluation = evaluateExhibition(state);
    if (!verifyOverallScore(evaluation)) {
      throw new Error(`${name}: overallScore is not the sum of categories`);
    }
    if (!evaluation.categories || evaluation.categories.length !== 6) {
      throw new Error(`${name}: expected 6 categories`);
    }
    return { name, overall: evaluation.overallScore ?? 0, summary: evaluation.summary };
  });

  const scores = rows.map((row) => row.overall);
  const unique = new Set(scores);
  if (unique.size < 4) {
    throw new Error(`expected varied scores, got ${scores.join(", ")}`);
  }

  const mixed = evaluateExhibition(curatorFixtures.chuncheonThreeKingdoms);
  const heavy = evaluateExhibition(curatorFixtures.chuncheonSillaHeavy);
  const mixedArt = mixed.categories?.find((c) => c.id === "artifacts")?.score ?? 0;
  const heavyArt = heavy.categories?.find((c) => c.id === "artifacts")?.score ?? 0;
  if (mixedArt <= heavyArt) {
    throw new Error(
      `삼국 혼합 구성이 신라 편중보다 유물 점수가 높아야 합니다 (${mixedArt} vs ${heavyArt})`,
    );
  }

  const mixedFlow = mixed.categories?.find((c) => c.id === "historical_flow")?.score ?? 0;
  if (mixedFlow < 10) {
    throw new Error(`삼국 혼합 전시의 흐름 점수가 너무 낮습니다 (${mixedFlow})`);
  }
  if ((mixed.improvements?.length ?? 0) !== 3) {
    throw new Error("개선안은 3개여야 합니다");
  }
  const blob = `${mixed.curatorComment} ${mixed.summary} ${mixed.strengths?.join(" ")}`;
  if (/철불와|지석를|허리띠을|용기을|큰칼를/.test(blob)) {
    throw new Error(`조사 오류: ${blob}`);
  }

  const gimhae = rows.find((r) => r.name === "gimhaeIron")?.overall ?? 0;
  const gyeongju = rows.find((r) => r.name === "gyeongjuGold")?.overall ?? 0;
  if (gimhae === gyeongju) {
    throw new Error(`김해와 경주 총점이 같으면 안 됩니다 (${gimhae})`);
  }

  const specialist = evaluateExhibition({
    ...curatorFixtures.chuncheonThreeKingdoms,
    visitorPerspective: "specialist",
  });
  const generalVisitor = mixed.categories?.find((c) => c.id === "visitor")?.score ?? 0;
  const specialistVisitor = specialist.categories?.find((c) => c.id === "visitor")?.score ?? 0;
  if (generalVisitor === specialistVisitor) {
    throw new Error("관람객 시선이 바뀌면 관람객 경험 점수도 달라져야 합니다");
  }

  const empty = evaluateExhibition({
    ...curatorFixtures.gongjuRoyal,
    selectedArtifactIds: [],
    placedArtifacts: [],
    route: [],
    panels: [],
  });
  if ((empty.overallScore ?? 100) >= (rows.find((r) => r.name === "gongjuRoyal")?.overall ?? 0)) {
    throw new Error("empty exhibition should score lower than a complete Gongju royal show");
  }

  return rows;
}
