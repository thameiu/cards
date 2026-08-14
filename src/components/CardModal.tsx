import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CARD_TAG_MAP } from "../lib/cardTags";
import type { CardData } from "../types";
import { Viewer3D } from "./Viewer3D";

type CardModalProps = {
  card: CardData;
  onClose: () => void;
};

const MODAL_ANIMATION_MS = 420;
export function CardModal({ card, onClose }: CardModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

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
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="close-button" onClick={handleClose} aria-label="Close card">
          ×
        </button>
        <Viewer3D card={card} />
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
  );
}
