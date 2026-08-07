import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CardData } from "../types";
import { ensureCursorTracking, getCursorState } from "../lib/cursorTracker";

type ImageCardThumbProps = {
  card: CardData;
  onClick: () => void;
  className?: string;
  isTooltipDisabled?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function ImageCardThumb({
  card,
  onClick,
  className = "",
  isTooltipDisabled = false,
}: ImageCardThumbProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const tiltRef = useRef({ x: 0, y: 0 });
  const tooltipPositionRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const [canPortal, setCanPortal] = useState(false);
  const isCoarsePointer =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    setCanPortal(typeof document !== "undefined");
  }, []);

  useEffect(() => {
    ensureCursorTracking();

    const button = buttonRef.current;
    const frame = frameRef.current;
    if (!button || !frame) {
      return undefined;
    }

    let animationFrame = 0;

    const update = () => {
      const buttonRect = button.getBoundingClientRect();
      const rect = frame.getBoundingClientRect();
      const cursor = getCursorState();
      const tooltip = tooltipRef.current;
      const nextIsHovered =
        !isTooltipDisabled &&
        !isCoarsePointer &&
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

        if (nextIsHovered) {
          tooltipPositionRef.current = {
            x: cursor.x + 16,
            y: cursor.y + 16,
          };
        }
      }

      if (!(isCoarsePointer && !cursor.touchActive)) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const normalizedX = clamp((cursor.x - centerX) / Math.max(rect.width, 1), -1, 1);
        const normalizedY = clamp((cursor.y - centerY) / Math.max(rect.height, 1), -1, 1);

        targetTiltY = normalizedX * 14;
        targetTiltX = -normalizedY * 10;
      } else {
        easing = 0.06;
      }

      tiltRef.current.y += (targetTiltY - tiltRef.current.y) * easing;
      tiltRef.current.x += (targetTiltX - tiltRef.current.x) * easing;

      frame.style.setProperty("--tilt-y", `${tiltRef.current.y}deg`);
      frame.style.setProperty("--tilt-x", `${tiltRef.current.x}deg`);

      if (tooltip && nextIsHovered) {
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
  }, [isCoarsePointer, isTooltipDisabled]);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`card-thumb ${className}`.trim()}
      onClick={onClick}
    >
      <div ref={frameRef} className="card-thumb-frame">
        <img className="card-thumb-media" src={card.front} alt={card.label} loading="lazy" />
      </div>
      {canPortal
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
}
