import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
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

const PRELOAD_COLUMNS = 3;
const PRELOAD_ROWS = 2;
const RECENTER_THRESHOLD_X = 1;
const RECENTER_THRESHOLD_Y = 2;

export function InfiniteGallery({ cards, onOpenCard, isModalOpen = false }: InfiniteGalleryProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [gridWindow, setGridWindow] = useState({ centerCol: 2, centerRow: 2 });
  const metrics = useViewportMetrics();
  const targetRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerStartX: number;
    pointerStartY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const gridLayerRef = useRef<HTMLDivElement | null>(null);
  const gridBackdropRef = useRef<HTMLDivElement | null>(null);
  const gridWindowRef = useRef(gridWindow);
  const cellSize = clamp(metrics.width * 0.24, 280, 420);

  useEffect(() => {
    gridWindowRef.current = gridWindow;
  }, [gridWindow]);

  useEffect(() => {
    document.documentElement.style.setProperty("--cell-size", `${cellSize}px`);
  }, [cellSize]);

  useLayoutEffect(() => {
    const syncGridTransforms = () => {
      gridLayerRef.current?.style.setProperty("--grid-offset-x", `${positionRef.current.x}px`);
      gridLayerRef.current?.style.setProperty("--grid-offset-y", `${positionRef.current.y}px`);

      gridBackdropRef.current?.style.setProperty(
        "--grid-offset-x",
        `${wrap(positionRef.current.x, cellSize)}px`
      );
      gridBackdropRef.current?.style.setProperty(
        "--grid-offset-y",
        `${wrap(positionRef.current.y, cellSize)}px`
      );
    };

    const updatePosition = () => {
      const current = positionRef.current;
      const nextX = gsap.utils.interpolate(current.x, targetRef.current.x, 0.12);
      const nextY = gsap.utils.interpolate(current.y, targetRef.current.y, 0.12);

      if (Math.abs(nextX - current.x) < 0.02 && Math.abs(nextY - current.y) < 0.02) {
        syncGridTransforms();
        return;
      }

      positionRef.current = { x: nextX, y: nextY };
      syncGridTransforms();

      const nextCenterCol = Math.round((-nextX + metrics.width / 2) / cellSize);
      const nextCenterRow = Math.round((-nextY + metrics.height / 2) / cellSize);
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

    syncGridTransforms();
    gsap.ticker.add(updatePosition);
    return () => gsap.ticker.remove(updatePosition);
  }, [cellSize, metrics.height, metrics.width]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current) {
        return;
      }

      const deltaX = event.clientX - dragRef.current.pointerStartX;
      const deltaY = event.clientY - dragRef.current.pointerStartY;
      targetRef.current = {
        x: dragRef.current.originX + deltaX,
        y: dragRef.current.originY + deltaY,
      };
    };

    const onPointerUp = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const visibleRangeX = PRELOAD_COLUMNS;
  const visibleRangeY = PRELOAD_ROWS;

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
      className={`infinite-viewport ${isDragging ? "is-dragging" : ""}`}
      onWheel={(event) => {
        event.preventDefault();
        targetRef.current = {
          x: targetRef.current.x - event.deltaX,
          y: targetRef.current.y - event.deltaY,
        };
      }}
      onPointerDown={(event) => {
        dragRef.current = {
          pointerStartX: event.clientX,
          pointerStartY: event.clientY,
          originX: targetRef.current.x,
          originY: targetRef.current.y,
        };
        setIsDragging(true);
      }}
    >
      <div ref={gridBackdropRef} className="infinite-backdrop" />
      <div ref={gridLayerRef} className="infinite-layer">
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className="infinite-cell"
            style={{
              left: `${tile.col * cellSize}px`,
              top: `${tile.row * cellSize}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
            }}
          >
            <ImageCardThumb
              card={tile.card}
              onClick={() => onOpenCard(tile.card)}
              isTooltipDisabled={isModalOpen}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
