import type { MuseumMode, VisitorPerspective } from "@/types/exhibition";

export interface AnalysisMuseum {
  id: MuseumMode;
  name: string;
  culture: string;
  description: string;
  keywords: string[];
}

export interface AnalysisArtifact {
  id: string;
  name: string;
  period: string;
  culture: string;
  region: string;
  category: string;
  material: string;
  description: string;
  themes: string[];
  museum: string;
  source: string;
  sourceUrl: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  instanceId?: string;
}

export interface AnalysisSection {
  title: string;
  artifactIds: string[];
  order: number;
}

export interface AnalysisPanel {
  id: string;
  kind: "panel" | "title" | "pedestal";
  title: string;
  content: string;
  x: number;
  y: number;
}

export interface ExhibitionAnalysisInput {
  museum: AnalysisMuseum;
  exhibition: {
    title: string;
    description: string;
    topic: string;
    customTopic: boolean;
  };
  artifacts: AnalysisArtifact[];
  selectedArtifactIds: string[];
  placedArtifactIds: string[];
  layout: {
    template: "chronological" | "thematic";
    sections: AnalysisSection[];
  };
  panels: AnalysisPanel[];
  route: string[];
  visitorPerspective: VisitorPerspective;
}

export const CATEGORY_DEFS = [
  { id: "theme", name: "주제 명확성", maxScore: 20 },
  { id: "artifacts", name: "유물 구성과 주제 적합성", maxScore: 20 },
  { id: "historical_flow", name: "역사적·문화적 흐름", maxScore: 15 },
  { id: "layout", name: "공간 구성과 동선", maxScore: 15 },
  { id: "information", name: "설명과 정보 전달", maxScore: 15 },
  { id: "visitor", name: "관람객 경험", maxScore: 15 },
] as const;
