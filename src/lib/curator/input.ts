import { getArtifact } from "@/data/artifacts";
import { themePresets } from "@/data/museums";
import { rooms } from "@/data/rooms";
import type { ExhibitionState, MuseumMode } from "@/types/exhibition";
import { museumAnalysisProfile } from "./museumContext";
import { inferCulture, themeIntent } from "./text";
import type {
  AnalysisArtifact,
  AnalysisSection,
  ExhibitionAnalysisInput,
} from "./types";

export function buildAnalysisInput(state: ExhibitionState): ExhibitionAnalysisInput {
  const mode = (state.museumMode ?? "free") as MuseumMode;
  const museum = museumAnalysisProfile(mode);
  const room = rooms[mode];
  const presets = themePresets[mode] ?? [];
  const customTopic = Boolean(state.title) && !presets.some((p) => p.title === state.title);

  const selected = state.selectedArtifactIds
    .map((id) => getArtifact(id))
    .filter(Boolean)
    .map((item) => toAnalysisArtifact(item!));

  const placedById = new Map(
    state.placedArtifacts.map((item) => [item.artifactId, item]),
  );

  const artifacts: AnalysisArtifact[] = selected.map((item) => {
    const placed = placedById.get(item.id);
    if (!placed) return item;
    return {
      ...item,
      x: placed.x,
      y: placed.y,
      width: placed.width,
      height: placed.height,
      instanceId: placed.instanceId,
    };
  });

  const sections = sectionsFromZones(artifacts, room.zones);

  const route = [
    "entrance",
    ...state.route.filter((id) =>
      state.placedArtifacts.some((item) => item.instanceId === id),
    ),
    "exit",
  ];

  return {
    museum,
    exhibition: {
      title: state.title,
      description: state.description,
      topic: state.theme || state.title,
      customTopic,
    },
    artifacts,
    selectedArtifactIds: state.selectedArtifactIds,
    placedArtifactIds: state.placedArtifacts.map((item) => item.artifactId),
    layout: {
      template: themeIntent(state.title, state.theme, state.description) === "chronology"
        ? "chronological"
        : "thematic",
      sections,
    },
    panels: state.panels.map((panel) => ({
      id: panel.id,
      kind: panel.kind,
      title: panel.title,
      content: panel.body,
      x: panel.x,
      y: panel.y,
    })),
    route,
    visitorPerspective: state.visitorPerspective,
  };
}

function toAnalysisArtifact(item: NonNullable<ReturnType<typeof getArtifact>>): AnalysisArtifact {
  return {
    id: item.id,
    name: item.name,
    period: item.period,
    culture: inferCulture(item),
    region: item.region,
    category: item.category,
    material: item.material,
    description: item.description,
    themes: item.themes ?? item.keywords.slice(0, 4),
    museum: item.museum,
    source: item.source,
    sourceUrl: item.sourceUrl,
  };
}

function sectionsFromZones(
  artifacts: AnalysisArtifact[],
  zones: { id: string; label: string; x: number; y: number; w: number; h: number }[],
): AnalysisSection[] {
  const buckets = new Map<string, string[]>();
  for (const zone of zones) buckets.set(zone.label, []);
  buckets.set("기타", []);

  for (const artifact of artifacts) {
    if (artifact.x == null || artifact.y == null) {
      buckets.get("기타")!.push(artifact.id);
      continue;
    }
    const cx = artifact.x + (artifact.width ?? 132) / 2;
    const cy = artifact.y + (artifact.height ?? 132) / 2;
    const zone = zones.find(
      (item) => cx >= item.x && cx <= item.x + item.w && cy >= item.y && cy <= item.y + item.h,
    );
    buckets.get(zone?.label ?? "기타")!.push(artifact.id);
  }

  return [...buckets.entries()]
    .filter(([, ids]) => ids.length > 0)
    .map(([title, artifactIds], order) => ({ title, artifactIds, order: order + 1 }));
}
