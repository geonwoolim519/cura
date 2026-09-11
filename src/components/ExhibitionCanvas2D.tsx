import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { CANVAS, rooms } from "@/data/rooms";
import { getArtifact } from "@/data/artifacts";
import { useExhibition } from "@/store/ExhibitionContext";
import type { CanvasSelection, MuseumMode } from "@/types/exhibition";
import { ArtifactItem } from "./ArtifactItem";
import { ExhibitionPanel } from "./ExhibitionPanel";

export function ExhibitionCanvas2D({
  interactive = true,
  showRoute = false,
  routeEdit = false,
  highlightId,
}: {
  interactive?: boolean;
  showRoute?: boolean;
  routeEdit?: boolean;
  highlightId?: string;
}) {
  const { state, dispatch } = useExhibition();
  const mode = (state.museumMode ?? "free") as MuseumMode;
  const room = rooms[mode];
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [zoom, setZoom] = useState(1);
  const scale = fit * zoom;
  const drag = useRef<{
    selection: NonNullable<CanvasSelection>;
    mode: "move" | "resize";
    ox: number;
    oy: number;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
  } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setFit(Math.min(1, w / CANVAS.w));
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const current = drag.current;
      if (!current) return;
      const dx = (e.clientX - current.sx) / scale;
      const dy = (e.clientY - current.sy) / scale;
      if (current.mode === "move") {
        dispatch({
          type: "MOVE_ITEM",
          selection: current.selection,
          x: Math.max(8, Math.min(CANVAS.w - 80, current.ox + dx)),
          y: Math.max(8, Math.min(CANVAS.h - 60, current.oy + dy)),
        });
      } else {
        dispatch({
          type: "RESIZE_ITEM",
          selection: current.selection,
          width: Math.max(96, Math.min(280, current.sw + dx)),
          height: Math.max(88, Math.min(260, current.sh + dy)),
        });
      }
    };
    const onUp = () => {
      drag.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dispatch, scale]);

  const routePts = useMemo(() => {
    const pts = state.route
      .map((id) => state.placedArtifacts.find((p) => p.instanceId === id))
      .filter(Boolean)
      .map((p) => ({
        id: p!.instanceId,
        x: p!.x + p!.width / 2,
        y: p!.y + p!.height / 2,
      }));
    return [
      { id: "entry", x: room.entrance.x + 24, y: room.entrance.y - 8 },
      ...pts,
      { id: "exit", x: room.exit.x + 20, y: room.exit.y - 8 },
    ];
  }, [state.route, state.placedArtifacts, room.entrance, room.exit]);

  const toCanvas = (e: DragEvent | ReactPointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 80, y: 80 };
    return {
      x: (e.clientX - rect.left) / scale - 66,
      y: (e.clientY - rect.top) / scale - 66,
    };
  };

  return (
    <div ref={wrapRef} className="w-full overflow-auto">
      <div
        style={{
          width: CANVAS.w * scale,
          height: CANVAS.h * scale,
        }}
      >
        <div
          ref={canvasRef}
          style={{
            width: CANVAS.w,
            height: CANVAS.h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            backgroundColor: room.floorColor,
            backgroundImage: `linear-gradient(90deg, ${room.floorAlt} 1px, transparent 1px), linear-gradient(${room.floorAlt} 1px, transparent 1px)`,
            backgroundSize: "34px 34px",
          }}
          className="relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const artifactId = e.dataTransfer.getData(
              "application/x-cura-artifact",
            );
            if (!artifactId) return;
            const pos = toCanvas(e);
            dispatch({
              type: "PLACE_ARTIFACT",
              artifactId,
              x: pos.x,
              y: pos.y,
            });
          }}
          onPointerDown={(e) => {
            if (!interactive) return;
            const target = e.target as HTMLElement;
            if (target.closest("[data-canvas-item]")) return;
            dispatch({ type: "SELECT", selection: null });
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              boxShadow: `inset 0 0 0 22px ${room.wallColor}, inset 0 0 0 28px ${room.wallInner}`,
            }}
          />
          {room.zones.map((zone) => (
            <div
              key={zone.id}
              style={{
                left: zone.x,
                top: zone.y,
                width: zone.w,
                height: zone.h,
                background:
                  zone.kind === "pedestal"
                    ? "linear-gradient(#d7c4a3, #c4ae86)"
                    : zone.kind === "case"
                      ? "rgba(255,255,255,0.35)"
                      : room.wallInner,
                borderColor:
                  zone.kind === "case" ? "rgba(111,183,178,0.45)" : `${room.accent}40`,
              }}
              className="absolute border"
            >
              <span className="absolute left-2 top-2 text-[10px] tracking-[0.16em] text-warm">
                {zone.label}
              </span>
            </div>
          ))}
          <p className="absolute left-1/2 top-6 -translate-x-1/2 text-[12px] tracking-[0.32em] text-navy/80">
            {room.name}
          </p>
          <span
            style={{ left: room.entrance.x, top: room.entrance.y }}
            className="absolute text-[11px] tracking-[0.22em] text-navy"
          >
            ENTRY →
          </span>
          <span
            style={{ left: room.exit.x, top: room.exit.y }}
            className="absolute text-[11px] tracking-[0.22em] text-navy"
          >
            EXIT →
          </span>

          {showRoute && routePts.length > 1 ? (
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              {routePts.slice(1).map((pt, i) => {
                const prev = routePts[i];
                return (
                  <line
                    key={`${prev.id}-${pt.id}`}
                    x1={prev.x}
                    y1={prev.y}
                    x2={pt.x}
                    y2={pt.y}
                    stroke="#0b2545"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow)"
                  />
                );
              })}
              <defs>
                <marker
                  id="arrow"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                >
                  <path d="M0,0 L8,4 L0,8 z" fill="#0b2545" />
                </marker>
              </defs>
            </svg>
          ) : null}

          {state.panels.map((panel) => (
            <ExhibitionPanel
              key={panel.id}
              panel={panel}
              selected={
                state.selection?.type === "panel" &&
                state.selection.id === panel.id
              }
              interactive={interactive}
              onPointerDown={(e) => {
                e.stopPropagation();
                const selection = { type: "panel" as const, id: panel.id };
                dispatch({ type: "SELECT", selection });
                if (!interactive) return;
                drag.current = {
                  selection,
                  mode: "move",
                  ox: panel.x,
                  oy: panel.y,
                  sx: e.clientX,
                  sy: e.clientY,
                  sw: panel.width,
                  sh: panel.height,
                };
              }}
            />
          ))}

          {state.placedArtifacts.map((item) => {
            const artifact = getArtifact(item.artifactId);
            if (!artifact) return null;
            const selected =
              (state.selection?.type === "artifact" &&
                state.selection.instanceId === item.instanceId) ||
              highlightId === item.instanceId;
            const routeIndex = showRoute
              ? state.route.indexOf(item.instanceId) + 1
              : undefined;
            return (
              <div key={item.instanceId} className="contents">
                <ArtifactItem
                  item={item}
                  artifact={artifact}
                  selected={Boolean(selected)}
                  interactive={interactive}
                  routeIndex={routeIndex || undefined}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const selection = {
                      type: "artifact" as const,
                      instanceId: item.instanceId,
                    };
                    dispatch({ type: "SELECT", selection });
                    if (routeEdit) {
                      dispatch({ type: "TOGGLE_ROUTE", instanceId: item.instanceId });
                      return;
                    }
                    if (!interactive) return;
                    drag.current = {
                      selection,
                      mode: "move",
                      ox: item.x,
                      oy: item.y,
                      sx: e.clientX,
                      sy: e.clientY,
                      sw: item.width,
                      sh: item.height,
                    };
                  }}
                />
                {interactive &&
                state.selection?.type === "artifact" &&
                state.selection.instanceId === item.instanceId ? (
                  <button
                    type="button"
                    aria-label="크기 조절"
                    className="absolute z-30 h-3 w-3 bg-navy"
                    style={{
                      left: item.x + item.width - 6,
                      top: item.y + item.height - 6,
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      drag.current = {
                        selection: {
                          type: "artifact",
                          instanceId: item.instanceId,
                        },
                        mode: "resize",
                        ox: item.x,
                        oy: item.y,
                        sx: e.clientX,
                        sy: e.clientY,
                        sw: item.width,
                        sh: item.height,
                      };
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] text-warm">{room.note}</p>
        <div className="flex gap-1">
          <button
            type="button"
            className="h-8 w-8 border border-line text-sm"
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
          >
            −
          </button>
          <button
            type="button"
            className="h-8 w-8 border border-line text-sm"
            onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(2))))}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

/** Reserved for a future 3D canvas. MVP uses ExhibitionCanvas2D only. */
export function ExhibitionCanvas3D() {
  return null;
}
