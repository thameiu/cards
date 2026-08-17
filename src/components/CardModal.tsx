import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CARD_TAG_MAP } from "../lib/cardTags";
import type { CardData } from "../types";
import { Viewer3D } from "./Viewer3D";

type CardModalProps = {
  card: CardData;
  initialPosition: {
    x: number;
    y: number;
  };
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
};

const MODAL_ANIMATION_MS = 420;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function CardModal({ card, initialPosition, zIndex, onFocus, onClose }: CardModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [isFullSize, setIsFullSize] = useState(false);
  const [fullSizeDimensions, setFullSizeDimensions] = useState<{ width: number; height: number } | null>(
    null
  );
  const closeTimeoutRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restorePositionRef = useRef(initialPosition);
  const isMobile =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 720px)").matches;
  const dragStateRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
    captureElement: HTMLElement | null;
  } | null>(null);

  const getFullSizeLayout = () => {
    if (typeof window === "undefined") {
      return null;
    }

    const galleryRect = document.querySelector(".gallery-shell")?.getBoundingClientRect();
    if (!galleryRect) {
      return null;
    }

    return {
      position: {
        x: galleryRect.left,
        y: galleryRect.top,
      },
      dimensions: {
        width: galleryRect.width,
        height: galleryRect.height,
      },
    };
  };

  const clampPosition = (nextPosition: { x: number; y: number }) => {
    const panel = panelRef.current;
    if (!panel || typeof window === "undefined") {
      return nextPosition;
    }

    const appFrameRect = document.querySelector(".app-frame")?.getBoundingClientRect();
    const galleryRect = document.querySelector(".gallery-shell")?.getBoundingClientRect();
    const minX = appFrameRect?.left ?? 0;
    const maxX = Math.max(
      minX,
      (appFrameRect?.right ?? window.innerWidth) - panel.offsetWidth
    );
    const minY = galleryRect?.top ?? 0;
    const maxY = Math.max(
      minY,
      (appFrameRect?.bottom ?? window.innerHeight) - panel.offsetHeight
    );

    return {
      x: clamp(nextPosition.x, minX, maxX),
      y: clamp(nextPosition.y, minY, maxY),
    };
  };

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!isFullSize) {
      restorePositionRef.current = position;
    }
  }, [isFullSize, position]);

  useEffect(() => {
    if (!isClosing) {
      return undefined;
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      onClose();
    }, MODAL_ANIMATION_MS);

    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isClosing, onClose]);

  useEffect(() => {
    const syncBounds = () => {
      if (isFullSize) {
        const fullSizeLayout = getFullSizeLayout();
        if (!fullSizeLayout) {
          return;
        }

        setPosition(fullSizeLayout.position);
        setFullSizeDimensions(fullSizeLayout.dimensions);
        return;
      }

      setPosition((current) => clampPosition(current));
    };

    syncBounds();
    window.addEventListener("resize", syncBounds);

    return () => {
      window.removeEventListener("resize", syncBounds);
    };
  }, [isFullSize]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      setPosition(
        clampPosition({
          x: event.clientX - dragState.offsetX,
          y: event.clientY - dragState.offsetY,
        })
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      if (
        dragState.captureElement &&
        dragState.captureElement.hasPointerCapture?.(event.pointerId)
      ) {
        dragState.captureElement.releasePointerCapture(event.pointerId);
      }

      dragStateRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  const handleClose = () => {
    if (isClosing) {
      return;
    }
    setIsClosing(true);
  };

  const handleToggleFullSize = () => {
    if (isMobile) {
      return;
    }

    if (isFullSize) {
      setIsFullSize(false);
      setFullSizeDimensions(null);
      setPosition(restorePositionRef.current);
      return;
    }

    const fullSizeLayout = getFullSizeLayout();
    if (!fullSizeLayout) {
      return;
    }

    restorePositionRef.current = position;
    dragStateRef.current = null;
    setIsFullSize(true);
    setPosition(fullSizeLayout.position);
    setFullSizeDimensions(fullSizeLayout.dimensions);
  };

  return (
    <div
      className={`modal-root${isVisible && !isClosing ? " is-visible" : ""}${isClosing ? " is-closing" : ""}`}
      style={{ zIndex }}
    >
      <div
        ref={panelRef}
        className={`modal-panel${isClosing ? " is-closing" : ""}${isFullSize ? " is-fullsize" : ""}`}
        style={
          {
            "--modal-x": `${position.x}px`,
            "--modal-y": `${position.y}px`,
            "--modal-width": fullSizeDimensions ? `${fullSizeDimensions.width}px` : undefined,
            "--modal-height": fullSizeDimensions ? `${fullSizeDimensions.height}px` : undefined,
          } as CSSProperties
        }
        onPointerDown={() => onFocus()}
      >
        <header
          className={`modal-titlebar${isFullSize ? " is-static" : ""}`}
          onPointerDown={(event) => {
            if (isFullSize) {
              return;
            }

            event.preventDefault();
            const panelRect = panelRef.current?.getBoundingClientRect();
            if (!panelRect) {
              return;
            }

            event.currentTarget.setPointerCapture(event.pointerId);
            dragStateRef.current = {
              pointerId: event.pointerId,
              offsetX: event.clientX - panelRect.left,
              offsetY: event.clientY - panelRect.top,
              captureElement: event.currentTarget,
            };
            onFocus();
          }}
        >
          <span className="modal-titlebar-text">{card.label}</span>
          <div className="modal-titlebar-actions">
            {!isMobile ? (
              <button
                type="button"
                className="window-button"
                onClick={handleToggleFullSize}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label={isFullSize ? "Restore card size" : "Expand card to full size"}
              >
                {isFullSize ? "❐" : "□"}
              </button>
            ) : null}
            <button
              type="button"
              className="window-button"
              onClick={handleClose}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="Close card"
            >
              ×
            </button>
          </div>
        </header>
        <div className="modal-body">
          <div className="modal-viewer-frame">
            <Viewer3D card={card} isFullSize={isFullSize} />
          </div>
          <section className="modal-copy">
            <div className="modal-meta">
              <p className="modal-title">{card.label}</p>
              <div className="modal-tags">
                {card.tags.map((tagId) => {
                  const tag = CARD_TAG_MAP.get(tagId);
                  if (!tag) {
                    return null;
                  }

                  return (
                    <span
                      key={tag.id}
                      className="modal-tag"
                      style={
                        {
                          "--tag-color": tag.color,
                          "--tag-text-color": tag.textColor,
                        } as CSSProperties
                      }
                    >
                      {tag.label}
                    </span>
                  );
                })}
              </div>
            </div>
            <p className="modal-description">{card.description}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
