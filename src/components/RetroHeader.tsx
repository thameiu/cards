import { FilterDock } from "./FilterDock";
import type { CardTag, ViewMode } from "../types";

type RetroHeaderProps = {
  viewMode: ViewMode;
  onSelectView: (mode: ViewMode) => void;
  isFilterOpen: boolean;
  selectedTags: CardTag[];
  onToggleFilter: () => void;
  onToggleTag: (tag: CardTag) => void;
  onFilterHoverChange?: (isHovered: boolean) => void;
};

const VIEW_OPTIONS: Array<{ mode: ViewMode; label: string }> = [
  { mode: "about", label: "about" },
  { mode: "scroll", label: "scroll" },
  { mode: "infinite", label: "infinity" },
];

export function RetroHeader({
  viewMode,
  onSelectView,
  isFilterOpen,
  selectedTags,
  onToggleFilter,
  onToggleTag,
  onFilterHoverChange,
}: RetroHeaderProps) {
  return (
    <>
      <header className="retro-header">
        <div className="retro-brand">
          <img
            className="retro-brand-icon"
            src="/favicon_app.ico"
            alt=""
            aria-hidden="true"
            width="32"
            height="32"
          />
          <span className="retro-brand-text">Cards</span>
        </div>
      </header>
      <div className="retro-menu-bar">
        <nav className="retro-menu-nav" aria-label="Main menu">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.mode}
              type="button"
              className={`retro-menu-button${viewMode === option.mode ? " is-selected" : ""}`}
              onClick={() => onSelectView(option.mode)}
              aria-pressed={viewMode === option.mode}
            >
              {option.label}
            </button>
          ))}
        </nav>
        <FilterDock
          isOpen={isFilterOpen}
          selectedTags={selectedTags}
          onToggleOpen={onToggleFilter}
          onToggleTag={onToggleTag}
          onHoverChange={onFilterHoverChange}
        />
      </div>
    </>
  );
}
