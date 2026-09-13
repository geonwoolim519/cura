export type MuseumMode =
  | "gongju"
  | "gimhae"
  | "gyeongju"
  | "chuncheon"
  | "jeju"
  | "met"
  | "free";

export type VisitorPerspective =
  | "general"
  | "youth"
  | "foreign"
  | "specialist";

export interface Artifact {
  id: string;
  name: string;
  museum: string;
  period: string;
  category: string;
  material: string;
  region: string;
  description: string;
  keywords: string[];
  themes?: string[];
  credit?: string;
  image: string;
  imageFile: string;
  source: string;
  sourceUrl: string;
  modes: MuseumMode[];
}

export type DisplayStyle = "pedestal" | "wall" | "case";

export interface PlacedArtifact {
  instanceId: string;
  artifactId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  displayOrder: number;
  displayStyle: DisplayStyle;
}

export type PanelKind = "panel" | "title" | "pedestal";

export interface ExhibitionPanel {
  id: string;
  kind: PanelKind;
  title: string;
  body: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScoreSet {
  themeConnection: number;
  composition: number;
  route: number;
  information: number;
  experience: number;
  overall: number;
}

export type CuratorCategoryId =
  | "theme"
  | "artifacts"
  | "historical_flow"
  | "layout"
  | "information"
  | "visitor";

export interface CuratorCategoryScore {
  id: CuratorCategoryId;
  name: string;
  score: number;
  maxScore: number;
  reason: string;
  strength: string;
  improvement: string;
}

export type CuratorSuggestionType =
  | "artifact"
  | "layout"
  | "panel"
  | "route"
  | "theme"
  | "visitor";

export interface CuratorSuggestion {
  priority: "high" | "medium" | "low";
  type: CuratorSuggestionType;
  message: string;
  action: string;
  targetStep?: number;
}

export interface AIEvaluation {
  scores: ScoreSet;
  summary: string;
  reasons: Record<keyof Omit<ScoreSet, "overall">, string>;
  visitorNotes: Record<VisitorPerspective, string>;
  createdAt: string;
  overallScore?: number;
  categories?: CuratorCategoryScore[];
  strengths?: string[];
  improvements?: CuratorSuggestion[];
  curatorComment?: string;
  visitorPerspective?: { type: VisitorPerspective; comment: string };
  previousOverallScore?: number;
  scoreDelta?: number;
  comparisonNote?: string;
}

export type CreateView = "edit" | "preview" | "result";

export type CanvasSelection =
  | { type: "artifact"; instanceId: string }
  | { type: "panel"; id: string }
  | null;

export interface ExhibitionState {
  museumMode: MuseumMode | null;
  step: number;
  view: CreateView;
  title: string;
  theme: string;
  description: string;
  selectedArtifactIds: string[];
  placedArtifacts: PlacedArtifact[];
  panels: ExhibitionPanel[];
  route: string[];
  aiEvaluation: AIEvaluation | null;
  visitorPerspective: VisitorPerspective;
  previewIndex: number;
  selection: CanvasSelection;
  createdAt: string;
  updatedAt: string;
}

export interface ExhibitionSummary {
  id: string;
  museumMode: MuseumMode;
  title: string;
  theme: string;
  score: number | null;
  artifactCount: number;
  updatedAt: string;
}

export const STEPS = [
  { id: 1, key: "venue", label: "전시관" },
  { id: 2, key: "theme", label: "주제" },
  { id: 3, key: "artifacts", label: "유물" },
  { id: 4, key: "space", label: "공간" },
  { id: 5, key: "route", label: "동선" },
  { id: 6, key: "ai", label: "AI 평가" },
  { id: 7, key: "complete", label: "완성" },
] as const;

export const initialExhibitionState: ExhibitionState = {
  museumMode: null,
  step: 1,
  view: "edit",
  title: "",
  theme: "",
  description: "",
  selectedArtifactIds: [],
  placedArtifacts: [],
  panels: [],
  route: [],
  aiEvaluation: null,
  visitorPerspective: "general",
  previewIndex: 0,
  selection: null,
  createdAt: "",
  updatedAt: "",
};
