import {
  initialExhibitionState,
  type ExhibitionState,
  type ExhibitionSummary,
} from "@/types/exhibition";

export const STORAGE_KEY = "cura-exhibition-v1";
export const HISTORY_KEY = "cura-exhibition-history-v1";

function withDefaults(parsed: Partial<ExhibitionState>): ExhibitionState {
  return {
    ...initialExhibitionState,
    ...parsed,
    selection: null,
    placedArtifacts: (parsed.placedArtifacts ?? []).map((item) => ({
      ...item,
      displayStyle: item.displayStyle ?? "pedestal",
    })),
    createdAt: parsed.createdAt || parsed.aiEvaluation?.createdAt || "",
    updatedAt: parsed.updatedAt || "",
  };
}

export function loadExhibition(): ExhibitionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialExhibitionState;
    return withDefaults(JSON.parse(raw) as Partial<ExhibitionState>);
  } catch {
    return initialExhibitionState;
  }
}

export function saveExhibition(state: ExhibitionState): void {
  const { selection: _selection, ...rest } = state;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...rest, updatedAt: new Date().toISOString() }),
  );
}

export function clearExhibition(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasSavedExhibition(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as ExhibitionState;
    return Boolean(parsed.museumMode);
  } catch {
    return false;
  }
}

export function loadHistory(): ExhibitionSummary[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExhibitionSummary[];
    return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function rememberExhibition(state: ExhibitionState): void {
  if (!state.museumMode || !state.title) return;
  const entry: ExhibitionSummary = {
    id: state.createdAt || state.updatedAt || new Date().toISOString(),
    museumMode: state.museumMode,
    title: state.title,
    theme: state.theme,
    score: state.aiEvaluation?.scores.overall ?? null,
    artifactCount: state.placedArtifacts.length,
    updatedAt: new Date().toISOString(),
  };
  const rest = loadHistory().filter(
    (item) => item.title !== entry.title || item.museumMode !== entry.museumMode,
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...rest].slice(0, 6)));
}
