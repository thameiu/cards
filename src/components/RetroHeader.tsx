import { useEffect, useState } from "react";
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
  { mode: "tarot", label: "tarot" },
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
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen can be unavailable when the browser or embedding context forbids it.
    }
  };

  const handleCloseWindow = () => {
    const isStandalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;

    if (window.opener || isStandalone) {
      window.close();
      return;
    }

    window.location.replace("about:blank");
  };

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
          <span className="retro-brand-text">bunchofcards</span>
        </div>
        <div className="retro-header-actions">
          <button
            type="button"
            className="window-button window-button-grow"
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? "❐" : "□"}
          </button>
          <button
            type="button"
            className="window-button window-button-close"
            onClick={handleCloseWindow}
            aria-label="Close window"
            title="Close window"
          >
            ×
          </button>
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
