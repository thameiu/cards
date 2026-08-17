import { useEffect, useMemo, useRef, useState } from "react";
import { cardList } from "./CardList";
import { AboutPage } from "./components/AboutPage";
import { CardModal } from "./components/CardModal";
import { InfiniteGallery } from "./components/InfiniteGallery";
import { InitialLoader } from "./components/InitialLoader";
import { Loader } from "./components/Loader";
import { RetroHeader } from "./components/RetroHeader";
import { ScrollableGallery } from "./components/ScrollableGallery";
import { getImageSourceCandidates } from "./lib/imageSources";
import type { CardData, CardTag, ViewMode } from "./types";

const STORAGE_KEY = "cards-view-mode";
const INITIAL_LOADER_STORAGE_KEY = "initialLoaderDone";
const FADE_DURATION_MS = 220;

type OpenModal = {
  id: number;
  sourceCardId: string;
  card: CardData;
  x: number;
  y: number;
  zIndex: number;
};

const ERROR_MODAL_CHANCE = 0.01;
const ERROR_MODAL_CARD: CardData = {
  id: "__error__",
  label: "Error",
  description: "Error",
  front: "/assets/error.glb",
  back: null,
  tags: ["secret"],
};

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

function getInitialLoaderDone() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(INITIAL_LOADER_STORAGE_KEY) === "true";
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
  const [openModals, setOpenModals] = useState<OpenModal[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [displayMode, setDisplayMode] = useState<ViewMode>(getInitialViewMode);
  const [isViewFading, setIsViewFading] = useState(false);
  const [areGalleryImagesReady, setAreGalleryImagesReady] = useState(false);
  const [areSiteAssetsReady, setAreSiteAssetsReady] = useState(false);
  const [siteLoadProgress, setSiteLoadProgress] = useState(0);
  const [isInitialLoaderDone, setIsInitialLoaderDone] = useState(getInitialLoaderDone);
  const [selectedTags, setSelectedTags] = useState<CardTag[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFilterHovered, setIsFilterHovered] = useState(false);
  const [nextModalId, setNextModalId] = useState(1);
  const [nextModalZIndex, setNextModalZIndex] = useState(1);
  const viewFadeTimeoutRef = useRef<number | null>(null);
  const galleryImageSources = useMemo(
    () => Array.from(new Set(cardList.map((card) => card.front))),
    []
  );
  const siteImageSources = useMemo(
    () =>
      Array.from(
        new Set([
          ...cardList.flatMap((card) => [card.front, card.back].filter(Boolean) as string[]),
          "/assets/background.jpg",
          "/assets/pileofcards.png",
          "/assets/thameiu_88x31.webp",
          "/assets/myself.png",
        ])
      ),
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
    let loadedSiteImageCount = 0;
    let loadedGalleryImageCount = 0;
    const gallerySourceSet = new Set(galleryImageSources);

    if (!siteImageSources.length) {
      setSiteLoadProgress(1);
      setAreGalleryImagesReady(true);
      setAreSiteAssetsReady(true);
      if (!isInitialLoaderDone && typeof window !== "undefined") {
        window.localStorage.setItem(INITIAL_LOADER_STORAGE_KEY, "true");
        setIsInitialLoaderDone(true);
      }
      return undefined;
    }

    Promise.all(
      siteImageSources.map(async (src) => {
        await preloadImage(src);
        if (cancelled) {
          return;
        }

        loadedSiteImageCount += 1;
        setSiteLoadProgress(loadedSiteImageCount / siteImageSources.length);

        if (gallerySourceSet.delete(src)) {
          loadedGalleryImageCount += 1;
          if (loadedGalleryImageCount >= galleryImageSources.length) {
            setAreGalleryImagesReady(true);
          }
        }
      })
    ).then(() => {
      if (cancelled) {
        return;
      }

      setSiteLoadProgress(1);
      setAreGalleryImagesReady(true);
      setAreSiteAssetsReady(true);

      if (!isInitialLoaderDone && typeof window !== "undefined") {
        window.localStorage.setItem(INITIAL_LOADER_STORAGE_KEY, "true");
        setIsInitialLoaderDone(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [galleryImageSources, siteImageSources]);

  useEffect(() => {
    return () => {
      if (viewFadeTimeoutRef.current !== null) {
        window.clearTimeout(viewFadeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const filteredIds = new Set(filteredCards.map((card) => card.id));
    setOpenModals((current) => current.filter((modal) => filteredIds.has(modal.sourceCardId)));
  }, [filteredCards]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setOpenModals((current) => {
        if (!current.length) {
          return current;
        }

        const topmost = current.reduce((highest, modal) =>
          modal.zIndex > highest.zIndex ? modal : highest
        );
        return current.filter((modal) => modal.id !== topmost.id);
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleTag = (tag: CardTag) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((currentTag) => currentTag !== tag)
        : [...current, tag]
    );
  };

  const handleSelectView = (nextMode: ViewMode) => {
    if (isViewFading || nextMode === viewMode) {
      return;
    }

    setOpenModals([]);
    setIsViewFading(true);

    if (viewFadeTimeoutRef.current !== null) {
      window.clearTimeout(viewFadeTimeoutRef.current);
    }

    viewFadeTimeoutRef.current = window.setTimeout(() => {
      setViewMode(nextMode);
      setDisplayMode(nextMode);
      window.requestAnimationFrame(() => {
        setIsViewFading(false);
      });
      viewFadeTimeoutRef.current = null;
    }, FADE_DURATION_MS);
  };

  const handleOpenCard = (card: CardData) => {
    const existingModal = openModals.find((modal) => modal.sourceCardId === card.id);
    if (existingModal) {
      handleFocusModal(existingModal.id);
      return;
    }

    const modalCard = Math.random() < ERROR_MODAL_CHANCE ? ERROR_MODAL_CARD : card;

    const modalId = nextModalId;
    const modalZIndex = nextModalZIndex;
    const offsetIndex = openModals.length % 5;
    const isMobile =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 720px)").matches;

    setOpenModals((current) => [
      ...current,
      {
        id: modalId,
        sourceCardId: card.id,
        card: modalCard,
        x: isMobile ? 12 + offsetIndex * 10 : 48 + offsetIndex * 26,
        y: isMobile ? 136 + offsetIndex * 10 : 116 + offsetIndex * 24,
        zIndex: modalZIndex,
      },
    ]);
    setNextModalId((current) => current + 1);
    setNextModalZIndex((current) => current + 1);
  };

  const handleCloseModal = (modalId: number) => {
    setOpenModals((current) => current.filter((modal) => modal.id !== modalId));
  };

  const handleFocusModal = (modalId: number) => {
    const nextZIndex = nextModalZIndex;
    setOpenModals((current) =>
      current.map((modal) =>
        modal.id === modalId ? { ...modal, zIndex: nextZIndex } : modal
      )
    );
    setNextModalZIndex((current) => current + 1);
  };

  const shouldShowGalleryLoader = !areGalleryImagesReady && displayMode !== "about";
  const shouldRenderGalleryContent = areGalleryImagesReady || displayMode === "about";
  const shouldShowInitialLoader = !isInitialLoaderDone && !areSiteAssetsReady;

  if (shouldShowInitialLoader) {
    return <InitialLoader progress={siteLoadProgress} />;
  }

  return (
    <div className="app-shell">
      <div className="app-frame">
        <RetroHeader
          viewMode={displayMode}
          onSelectView={handleSelectView}
          isFilterOpen={isFilterOpen}
          selectedTags={selectedTags}
          onToggleFilter={() => setIsFilterOpen((current) => !current)}
          onToggleTag={handleToggleTag}
          onFilterHoverChange={setIsFilterHovered}
        />

        <div className="gallery-shell">
          {shouldRenderGalleryContent ? (
            <div className={`gallery-content ${isViewFading ? "is-fading" : "is-visible"}`}>
              {displayMode === "about" ? (
                <AboutPage cards={filteredCards} totalCardCount={cardList.length} />
              ) : displayMode === "scroll" ? (
                <ScrollableGallery
                  cards={filteredCards}
                  onOpenCard={handleOpenCard}
                  isTooltipDisabled={isFilterHovered}
                />
              ) : (
                <InfiniteGallery
                  key={selectedTags.length ? selectedTags.join("|") : "all"}
                  cards={filteredCards}
                  onOpenCard={handleOpenCard}
                  isTooltipDisabled={isFilterHovered}
                />
              )}
            </div>
          ) : null}
          {shouldShowGalleryLoader ? (
            <div className="gallery-loader-screen">
              <Loader />
            </div>
          ) : null}
        </div>
      </div>
      {openModals.map((modal) => (
        <CardModal
          key={modal.id}
          card={modal.card}
          initialPosition={{ x: modal.x, y: modal.y }}
          zIndex={modal.zIndex}
          onFocus={() => handleFocusModal(modal.id)}
          onClose={() => handleCloseModal(modal.id)}
        />
      ))}
    </div>
  );
}
