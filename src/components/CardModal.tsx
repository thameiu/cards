import { useEffect, useMemo, useRef, useState } from "react";
import type { CardData } from "../types";
import { Viewer3D } from "./Viewer3D";

type CardModalProps = {
  card: CardData;
  onClose: () => void;
};

const MODAL_ANIMATION_MS = 420;
const DIRECTIONS = ["top", "right", "bottom", "left"] as const;

type Direction = (typeof DIRECTIONS)[number];

function getExitDirection(direction: Direction): Direction {
  if (direction === "top") {
    return "bottom";
  }
  if (direction === "right") {
    return "left";
  }
  if (direction === "bottom") {
    return "top";
  }
  return "right";
}

export function CardModal({ card, onClose }: CardModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const direction = useMemo<Direction>(() => {
    return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
  }, []);
  const exitDirection = getExitDirection(direction);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsClosing(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

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

  const handleClose = () => {
    if (isClosing) {
      return;
    }
    setIsClosing(true);
  };

  return (
    <div
      className={`modal-root${isVisible && !isClosing ? " is-visible" : ""}${isClosing ? " is-closing" : ""}`}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className={`modal-panel${isClosing ? " is-closing" : ""}`}
        data-enter-from={direction}
        data-exit-to={exitDirection}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="close-button" onClick={handleClose} aria-label="Close card">
          ×
        </button>
        <Viewer3D card={card} />
        <section className="modal-copy">
          <p className="modal-description">{card.description}</p>
        </section>
      </div>
    </div>
  );
}
