import { useEffect, useState } from "react";
import { cardList } from "./CardList";
import { AboutPage } from "./components/AboutPage";
import { AppHeader } from "./components/AppHeader";
import { CardModal } from "./components/CardModal";
import { InfiniteGallery } from "./components/InfiniteGallery";
import { ScrollableGallery } from "./components/ScrollableGallery";
import type { CardData, ViewMode } from "./types";

const STORAGE_KEY = "cards-view-mode";
const FADE_DURATION_MS = 220;

function getInitialViewMode(): ViewMode {
  if (typeof window === "undefined") {
    return "scroll";
  }

  const storedMode = window.localStorage.getItem(STORAGE_KEY);
  if (storedMode === "about" || storedMode === "infinite") {
    return storedMode;
  }

  return "scroll";
}

export default function App() {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [displayMode, setDisplayMode] = useState<ViewMode>(getInitialViewMode);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, viewMode);
    }
  }, [viewMode]);

  const handleSelectView = (nextMode: ViewMode) => {
    if (isFading || nextMode === viewMode) {
      return;
    }
    setSelectedCard(null);
    setIsFading(true);

    window.setTimeout(() => {
      setViewMode(nextMode);
      setDisplayMode(nextMode);
      window.setTimeout(() => {
        setIsFading(false);
      }, 20);
    }, FADE_DURATION_MS);
  };

  return (
    <div className="app-shell">
      <AppHeader viewMode={displayMode} onSelectView={handleSelectView} />

      <div className={`gallery-shell ${isFading ? "is-fading" : "is-visible"}`}>
        {displayMode === "about" ? (
          <AboutPage />
        ) : displayMode === "scroll" ? (
          <ScrollableGallery cards={cardList} onOpenCard={setSelectedCard} isModalOpen={Boolean(selectedCard)} />
        ) : (
          <InfiniteGallery cards={cardList} onOpenCard={setSelectedCard} isModalOpen={Boolean(selectedCard)} />
        )}
      </div>

      {selectedCard ? <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} /> : null}
    </div>
  );
}
