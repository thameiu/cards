import type { ViewMode } from "../types";

type AppHeaderProps = {
  viewMode: ViewMode;
  onSelectView: (mode: ViewMode) => void;
};

export function AppHeader({ viewMode, onSelectView }: AppHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-logo" aria-hidden="true" />
      <nav className="mode-toggle" aria-label="View mode">
        <button
          type="button"
          className={`mode-option${viewMode === "about" ? " is-selected" : ""}`}
          onClick={() => onSelectView("about")}
          aria-pressed={viewMode === "about"}
        >
          <span className="mode-option-text">about</span>
        </button>
        <button
          type="button"
          className={`mode-option${viewMode === "scroll" ? " is-selected" : ""}`}
          onClick={() => onSelectView("scroll")}
          aria-pressed={viewMode === "scroll"}
        >
          <span className="mode-option-text">scroll</span>
        </button>
        <button
          type="button"
          className={`mode-option${viewMode === "infinite" ? " is-selected" : ""}`}
          onClick={() => onSelectView("infinite")}
          aria-pressed={viewMode === "infinite"}
        >
          <span className="mode-option-text">infinity</span>
        </button>
      </nav>
    </header>
  );
}
