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
  highlightId,
}: {
  interactive?: boolean;
  showRoute?: boolean;
  highlightId?: string;
}) {
  const { state, dispatch } = useExhibition();
  const mode = (state.museumMode ?? "free") as MuseumMode;
  const room = rooms[mode];
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
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
      setScale(Math.min(1, w / CANVAS.w));
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
    return state.route
      .map((id) => state.placedArtifacts.find((p) => p.instanceId === id))
      .filter(Boolean)
      .map((p) => ({
        id: p!.instanceId,
        x: p!.x + p!.width / 2,
        y: p!.y + p!.height / 2,
      }));
  }, [state.route, state.placedArtifacts]);

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
            background: room.floorColor,
          }}
          className="relative museum-grid shadow-[inset_0_0_0_18px_#d7cbb6]"
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
            className="absolute inset-0 border-[14px]"
            style={{ borderColor: room.wallColor }}
          />
          {room.zones.map((zone) => (
            <div
              key={zone.id}
              style={{
                left: zone.x,
                top: zone.y,
                width: zone.w,
                height: zone.h,
                borderColor: `${room.accent}55`,
              }}
              className="absolute border border-dashed"
            >
              <span className="absolute left-2 top-2 text-[10px] tracking-widest text-warm">
                {zone.label}
              </span>
            </div>
          ))}
          <p className="absolute left-1/2 top-5 -translate-x-1/2 font-serif text-lg text-navy">
            {room.name}
          </p>
          <span
            style={{ left: room.entrance.x, top: room.entrance.y }}
            className="absolute text-[11px] tracking-widest text-navy"
          >
            → {room.entrance.label}
          </span>
          {room.exit ? (
            <span
              style={{ left: room.exit.x, top: room.exit.y }}
              className="absolute text-[11px] tracking-widest text-navy"
            >
              {room.exit.label} →
            </span>
          ) : null}

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
      <p className="mt-2 text-[11px] text-warm">{room.note}</p>
    </div>
  );
}

/** Reserved for a future 3D canvas. MVP uses ExhibitionCanvas2D only. */
export function ExhibitionCanvas3D() {
  return null;
}
