import type { Artifact } from "@/types/exhibition";

const STOP = new Set([
  "전시",
  "유물",
  "관련",
  "문화",
  "역사",
  "사람",
  "통해",
  "어떻게",
  "보여주는",
  "살펴",
  "구성",
  "바탕",
  "그리고",
  "또는",
  "있는",
  "하는",
  "되어",
  "위한",
  "까지",
  "부터",
]);

export function tokenize(...texts: string[]): string[] {
  return texts
    .join(" ")
    .toLowerCase()
    .split(/[^0-9a-zA-Z가-힣]+/)
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

export function clampScore(n: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(n)));
}

export function inferCulture(artifact: Artifact): string {
  const hay = `${artifact.period} ${artifact.keywords.join(" ")} ${(artifact.themes ?? []).join(" ")} ${artifact.name}`;
  if (/고구려/.test(hay)) return "고구려";
  if (/백제/.test(hay)) return "백제";
  if (/가야/.test(hay)) return "가야";
  if (/통일신라/.test(hay)) return "통일신라";
  if (/신라/.test(hay)) return "신라";
  if (/고려/.test(hay)) return "고려";
  if (/조선/.test(hay)) return "조선";
  if (/탐라/.test(hay)) return "탐라";
  if (/제주/.test(hay)) return "제주";
  if (/구석기|신석기|청동기/.test(hay)) return "선사";
  if (/철기/.test(hay)) return "철기";
  if (/이집트/.test(hay)) return "이집트";
  if (/그리스|로마/.test(hay)) return "고전";
  return artifact.period || "미상";
}

export function eraRank(period: string): number {
  if (/구석기/.test(period)) return 0;
  if (/신석기/.test(period)) return 1;
  if (/청동기/.test(period)) return 2;
  if (/철기/.test(period) && !/통일/.test(period)) return 3;
  if (/고구려/.test(period)) return 4;
  if (/백제/.test(period)) return 4;
  if (/가야/.test(period)) return 4;
  if (/탐라/.test(period)) return 4;
  if (/통일신라/.test(period)) return 5;
  if (/신라/.test(period)) return 4;
  if (/고려/.test(period)) return 6;
  if (/조선/.test(period)) return 7;
  return 5;
}

export function joinNames(names: string[], max = 3): string {
  const slice = names.filter(Boolean).slice(0, max);
  if (slice.length === 0) return "";
  if (slice.length === 1) return slice[0];
  if (slice.length === 2) return `${slice[0]}, ${slice[1]}`;
  return `${slice[0]}, ${slice[1]}, ${slice[2]}`;
}

/** Last Hangul syllable in the phrase; used so 조사 follows the final noun, not a comma. */
export function hasBatchim(word: string): boolean {
  const last = [...word].reverse().find((ch) => /[가-힣]/.test(ch));
  if (!last) return false;
  const code = last.charCodeAt(0) - 0xac00;
  return code >= 0 && code % 28 !== 0;
}

export type JosaPair = "와/과" | "을/를" | "이/가" | "은/는" | "으로/로";

export function josa(word: string, pair: JosaPair): string {
  const batchim = hasBatchim(word);
  if (pair === "와/과") return batchim ? "과" : "와";
  if (pair === "을/를") return batchim ? "을" : "를";
  if (pair === "이/가") return batchim ? "이" : "가";
  if (pair === "은/는") return batchim ? "은" : "는";
  const last = [...word].reverse().find((ch) => /[가-힣]/.test(ch));
  if (!last) return "으로";
  const code = last.charCodeAt(0) - 0xac00;
  const jong = code >= 0 ? code % 28 : 0;
  if (jong === 0 || jong === 8) return "로";
  return "으로";
}

export function withJosa(word: string, pair: JosaPair): string {
  if (!word) return word;
  return `${word}${josa(word, pair)}`;
}

export function countBy(values: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const value of values) {
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return map;
}

export function dominantShare(values: string[]): { key: string; share: number; count: number } {
  if (values.length === 0) return { key: "", share: 0, count: 0 };
  const map = countBy(values);
  let key = "";
  let count = 0;
  map.forEach((n, k) => {
    if (n > count) {
      key = k;
      count = n;
    }
  });
  return { key, share: count / values.length, count };
}

export type ThemeIntent = "focus" | "diversity" | "chronology" | "thematic";

export function themeIntent(title: string, topic: string, description: string): ThemeIntent {
  const t = `${title} ${topic} ${description}`;
  if (/삼국|교류|만난|주변국|비교/.test(t)) return "diversity";
  if (/10만|선사부터|시간의 흐름|철기시대까지/.test(t)) return "chronology";
  if (/무령왕|왕릉|황금|철의 왕국|왕실|금관/.test(t)) return "focus";
  return "thematic";
}

export function overlapRatio(themeTokens: string[], artifactHay: string): number {
  if (themeTokens.length === 0) return 0;
  let hit = 0;
  for (const token of themeTokens) {
    if (artifactHay.includes(token)) hit += 1;
  }
  return hit / Math.max(4, themeTokens.length);
}
