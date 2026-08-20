import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { OptimizedImage } from "./OptimizedImage";
import type { CardData } from "../types";
import { ensureCursorTracking, getCursorState } from "../lib/cursorTracker";

type ImageCardThumbProps = {
  card: CardData;
  onClick?: () => void;
  className?: string;
  isTooltipDisabled?: boolean;
  disableNativePress?: boolean;
  disableEffects?: boolean;
  limitEffectsToViewport?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

type ImageLayout = {
  src: string;
  orientation: "landscape" | "portrait";
};

export const ImageCardThumb = memo(function ImageCardThumb({
  card,
  onClick,
  className = "",
  isTooltipDisabled = false,
  disableNativePress = false,
  disableEffects = false,
  limitEffectsToViewport = false,
}: ImageCardThumbProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const tiltRef = useRef({ x: 0, y: 0 });
  const tooltipPositionRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const [canPortal, setCanPortal] = useState(false);
  const [isInEffectRange, setIsInEffectRange] = useState(!limitEffectsToViewport);
  const [loadedLayout, setLoadedLayout] = useState<ImageLayout | null>(null);
  const imageLayout = loadedLayout?.src === card.front ? loadedLayout : null;
  const orientation = imageLayout?.orientation ?? "landscape";
  const isCoarsePointer =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    setCanPortal(typeof document !== "undefined");
  }, []);

  useEffect(() => {
    if (!limitEffectsToViewport || typeof IntersectionObserver === "undefined") {
      setIsInEffectRange(true);
      return undefined;
    }

    const button = buttonRef.current;
    if (!button) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInEffectRange(entry.isIntersecting);
      },
      { root: null, rootMargin: "180px", threshold: 0 }
    );

    observer.observe(button);
    return () => observer.disconnect();
  }, [limitEffectsToViewport]);

  useEffect(() => {
    if (disableEffects || !isInEffectRange) {
      const frame = frameRef.current;
      if (frame) {
        frame.style.setProperty("--tilt-y", "0deg");
        frame.style.setProperty("--tilt-x", "0deg");
      }
      setIsHovered(false);
      isHoveredRef.current = false;
      return undefined;
    }

    if (!isCoarsePointer) {
      ensureCursorTracking();
    }

    const button = buttonRef.current;
    const frame = frameRef.current;
    if (!button || !frame) {
      return undefined;
    }

    let animationFrame = 0;

    const update = () => {
      const buttonRect = button.getBoundingClientRect();
      const rect = frame.getBoundingClientRect();
      const cursor = isCoarsePointer ? null : getCursorState();
      const tooltip = tooltipRef.current;
      const topElement =
        cursor !== null ? document.elementFromPoint(cursor.x, cursor.y) : null;
      const isOccluded =
        topElement instanceof Element &&
        !button.contains(topElement) &&
        !topElement.closest(`[data-card-id="${card.id}"]`);
      const nextIsHovered =
        !isTooltipDisabled &&
        !isCoarsePointer &&
        cursor !== null &&
        !isOccluded &&
        cursor.x >= buttonRect.left &&
        cursor.x <= buttonRect.right &&
        cursor.y >= buttonRect.top &&
        cursor.y <= buttonRect.bottom;
      let targetTiltY = 0;
      let targetTiltX = 0;
      let easing = 0.14;

      if (nextIsHovered !== isHoveredRef.current) {
        isHoveredRef.current = nextIsHovered;
        setIsHovered(nextIsHovered);

        if (nextIsHovered && cursor !== null) {
          tooltipPositionRef.current = {
            x: cursor.x + 16,
            y: cursor.y + 16,
          };
        }
      }

      if (isCoarsePointer) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        const normalizedX = clamp(
          (viewportCenterX - centerX) / Math.max(rect.width, 1),
          -1,
          1
        );
        const normalizedY = clamp(
          (viewportCenterY - centerY) / Math.max(rect.height, 1),
          -1,
          1
        );

        targetTiltY = normalizedX * 10;
        targetTiltX = -normalizedY * 7;
        easing = 0.08;
      } else {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        if (cursor === null) {
          animationFrame = window.requestAnimationFrame(update);
          return;
        }
        const normalizedX = clamp((cursor.x - centerX) / Math.max(rect.width, 1), -1, 1);
        const normalizedY = clamp((cursor.y - centerY) / Math.max(rect.height, 1), -1, 1);

        targetTiltY = normalizedX * 14;
        targetTiltX = -normalizedY * 10;
      }

      tiltRef.current.y += (targetTiltY - tiltRef.current.y) * easing;
      tiltRef.current.x += (targetTiltX - tiltRef.current.x) * easing;

      frame.style.setProperty("--tilt-y", `${tiltRef.current.y}deg`);
      frame.style.setProperty("--tilt-x", `${tiltRef.current.x}deg`);

      if (tooltip && nextIsHovered && cursor !== null) {
        const targetTooltipX = cursor.x + 16;
        const targetTooltipY = cursor.y + 16;
        const tooltipEasing = 0.18;

        tooltipPositionRef.current.x += (targetTooltipX - tooltipPositionRef.current.x) * tooltipEasing;
        tooltipPositionRef.current.y += (targetTooltipY - tooltipPositionRef.current.y) * tooltipEasing;

        tooltip.style.setProperty("--tooltip-x", `${tooltipPositionRef.current.x}px`);
        tooltip.style.setProperty("--tooltip-y", `${tooltipPositionRef.current.y}px`);
      }

      animationFrame = window.requestAnimationFrame(update);
    };

    animationFrame = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [disableEffects, isCoarsePointer, isInEffectRange, isTooltipDisabled]);

  return (
    <button
      ref={buttonRef}
      type="button"
      data-card-id={card.id}
      className={`card-thumb is-${orientation} ${className}`.trim()}
      onClick={disableNativePress ? undefined : onClick}
    >
      <div ref={frameRef} className="card-thumb-frame">
        <OptimizedImage
          key={card.front}
          className="card-thumb-media"
          src={card.front}
          alt={card.label}
          fetchPriority="low"
          onLoad={(event) => {
            const image = event.currentTarget;
            const shortSide = Math.min(image.naturalWidth, image.naturalHeight);
            const longSide = Math.max(image.naturalWidth, image.naturalHeight);

            if (!shortSide || !longSide) {
              return;
            }

            setLoadedLayout({
              src: card.front,
              orientation:
                image.naturalHeight > image.naturalWidth ? "portrait" : "landscape",
            });
          }}
        />
      </div>
      {canPortal && !disableEffects && isInEffectRange
        ? createPortal(
            <span
              ref={tooltipRef}
              className={`card-thumb-tooltip${isHovered && !isCoarsePointer && !isTooltipDisabled ? " is-visible" : ""}`}
              aria-hidden="true"
            >
              {card.label}
            </span>,
            document.body
          )
        : null}
    </button>
  );
});
