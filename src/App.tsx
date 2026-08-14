import { useEffect, useMemo, useState } from "react";
import { cardList } from "./CardList";
import { AboutPage } from "./components/AboutPage";
import { AppHeader } from "./components/AppHeader";
import { CardModal } from "./components/CardModal";
import { FilterDock } from "./components/FilterDock";
import { InfiniteGallery } from "./components/InfiniteGallery";
import { Loader } from "./components/Loader";
import { ScrollableGallery } from "./components/ScrollableGallery";
import { getImageSourceCandidates } from "./lib/imageSources";
import type { CardData, CardTag, ViewMode } from "./types";

const STORAGE_KEY = "cards-view-mode";
const FADE_DURATION_MS = 220;

function getInitialViewMode(): ViewMode {
  if (typeof window === "undefined") {
    return "infinite";
  }

  const storedMode = window.localStorage.getItem(STORAGE_KEY);
  if (storedMode === "about" || storedMode === "infinite") {
    return storedMode;
  }

  return "infinite";
}

function preloadImage(src: string) {
  const candidates = getImageSourceCandidates(src);

  return new Promise<void>((resolve) => {
    let candidateIndex = 0;

    const tryLoad = () => {
      if (candidateIndex >= candidates.length) {
        resolve();
        return;
      }

      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve();
      image.onerror = () => {
        candidateIndex += 1;
        tryLoad();
      };
      image.src = candidates[candidateIndex];
    };

    tryLoad();
  });
}

export default function App() {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [displayMode, setDisplayMode] = useState<ViewMode>(getInitialViewMode);
  const [isFading, setIsFading] = useState(false);
  const [areGalleryImagesReady, setAreGalleryImagesReady] = useState(false);
  const [selectedTags, setSelectedTags] = useState<CardTag[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const galleryImageSources = useMemo(
    () => Array.from(new Set(cardList.map((card) => card.front))),
    []
  );
  const filteredCards = useMemo(() => {
    if (!selectedTags.length) {
      return cardList;
    }

    return cardList.filter((card) => card.tags.some((tag) => selectedTags.includes(tag)));
  }, [selectedTags]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, viewMode);
    }
  }, [viewMode]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(galleryImageSources.map((src) => preloadImage(src))).then(() => {
      if (!cancelled) {
        setAreGalleryImagesReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [galleryImageSources]);

  useEffect(() => {
    if (selectedCard && !filteredCards.some((card) => card.id === selectedCard.id)) {
      setSelectedCard(null);
    }
  }, [filteredCards, selectedCard]);

  const handleToggleTag = (tag: CardTag) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((currentTag) => currentTag !== tag)
        : [...current, tag]
    );
  };

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
          <AboutPage cards={filteredCards} totalCardCount={cardList.length} />
        ) : !areGalleryImagesReady ? (
          <div className="gallery-loader-screen">
            <Loader />
          </div>
        ) : displayMode === "scroll" ? (
          <ScrollableGallery cards={filteredCards} onOpenCard={setSelectedCard} isModalOpen={Boolean(selectedCard)} />
        ) : (
          <InfiniteGallery
            key={selectedTags.length ? selectedTags.join("|") : "all"}
            cards={filteredCards}
            onOpenCard={setSelectedCard}
            isModalOpen={Boolean(selectedCard)}
          />
        )}
      </div>

      <FilterDock
        isOpen={isFilterOpen}
        selectedTags={selectedTags}
        onToggleOpen={() => setIsFilterOpen((current) => !current)}
        onToggleTag={handleToggleTag}
      />
      {selectedCard ? <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} /> : null}
    </div>
  );
}
