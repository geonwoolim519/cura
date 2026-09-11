import {
  initialExhibitionState,
  type ExhibitionState,
} from "@/types/exhibition";

export const STORAGE_KEY = "cura-exhibition-v1";

export function loadExhibition(): ExhibitionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialExhibitionState;
    const parsed = JSON.parse(raw) as Partial<ExhibitionState>;
    return {
      ...initialExhibitionState,
      ...parsed,
      selection: null,
    };
  } catch {
    return initialExhibitionState;
  }
}

export function saveExhibition(state: ExhibitionState): void {
  const { selection: _selection, ...rest } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
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
