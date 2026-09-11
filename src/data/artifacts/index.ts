import type { Artifact, MuseumMode } from "@/types/exhibition";
import { freeArtifacts } from "./freeArtifacts";
import { gimhaeArtifacts } from "./gimhaeArtifacts";
import { gongjuArtifacts } from "./gongjuArtifacts";

export const allArtifacts: Artifact[] = [
  ...gongjuArtifacts,
  ...gimhaeArtifacts,
  ...freeArtifacts,
];

const byId = new Map(allArtifacts.map((item) => [item.id, item]));

export function getArtifact(id: string): Artifact | undefined {
  return byId.get(id);
}

export function artifactsForMode(mode: MuseumMode): Artifact[] {
  return allArtifacts.filter((item) => item.modes.includes(mode));
}

export { gongjuArtifacts, gimhaeArtifacts, freeArtifacts };
