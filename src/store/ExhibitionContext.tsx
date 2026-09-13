import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { evaluateExhibition } from "@/lib/mockAI";
import {
  clearExhibition,
  loadExhibition,
  rememberExhibition,
  saveExhibition,
} from "@/lib/storage";
import { uid } from "@/lib/wiki";
import type {
  CanvasSelection,
  CreateView,
  DisplayStyle,
  ExhibitionPanel,
  ExhibitionState,
  MuseumMode,
  PanelKind,
  VisitorPerspective,
} from "@/types/exhibition";

type Action =
  | { type: "HYDRATE"; payload: ExhibitionState }
  | { type: "RESET" }
  | { type: "SET_MUSEUM"; mode: MuseumMode }
  | { type: "SET_STEP"; step: number }
  | { type: "SET_VIEW"; view: CreateView }
  | { type: "SET_THEME"; title: string; theme: string; description: string }
  | { type: "TOGGLE_ARTIFACT"; id: string }
  | { type: "REMOVE_SELECTED"; id: string }
  | {
      type: "PLACE_ARTIFACT";
      artifactId: string;
      x: number;
      y: number;
    }
  | {
      type: "MOVE_ITEM";
      selection: NonNullable<CanvasSelection>;
      x: number;
      y: number;
    }
  | {
      type: "RESIZE_ITEM";
      selection: NonNullable<CanvasSelection>;
      width: number;
      height: number;
    }
  | { type: "SELECT"; selection: CanvasSelection }
  | { type: "DELETE_SELECTION" }
  | { type: "ADD_PANEL"; kind: PanelKind }
  | { type: "UPDATE_PANEL"; id: string; title: string; body: string }
  | { type: "SET_ROUTE"; route: string[] }
  | { type: "TOGGLE_ROUTE"; instanceId: string }
  | { type: "ROTATE_ITEM"; instanceId: string; rotation: number }
  | {
      type: "SET_DISPLAY";
      instanceId: string;
      displayStyle: DisplayStyle;
    }
  | { type: "EVALUATE" }
  | { type: "SET_VISITOR"; visitor: VisitorPerspective }
  | { type: "SET_PREVIEW_INDEX"; index: number };

