import { themePresets } from "@/data/museums";
import type { Artifact, MuseumMode } from "@/types/exhibition";

export function themeKeywords(
  mode: MuseumMode,
  title: string,
  theme: string,
  description: string,
): string[] {
  const preset = themePresets[mode]?.find((item) => item.title === title);
  const fromPreset = (preset?.keywords ?? []).map((k) => k.toLowerCase());
  const fromText = `${title} ${theme} ${description}`
    .toLowerCase()
    .split(/[^0-9a-zA-Z가-힣]+/)
    .filter((t) => t.length >= 2);
  return [...new Set([...fromPreset, ...fromText])];
}

export function artifactRelevance(artifact: Artifact, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const themes = artifact.themes ?? [];
  const hay =
    `${artifact.name} ${artifact.period} ${artifact.category} ${artifact.material} ${artifact.keywords.join(" ")} ${themes.join(" ")} ${artifact.description}`.toLowerCase();
  let score = 0;
  for (const key of keywords) {
    if (themes.some((t) => t.toLowerCase() === key || t.toLowerCase().includes(key))) {
      score += 3;
    } else if (
      artifact.keywords.some((t) => t.toLowerCase() === key || t.toLowerCase().includes(key))
    ) {
      score += 2;
    } else if (hay.includes(key)) {
      score += 1;
    }
  }
  return score;
}
