import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import type { CSSProperties } from "react";
import type { CardData } from "../types";
import { ImageCardThumb } from "./ImageCardThumb";
import { useViewportMetrics } from "../hooks/useViewportMetrics";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function wrap(value: number, size: number) {
  const result = value % size;
  return result < 0 ? result + size : result;
}

type InfiniteGalleryProps = {
  cards: CardData[];
  onOpenCard: (card: CardData) => void;
  isModalOpen?: boolean;
};

const PRELOAD_COLUMNS = 2;
const PRELOAD_ROWS = 1;
const RECENTER_THRESHOLD_X = 1;
const RECENTER_THRESHOLD_Y = 2;
const MIN_ZOOM = 0.36;
const MAX_ZOOM = 1;
const DESKTOP_SCROLL_PADDING_X = 34 * 2;
const DESKTOP_SCROLL_GAP_X = 26 * 4;
const MOBILE_SCROLL_PADDING_X = 20 * 2;
const MOBILE_SCROLL_GAP_X = 20;
const DESKTOP_GRID_GAP_X = 26;
const DESKTOP_GRID_GAP_Y = 34;
const MOBILE_GRID_GAP_X = 20;
const MOBILE_GRID_GAP_Y = 24;

export function InfiniteGallery({ cards, onOpenCard, isModalOpen = false }: InfiniteGalleryProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [gridWindow, setGridWindow] = useState({ centerCol: 2, centerRow: 2 });
  const metrics = useViewportMetrics();
  const isCoarsePointer =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const targetRef = useRef({ x: 0, y: 0 });
  const scaleTargetRef = useRef(1);
  const scaleRef = useRef(1);
  const momentumRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerStartX: number;
    pointerStartY: number;
    originX: number;
    originY: number;
    distanceStart: number | null;
    scaleStart: number;
    cardId: string | null;
    moved: boolean;
    lastClientX: number;
    lastClientY: number;
    lastTimeStamp: number;
  } | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLElement | null>(null);
  const gridLayerRef = useRef<HTMLDivElement | null>(null);
  const gridBackdropRef = useRef<HTMLDivElement | null>(null);
  const gridWindowRef = useRef(gridWindow);
  const isDraggingRef = useRef(false);
  const isMobileLayout = metrics.width <= 720;
  const baseCellSize =
    isMobileLayout
      ? (metrics.width - MOBILE_SCROLL_PADDING_X - MOBILE_SCROLL_GAP_X) / 2
      : (metrics.width - DESKTOP_SCROLL_PADDING_X - DESKTOP_SCROLL_GAP_X) / 5;
  const stepX = baseCellSize + (isMobileLayout ? MOBILE_GRID_GAP_X : DESKTOP_GRID_GAP_X);
  const stepY = baseCellSize + (isMobileLayout ? MOBILE_GRID_GAP_Y : DESKTOP_GRID_GAP_Y);
  const pointerPositionsRef = useRef(new Map<number, { x: number; y: number }>());
  const cardMap = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);

  const syncGridTransforms = (nextX: number, nextY: number, nextScale: number) => {
    gridLayerRef.current?.style.setProperty("--grid-offset-x", `${nextX}px`);
    gridLayerRef.current?.style.setProperty("--grid-offset-y", `${nextY}px`);
    gridLayerRef.current?.style.setProperty("--grid-scale", `${nextScale}`);

    gridBackdropRef.current?.style.setProperty(
      "--grid-offset-x",
      `${wrap(nextX, stepX * nextScale)}px`
    );
    gridBackdropRef.current?.style.setProperty(
      "--grid-offset-y",
      `${wrap(nextY, stepY * nextScale)}px`
    );
    gridBackdropRef.current?.style.setProperty("--grid-scale", `${nextScale}`);
  };

  const updateDragging = (nextValue: boolean) => {
    if (isDraggingRef.current === nextValue) {
      return;
    }

    isDraggingRef.current = nextValue;
    setIsDragging(nextValue);
  };

  const syncGridWindow = (nextX: number, nextY: number, nextScale: number) => {
    const scaledStepX = stepX * nextScale;
    const scaledStepY = stepY * nextScale;
    const nextCenterCol = Math.round((-nextX + metrics.width / 2) / scaledStepX);
    const nextCenterRow = Math.round((-nextY + metrics.height / 2) / scaledStepY);
    const currentWindow = gridWindowRef.current;

    if (
      Math.abs(nextCenterCol - currentWindow.centerCol) > RECENTER_THRESHOLD_X ||
      Math.abs(nextCenterRow - currentWindow.centerRow) > RECENTER_THRESHOLD_Y
    ) {
      const nextWindow = { centerCol: nextCenterCol, centerRow: nextCenterRow };
      gridWindowRef.current = nextWindow;
      setGridWindow(nextWindow);
    }
  };

  useEffect(() => {
    gridWindowRef.current = gridWindow;
  }, [gridWindow]);

  useEffect(() => {
    document.documentElement.style.setProperty("--cell-size", `${baseCellSize * scaleRef.current}px`);
  }, [baseCellSize]);

  const zoomAtClientPoint = (
    nextScale: number,
    clientX: number,
    clientY: number,
    basisScale = scaleTargetRef.current,
    basisX = targetRef.current.x,
    basisY = targetRef.current.y
  ) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      scaleTargetRef.current = nextScale;
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const scaleRatio = nextScale / Math.max(basisScale, 0.0001);

    targetRef.current = {
      x: localX - (localX - basisX) * scaleRatio,
      y: localY - (localY - basisY) * scaleRatio,
    };
    scaleTargetRef.current = nextScale;
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return undefined;
    }

    const preventGesture = (event: Event) => {
      event.preventDefault();
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (event.ctrlKey || event.metaKey) {
        const nextScale = clamp(
          scaleTargetRef.current - event.deltaY * 0.0015,
          MIN_ZOOM,
          MAX_ZOOM
        );
        zoomAtClientPoint(nextScale, event.clientX, event.clientY);
        return;
      }

      targetRef.current = {
        x: targetRef.current.x - event.deltaX,
        y: targetRef.current.y - event.deltaY,
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    viewport.addEventListener("gesturestart", preventGesture, { passive: false });
    viewport.addEventListener("gesturechange", preventGesture, { passive: false });
    viewport.addEventListener("gestureend", preventGesture, { passive: false });
    viewport.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
      viewport.removeEventListener("gesturestart", preventGesture);
      viewport.removeEventListener("gesturechange", preventGesture);
      viewport.removeEventListener("gestureend", preventGesture);
      viewport.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useLayoutEffect(() => {
    if (isCoarsePointer) {
      let animationFrame = 0;

      const updatePosition = () => {
        if (!dragRef.current) {
          momentumRef.current.x *= 0.92;
          momentumRef.current.y *= 0.92;

          if (Math.abs(momentumRef.current.x) < 0.02) {
            momentumRef.current.x = 0;
          }

          if (Math.abs(momentumRef.current.y) < 0.02) {
            momentumRef.current.y = 0;
          }

          targetRef.current = {
            x: targetRef.current.x + momentumRef.current.x,
            y: targetRef.current.y + momentumRef.current.y,
          };
        }

        const current = positionRef.current;
        const movementEase = isDraggingRef.current ? 0.22 : 0.14;
        const scaleEase = 0.18;
        const nextX = current.x + (targetRef.current.x - current.x) * movementEase;
        const nextY = current.y + (targetRef.current.y - current.y) * movementEase;
        const nextScale =
          scaleRef.current + (scaleTargetRef.current - scaleRef.current) * scaleEase;

        positionRef.current = { x: nextX, y: nextY };
        scaleRef.current = nextScale;
        syncGridTransforms(nextX, nextY, nextScale);
        syncGridWindow(nextX, nextY, nextScale);
        animationFrame = window.requestAnimationFrame(updatePosition);
      };

      syncGridTransforms(positionRef.current.x, positionRef.current.y, scaleRef.current);
      syncGridWindow(positionRef.current.x, positionRef.current.y, scaleRef.current);
      animationFrame = window.requestAnimationFrame(updatePosition);

      return () => window.cancelAnimationFrame(animationFrame);
    }

    const updatePosition = () => {
      const current = positionRef.current;
      const movementEase = 0.12;
      const scaleEase = 0.14;
      const nextX = gsap.utils.interpolate(current.x, targetRef.current.x, movementEase);
      const nextY = gsap.utils.interpolate(current.y, targetRef.current.y, movementEase);
      const nextScale = gsap.utils.interpolate(scaleRef.current, scaleTargetRef.current, scaleEase);

      if (
        Math.abs(nextX - current.x) < 0.02 &&
        Math.abs(nextY - current.y) < 0.02 &&
        Math.abs(nextScale - scaleRef.current) < 0.001
      ) {
        syncGridTransforms(positionRef.current.x, positionRef.current.y, scaleRef.current);
        return;
      }

      positionRef.current = { x: nextX, y: nextY };
      scaleRef.current = nextScale;
      syncGridTransforms(nextX, nextY, nextScale);
      syncGridWindow(nextX, nextY, nextScale);
    };

    syncGridTransforms(positionRef.current.x, positionRef.current.y, scaleRef.current);
    gsap.ticker.add(updatePosition);
    return () => gsap.ticker.remove(updatePosition);
  }, [baseCellSize, isCoarsePointer, metrics.height, metrics.width, stepX, stepY]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointerPositionsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (!dragRef.current) {
        return;
      }

      const activePointers = Array.from(pointerPositionsRef.current.values());
      if (activePointers.length >= 2 && dragRef.current.distanceStart) {
        dragRef.current.moved = true;
        updateDragging(true);
        momentumRef.current = { x: 0, y: 0 };
        const [firstPointer, secondPointer] = activePointers;
        const distance = Math.hypot(
          secondPointer.x - firstPointer.x,
          secondPointer.y - firstPointer.y
        );
        const centerX = (firstPointer.x + secondPointer.x) / 2;
        const centerY = (firstPointer.y + secondPointer.y) / 2;
        const nextScale = clamp(
          dragRef.current.scaleStart * (distance / dragRef.current.distanceStart),
          MIN_ZOOM,
          MAX_ZOOM
        );
        zoomAtClientPoint(
          nextScale,
          centerX,
          centerY,
          dragRef.current.scaleStart,
          dragRef.current.originX,
          dragRef.current.originY
        );
        return;
      }

      const dragMultiplier = isCoarsePointer ? 1.2 : 1;
      const deltaX = event.clientX - dragRef.current.pointerStartX;
      const deltaY = event.clientY - dragRef.current.pointerStartY;
      const movementThreshold = dragRef.current.cardId ? (isCoarsePointer ? 18 : 6) : 0;
      const movementDistance = Math.hypot(deltaX, deltaY);

      if (!dragRef.current.moved) {
        if (movementDistance <= movementThreshold) {
          return;
        }
        dragRef.current.moved = true;
        updateDragging(true);
      }

      targetRef.current = {
        x: dragRef.current.originX + deltaX * dragMultiplier,
        y: dragRef.current.originY + deltaY * dragMultiplier,
      };

      const elapsed = Math.max(event.timeStamp - dragRef.current.lastTimeStamp, 16);
      const velocityX =
        ((event.clientX - dragRef.current.lastClientX) * dragMultiplier) / elapsed;
      const velocityY =
        ((event.clientY - dragRef.current.lastClientY) * dragMultiplier) / elapsed;

      dragRef.current.lastClientX = event.clientX;
      dragRef.current.lastClientY = event.clientY;
      dragRef.current.lastTimeStamp = event.timeStamp;

      if (isCoarsePointer) {
        momentumRef.current = {
          x: velocityX * 18,
          y: velocityY * 18,
        };
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      pointerPositionsRef.current.delete(event.pointerId);

      if (pointerPositionsRef.current.size >= 1 && dragRef.current) {
        const remainingPointer = Array.from(pointerPositionsRef.current.values())[0];
        dragRef.current = {
          pointerStartX: remainingPointer.x,
          pointerStartY: remainingPointer.y,
          originX: targetRef.current.x,
          originY: targetRef.current.y,
          distanceStart: null,
          scaleStart: scaleTargetRef.current,
          cardId: null,
          moved: true,
        };
        return;
      }

      const dragState = dragRef.current;
      const tapThreshold = isCoarsePointer ? 18 : 6;
      const tapDistance = dragState
        ? Math.hypot(event.clientX - dragState.pointerStartX, event.clientY - dragState.pointerStartY)
        : Number.POSITIVE_INFINITY;

      if (dragState?.cardId && !dragState.moved && tapDistance <= tapThreshold && !isModalOpen) {
        const card = cardMap.get(dragState.cardId);
        if (card) {
          onOpenCard(card);
        }
      }

      if (!isCoarsePointer || !dragState?.moved || dragState.distanceStart) {
        momentumRef.current = { x: 0, y: 0 };
      }

      dragRef.current = null;
      updateDragging(false);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [cardMap, isCoarsePointer, isModalOpen, onOpenCard]);

  const scaledStepX = stepX * scaleRef.current;
  const scaledStepY = stepY * scaleRef.current;
  const visibleRangeX = Math.max(
    PRELOAD_COLUMNS,
    Math.ceil(metrics.width / Math.max(scaledStepX, 1) / 2) + 2
  );
  const visibleRangeY = Math.max(
    PRELOAD_ROWS,
    Math.ceil(metrics.height / Math.max(scaledStepY, 1) / 2) + 2
  );

  const tiles = useMemo(() => {
    if (!cards.length) {
      return [];
    }

    const nextTiles: Array<{ key: string; row: number; col: number; card: CardData }> = [];
    for (
      let row = gridWindow.centerRow - visibleRangeY;
      row <= gridWindow.centerRow + visibleRangeY;
      row += 1
    ) {
      for (
        let col = gridWindow.centerCol - visibleRangeX;
        col <= gridWindow.centerCol + visibleRangeX;
        col += 1
      ) {
        const index = wrap(row * 17 + col * 31, cards.length);
        nextTiles.push({
          key: `${row}:${col}`,
          row,
          col,
          card: cards[index],
        });
      }
    }
    return nextTiles;
  }, [cards, gridWindow.centerCol, gridWindow.centerRow, visibleRangeX, visibleRangeY]);
  return (
    <main
      ref={viewportRef}
      className={`infinite-viewport ${isDragging ? "is-dragging" : ""}`}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }
        const target = event.target;
        const cardButton =
          target instanceof Element ? target.closest<HTMLButtonElement>(".card-thumb") : null;
        const activePointerCount = pointerPositionsRef.current.size + 1;

        if (!cardButton || activePointerCount > 1) {
          event.preventDefault();
        }

        momentumRef.current = { x: 0, y: 0 };

        pointerPositionsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const activePointers = Array.from(pointerPositionsRef.current.values());
        const hasPinch = activePointers.length >= 2;
        const pinchDistance = hasPinch
          ? Math.hypot(
              activePointers[1].x - activePointers[0].x,
              activePointers[1].y - activePointers[0].y
            )
          : null;

        dragRef.current = {
          pointerStartX: event.clientX,
          pointerStartY: event.clientY,
          originX: targetRef.current.x,
          originY: targetRef.current.y,
          distanceStart: pinchDistance,
          scaleStart: scaleTargetRef.current,
          cardId: hasPinch ? null : cardButton?.dataset.cardId ?? null,
          moved: false,
          lastClientX: event.clientX,
          lastClientY: event.clientY,
          lastTimeStamp: event.timeStamp,
        };
        updateDragging(false);
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      }}
    >
      <div ref={gridBackdropRef} className="infinite-backdrop" />
      <div ref={gridLayerRef} className="infinite-layer">
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className="infinite-cell"
            style={{
              "--thumb-long-side": `${baseCellSize}px`,
              left: `${tile.col * stepX}px`,
              top: `${tile.row * stepY}px`,
              width: `${baseCellSize}px`,
              height: `${baseCellSize}px`,
            } as CSSProperties}
          >
            <ImageCardThumb
              card={tile.card}
              disableNativePress
              limitEffectsToViewport
              isTooltipDisabled={isModalOpen}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