function reducer(state: ExhibitionState, action: Action): ExhibitionState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "RESET":
      clearExhibition();
      return loadEmpty();
    case "SET_MUSEUM":
      return {
        ...loadEmpty(),
        museumMode: action.mode,
        step: 2,
        view: "edit",
        createdAt: new Date().toISOString(),
      };
    case "SET_STEP":
      return {
        ...state,
        step: action.step,
        view: action.step >= 7 ? state.view : "edit",
        selection: null,
      };
    case "SET_VIEW":
      return { ...state, view: action.view, previewIndex: 0 };
    case "SET_THEME":
      return {
        ...state,
        title: action.title,
        theme: action.theme,
        description: action.description,
      };
    case "TOGGLE_ARTIFACT": {
      const exists = state.selectedArtifactIds.includes(action.id);
      const selectedArtifactIds = exists
        ? state.selectedArtifactIds.filter((id) => id !== action.id)
        : [...state.selectedArtifactIds, action.id];
      const placedArtifacts = exists
        ? state.placedArtifacts.filter((p) => p.artifactId !== action.id)
        : state.placedArtifacts;
      const placedIds = new Set(placedArtifacts.map((p) => p.instanceId));
      return {
        ...state,
        selectedArtifactIds,
        placedArtifacts,
        route: state.route.filter((id) => placedIds.has(id)),
      };
    }
    case "REMOVE_SELECTED":
      return reducer(state, { type: "TOGGLE_ARTIFACT", id: action.id });
    case "PLACE_ARTIFACT": {
      if (state.placedArtifacts.some((p) => p.artifactId === action.artifactId)) {
        const existing = state.placedArtifacts.find(
          (p) => p.artifactId === action.artifactId,
        );
        return {
          ...state,
          selection: existing
            ? { type: "artifact", instanceId: existing.instanceId }
            : state.selection,
        };
      }
      const instanceId = uid();
      const selectedArtifactIds = state.selectedArtifactIds.includes(
        action.artifactId,
      )
        ? state.selectedArtifactIds
        : [...state.selectedArtifactIds, action.artifactId];
      return {
        ...state,
        selectedArtifactIds,
        placedArtifacts: [
          ...state.placedArtifacts,
          {
            instanceId,
            artifactId: action.artifactId,
            x: action.x,
            y: action.y,
            width: 132,
            height: 132,
            rotation: 0,
            displayOrder: state.placedArtifacts.length + 1,
            displayStyle: "pedestal",
          },
        ],
        route: [...state.route, instanceId],
        selection: { type: "artifact", instanceId },
      };
    }
    case "MOVE_ITEM": {
      if (action.selection.type === "artifact") {
        const instanceId = action.selection.instanceId;
        return {
          ...state,
          placedArtifacts: state.placedArtifacts.map((item) =>
            item.instanceId === instanceId
              ? { ...item, x: action.x, y: action.y }
              : item,
          ),
        };
      }
      const panelId = action.selection.id;
      return {
        ...state,
        panels: state.panels.map((item) =>
          item.id === panelId ? { ...item, x: action.x, y: action.y } : item,
        ),
      };
    }
    case "RESIZE_ITEM": {
      if (action.selection.type === "artifact") {
        const instanceId = action.selection.instanceId;
        return {
          ...state,
          placedArtifacts: state.placedArtifacts.map((item) =>
            item.instanceId === instanceId
              ? { ...item, width: action.width, height: action.height }
              : item,
          ),
        };
      }
      const panelId = action.selection.id;
      return {
        ...state,
        panels: state.panels.map((item) =>
          item.id === panelId
            ? { ...item, width: action.width, height: action.height }
            : item,
        ),
      };
    }
    case "SELECT":
      return { ...state, selection: action.selection };
    case "DELETE_SELECTION": {
      if (!state.selection) return state;
      if (state.selection.type === "artifact") {
        const instanceId = state.selection.instanceId;
        return {
          ...state,
          placedArtifacts: state.placedArtifacts.filter(
            (p) => p.instanceId !== instanceId,
          ),
          route: state.route.filter((id) => id !== instanceId),
          selection: null,
        };
      }
      const panelId = state.selection.id;
      return {
        ...state,
        panels: state.panels.filter((p) => p.id !== panelId),
        selection: null,
      };
    }
    case "ADD_PANEL": {
      const panel: ExhibitionPanel = {
        id: uid(),
        kind: action.kind,
        title: action.kind === "title" ? state.title || "전시 제목" : action.kind === "pedestal" ? "전시대" : "설명 패널",
        body:
          action.kind === "title"
            ? state.theme || "주제를 입력하세요"
            : action.kind === "pedestal"
              ? "유물을 올려 두는 전시대"
              : "관람객에게 전하고 싶은 설명을 적어 보세요.",
        x: action.kind === "title" ? 400 : action.kind === "pedestal" ? 360 : 160,
        y: action.kind === "title" ? 48 : action.kind === "pedestal" ? 300 : 200,
        width: action.kind === "title" ? 320 : action.kind === "pedestal" ? 220 : 240,
        height: action.kind === "title" ? 88 : action.kind === "pedestal" ? 70 : 150,
      };
      return {
        ...state,
        panels: [...state.panels, panel],
        selection: { type: "panel", id: panel.id },
      };
    }
    case "UPDATE_PANEL":
      return {
        ...state,
        panels: state.panels.map((p) =>
          p.id === action.id
            ? { ...p, title: action.title, body: action.body }
            : p,
        ),
      };
    case "SET_ROUTE":
      return { ...state, route: action.route };
    case "TOGGLE_ROUTE": {
      const exists = state.route.includes(action.instanceId);
      return {
        ...state,
        route: exists
          ? state.route.filter((id) => id !== action.instanceId)
          : [...state.route, action.instanceId],
      };
    }
    case "ROTATE_ITEM":
      return {
        ...state,
        placedArtifacts: state.placedArtifacts.map((item) =>
          item.instanceId === action.instanceId
            ? { ...item, rotation: action.rotation }
            : item,
        ),
      };
    case "SET_DISPLAY":
      return {
        ...state,
        placedArtifacts: state.placedArtifacts.map((item) =>
          item.instanceId === action.instanceId
            ? { ...item, displayStyle: action.displayStyle }
            : item,
        ),
      };
    case "EVALUATE": {
      const next = {
        ...state,
        aiEvaluation: evaluateExhibition(state, state.aiEvaluation),
      };
      rememberExhibition(next);
      return next;
    }
    case "SET_VISITOR": {
      const next = { ...state, visitorPerspective: action.visitor };
      if (state.aiEvaluation) {
        next.aiEvaluation = evaluateExhibition(next);
      }
      return next;
    }
    case "SET_PREVIEW_INDEX":
      return { ...state, previewIndex: action.index };
    default:
      return state;
  }
}

function loadEmpty(): ExhibitionState {
  return {
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
}

const ExhibitionContext = createContext<{
  state: ExhibitionState;
  dispatch: Dispatch<Action>;
  hydrated: boolean;
} | null>(null);

export function ExhibitionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, loadEmpty());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    dispatch({ type: "HYDRATE", payload: loadExhibition() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveExhibition(state);
  }, [state, hydrated]);

  const value = useMemo(
    () => ({ state, dispatch, hydrated }),
    [state, hydrated],
  );

  return (
    <ExhibitionContext.Provider value={value}>
      {children}
    </ExhibitionContext.Provider>
  );
}

export function useExhibition() {
  const ctx = useContext(ExhibitionContext);
  if (!ctx) throw new Error("ExhibitionProvider missing");
  return ctx;
}
