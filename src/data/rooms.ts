import type { MuseumMode } from "@/types/exhibition";

export const CANVAS = { w: 1100, h: 640 };

export interface RoomZone {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "wall" | "pedestal" | "case";
}

export interface RoomPlan {
  id: MuseumMode;
  name: string;
  note: string;
  wallColor: string;
  wallInner: string;
  floorColor: string;
  floorAlt: string;
  accent: string;
  light: string;
  zones: RoomZone[];
  entrance: { x: number; y: number; label: string };
  exit: { x: number; y: number; label: string };
}

export const rooms: Record<MuseumMode, RoomPlan> = {
  gongju: {
    id: "gongju",
    name: "EXHIBITION ROOM A",
    note: "CURA의 가상 2D 전시 공간입니다. 실제 박물관의 평면도와는 다릅니다.",
    wallColor: "#cbb896",
    wallInner: "#e8d7b8",
    floorColor: "#efe4cf",
    floorAlt: "#e4d4b8",
    accent: "#8b5a3c",
    light: "rgba(196, 164, 110, 0.22)",
    zones: [
      { id: "a", label: "벽면 전시 A", x: 48, y: 58, w: 300, h: 200, kind: "wall" },
      { id: "b", label: "벽면 전시 B", x: 752, y: 58, w: 300, h: 200, kind: "wall" },
      { id: "c", label: "중앙 전시대", x: 390, y: 250, w: 320, h: 168, kind: "pedestal" },
    ],
    entrance: { x: 48, y: 575, label: "ENTRY" },
    exit: { x: 980, y: 575, label: "EXIT" },
  },
  gimhae: {
    id: "gimhae",
    name: "EXHIBITION ROOM A",
    note: "CURA의 가상 2D 전시 공간입니다. 실제 박물관의 평면도와는 다릅니다.",
    wallColor: "#9aa3aa",
    wallInner: "#c5ccd1",
    floorColor: "#dfe3e1",
    floorAlt: "#d0d6d3",
    accent: "#3d5a4c",
    light: "rgba(90, 120, 110, 0.2)",
    zones: [
      { id: "a", label: "① 철기", x: 56, y: 64, w: 250, h: 188, kind: "wall" },
      { id: "b", label: "② 토기", x: 425, y: 64, w: 250, h: 188, kind: "wall" },
      { id: "c", label: "③ 교류", x: 794, y: 64, w: 250, h: 188, kind: "wall" },
      { id: "d", label: "중앙 전시대", x: 360, y: 330, w: 380, h: 150, kind: "pedestal" },
    ],
    entrance: { x: 48, y: 575, label: "ENTRY" },
    exit: { x: 980, y: 575, label: "EXIT" },
  },
  gyeongju: {
    id: "gyeongju",
    name: "EXHIBITION ROOM A",
    note: "CURA의 가상 2D 전시 공간입니다. 실제 박물관의 평면도와는 다릅니다.",
    wallColor: "#d9c7a0",
    wallInner: "#f0e4c8",
    floorColor: "#f4ead6",
    floorAlt: "#ead9b8",
    accent: "#b0892e",
    light: "rgba(201, 162, 70, 0.24)",
    zones: [
      { id: "a", label: "서측 벽면", x: 40, y: 70, w: 210, h: 430, kind: "wall" },
      { id: "b", label: "중앙 전시대", x: 330, y: 180, w: 440, h: 230, kind: "pedestal" },
      { id: "c", label: "동측 벽면", x: 850, y: 70, w: 210, h: 430, kind: "wall" },
    ],
    entrance: { x: 48, y: 575, label: "ENTRY" },
    exit: { x: 980, y: 575, label: "EXIT" },
  },
  chuncheon: {
    id: "chuncheon",
    name: "EXHIBITION ROOM A",
    note: "CURA의 가상 2D 전시 공간입니다. 실제 박물관의 평면도와는 다릅니다. 선사 → 고대 → 중세 → 근세의 시간 흐름을 따라 배치해 보세요.",
    wallColor: "#b7b3a6",
    wallInner: "#e6e0d4",
    floorColor: "#ebe6dc",
    floorAlt: "#ddd6c8",
    accent: "#4d5c4a",
    light: "rgba(90, 110, 80, 0.18)",
    zones: [
      { id: "a", label: "① 선사", x: 40, y: 56, w: 240, h: 210, kind: "wall" },
      { id: "b", label: "② 고대", x: 300, y: 56, w: 240, h: 210, kind: "wall" },
      { id: "c", label: "③ 중세", x: 560, y: 56, w: 240, h: 210, kind: "wall" },
      { id: "d", label: "④ 근세", x: 820, y: 56, w: 240, h: 210, kind: "wall" },
      { id: "e", label: "중앙 전시대", x: 340, y: 320, w: 420, h: 160, kind: "pedestal" },
    ],
    entrance: { x: 48, y: 575, label: "ENTRY" },
    exit: { x: 980, y: 575, label: "EXIT" },
  },
  jeju: {
    id: "jeju",
    name: "EXHIBITION ROOM A",
    note: "CURA의 가상 2D 전시 공간입니다. 실제 박물관의 평면도와는 다릅니다.",
    wallColor: "#d7e3ea",
    wallInner: "#eef5f8",
    floorColor: "#f3f6f4",
    floorAlt: "#e4ece6",
    accent: "#3d7ea6",
    light: "rgba(120, 180, 200, 0.2)",
    zones: [
      { id: "a", label: "열린 벽면", x: 70, y: 70, w: 420, h: 180, kind: "wall" },
      { id: "b", label: "쇼케이스", x: 620, y: 90, w: 400, h: 160, kind: "case" },
      { id: "c", label: "중앙 좌대", x: 280, y: 320, w: 540, h: 170, kind: "pedestal" },
    ],
    entrance: { x: 48, y: 575, label: "ENTRY" },
    exit: { x: 980, y: 575, label: "EXIT" },
  },
  met: {
    id: "met",
    name: "GALLERY A",
    note: "CURA의 가상 2D 전시 공간입니다. 실제 박물관의 평면도와는 다릅니다.",
    wallColor: "#d8d2c6",
    wallInner: "#f4efe6",
    floorColor: "#ebe4d6",
    floorAlt: "#ddd4c4",
    accent: "#1d3557",
    light: "rgba(80, 90, 70, 0.16)",
    zones: [
      { id: "a", label: "회화 벽면", x: 50, y: 58, w: 1000, h: 120, kind: "wall" },
      { id: "b", label: "조각 좌대", x: 160, y: 250, w: 220, h: 180, kind: "pedestal" },
      { id: "c", label: "중앙 갤러리", x: 440, y: 240, w: 220, h: 200, kind: "pedestal" },
      { id: "d", label: "고전 좌대", x: 720, y: 250, w: 220, h: 180, kind: "pedestal" },
    ],
    entrance: { x: 48, y: 575, label: "ENTRY" },
    exit: { x: 980, y: 575, label: "EXIT" },
  },
  free: {
    id: "free",
    name: "OPEN GALLERY",
    note: "CURA의 가상 2D 전시 공간입니다. 실제 박물관의 평면도와는 다릅니다.",
    wallColor: "#ddd6c8",
    wallInner: "#f7f4ee",
    floorColor: "#f4efe6",
    floorAlt: "#e8e1d4",
    accent: "#0b2545",
    light: "rgba(11, 37, 69, 0.12)",
    zones: [
      { id: "a", label: "서측 벽면", x: 40, y: 60, w: 220, h: 470, kind: "wall" },
      { id: "b", label: "중앙", x: 340, y: 160, w: 420, h: 270, kind: "pedestal" },
      { id: "c", label: "동측 벽면", x: 840, y: 60, w: 220, h: 470, kind: "wall" },
    ],
    entrance: { x: 48, y: 575, label: "ENTRY" },
    exit: { x: 980, y: 575, label: "EXIT" },
  },
};
