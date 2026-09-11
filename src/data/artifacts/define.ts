import type { Artifact, MuseumMode } from "@/types/exhibition";
import { wikiFilePage, wikiThumb } from "@/lib/wiki";

export function defineArtifact(
  data: Omit<Artifact, "image" | "source" | "sourceUrl"> &
    Partial<Pick<Artifact, "source" | "sourceUrl" | "image">>,
): Artifact {
  return {
    image: wikiThumb(data.imageFile),
    source: "Wikimedia Commons",
    sourceUrl: wikiFilePage(data.imageFile),
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
