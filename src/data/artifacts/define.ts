import type { Artifact, MuseumMode } from "@/types/exhibition";
import { wikiFilePage, wikiThumb } from "@/lib/wiki";

function regionFromMuseum(museum: string, period: string): string {
  if (museum.includes("공주")) return "충청";
  if (museum.includes("김해")) return "영남";
  if (museum.includes("경주")) return "경주";
  if (museum.includes("춘천") || museum.includes("강원")) return "강원";
  if (museum.includes("제주")) return "제주";
  if (/met|메트|metropolitan/i.test(museum)) return "세계";
  if (period.includes("백제")) return "충청";
  if (period.includes("가야")) return "영남";
  if (period.includes("신라")) return "경주";
  return "한국";
}

export function defineArtifact(
  data: Omit<Artifact, "image" | "source" | "sourceUrl" | "region"> &
    Partial<
      Pick<Artifact, "source" | "sourceUrl" | "image" | "region" | "credit">
    >,
): Artifact {
  const hasFile = Boolean(data.imageFile);
  return {
    image: hasFile ? wikiThumb(data.imageFile) : "",
    source: hasFile ? "Wikimedia Commons" : data.museum,
    sourceUrl: hasFile ? wikiFilePage(data.imageFile) : "",
    region: data.region ?? regionFromMuseum(data.museum, data.period),
    credit: data.credit ?? (hasFile ? "Wikimedia Commons" : "이미지 교체 예정"),
    ...data,
  };
}

export function withModes(
  artifacts: Artifact[],
  modes: MuseumMode[],
): Artifact[] {
  return artifacts.map((item) => ({
    ...item,
    modes: Array.from(new Set([...item.modes, ...modes])),
  }));
}
