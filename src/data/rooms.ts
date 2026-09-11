import type { MuseumMode } from "@/types/exhibition";

export const CANVAS = { w: 1100, h: 640 };

export interface RoomZone {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RoomPlan {
  id: MuseumMode;
  name: string;
  note: string;
  wallColor: string;
  floorColor: string;
  accent: string;
  zones: RoomZone[];
  entrance: { x: number; y: number; label: string };
  exit?: { x: number; y: number; label: string };
}

export const rooms: Record<MuseumMode, RoomPlan> = {
  gongju: {
    id: "gongju",
    name: "전시실 A",
    note: "웅진 백제 모티프의 단순화된 2D 전시실입니다. 실제 건축의 복제가 아닙니다.",
    wallColor: "#d8c7a8",
    floorColor: "#efe6d4",
    accent: "#8b5a3c",
    zones: [
      { id: "a", label: "벽면 전시 A", x: 48, y: 54, w: 320, h: 210 },
      { id: "b", label: "벽면 전시 B", x: 730, y: 54, w: 320, h: 210 },
      { id: "c", label: "중앙 좌대", x: 390, y: 250, w: 320, h: 180 },
    ],
    entrance: { x: 70, y: 575, label: "입구" },
  },
  gimhae: {
    id: "gimhae",
    name: "전시실 A",
    note: "가야 상설전시의 흐름을 단순화한 2D 전시실입니다. 실제 건축의 복제가 아닙니다.",
    wallColor: "#cfd6dc",
    floorColor: "#e8ece9",
    accent: "#3d5a4c",
    zones: [
      { id: "a", label: "①", x: 70, y: 70, w: 280, h: 200 },
      { id: "b", label: "②", x: 410, y: 70, w: 280, h: 200 },
      { id: "c", label: "③", x: 750, y: 70, w: 280, h: 200 },
      { id: "d", label: "④", x: 180, y: 320, w: 300, h: 190 },
      { id: "e", label: "⑤", x: 560, y: 320, w: 300, h: 190 },
    ],
    entrance: { x: 70, y: 575, label: "입구" },
    exit: { x: 1000, y: 575, label: "출구" },
  },
  free: {
    id: "free",
    name: "열린 전시실",
    note: "백색 갤러리를 단순화한 2D 전시실입니다.",
    wallColor: "#ece8df",
    floorColor: "#f7f4ee",
    accent: "#0b2545",
    zones: [
      { id: "a", label: "서측 벽면", x: 50, y: 60, w: 240, h: 480 },
      { id: "b", label: "중앙", x: 360, y: 150, w: 380, h: 280 },
      { id: "c", label: "동측 벽면", x: 810, y: 60, w: 240, h: 480 },
    ],
    entrance: { x: 70, y: 575, label: "입구" },
    exit: { x: 1000, y: 575, label: "출구" },
  },
};
