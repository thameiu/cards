import type { CSSProperties } from "react";
import { CARD_TAGS } from "../lib/cardTags";
import type { CardTag } from "../types";

type FilterDockProps = {
  isOpen: boolean;
  selectedTags: CardTag[];
  onToggleOpen: () => void;
  onToggleTag: (tag: CardTag) => void;
  onHoverChange?: (isHovered: boolean) => void;
};

export function FilterDock({
  isOpen,
  selectedTags,
  onToggleOpen,
  onToggleTag,
  onHoverChange,
}: FilterDockProps) {
  return (
    <div
      className={`filter-dock${isOpen ? " is-open" : ""}`}
      onPointerEnter={() => onHoverChange?.(true)}
      onPointerLeave={() => onHoverChange?.(false)}
    >
      <button
        type="button"
        className="filter-toggle-button"
        onClick={onToggleOpen}
        aria-label="Toggle filters"
        aria-expanded={isOpen}
      >
        <span className="filter-toggle-text">filter</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="filter-toggle-icon">
          <path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z" />
        </svg>
      </button>
      <div className="filter-dock-dropdown">
        <div className="filter-dock-tags" aria-hidden={!isOpen}>
          {CARD_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                className={`filter-tag${isSelected ? " is-selected" : ""}`}
                style={
                  {
                    "--tag-color": tag.color,
                    "--tag-text-color": tag.textColor,
                  } as CSSProperties
                }
                disabled={!isOpen}
                onClick={() => onToggleTag(tag.id)}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
