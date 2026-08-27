import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { CARD_TAGS } from "../lib/cardTags";
import type { CardData, CardTag } from "../types";
import { ImageCardThumb } from "./ImageCardThumb";

type TarotPageProps = {
  cards: CardData[];
  allCards: CardData[];
  onOpenCard: (card: CardData) => void;
  isTooltipDisabled?: boolean;
};

type TarotTag = Exclude<CardTag, "secret">;

const DRAW_COUNT = 3;
const CARD_REVEAL_DELAY_MS = 320;
const FIRST_CARD_DELAY_MS = 140;
const READING_BOX_DELAY_MS = 220;
const TYPEWRITER_DELAY_MS = 18;

const TAROT_SENTENCES: Record<TarotTag, string> = {
  craftsmanship: "craftsmanship leads this draw: careful actions and steady repetition will get the best result. but you will need to work harder to achieve it.",
  shop: "shop dominates this spread: curiosity and comparison will guide you to the right choice. but beware of overconsumption.",
  food: "food comes through strongest here: follow your comfort, appetite and life's simple delights. but pleasure may be the nemesis of true happiness.",
  wellness: "wellness shapes this reading: slow down, preserve your energy, and put yourself in the right conditions. but be careful of procrastination.",
  transport: "transport takes the lead: perhaps travelling or moving on, might be the key to growth. but do not forget your roots.",
  art: "art is the loudest voice in these cards: your creativity is your soul, deploy it through your passion, and let your imagination soar. but do not fall in a fantasy.",
  fashion: "fashion rules this spread: great presentation will produce your success. but do not forget to wear what you love, and to express yourself how you desire.",
  miscellaneous: "miscellaneous wins this draw: who knows what can happen ? randomness leads your life, fate might not be a concept that you can accept.",
};

function shuffleCards(cards: CardData[]) {
  const nextCards = [...cards];

  for (let index = nextCards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = nextCards[index];
    nextCards[index] = nextCards[swapIndex];
    nextCards[swapIndex] = current;
  }

  return nextCards;
}

function getDominantTag(cards: CardData[]): TarotTag {
  const counts = new Map<TarotTag, number>();

  cards.forEach((card, index) => {
    const weight = DRAW_COUNT - index;

    card.tags.forEach((tag) => {
      if (tag === "secret") {
        return;
      }

      counts.set(tag, (counts.get(tag) ?? 0) + weight);
    });
  });

  return CARD_TAGS.reduce<TarotTag>(
    (bestTag, tag) => {
      const currentCount = counts.get(tag.id) ?? 0;
      const bestCount = counts.get(bestTag) ?? 0;
      return currentCount > bestCount ? tag.id : bestTag;
    },
    CARD_TAGS[0].id
  );
}

export function TarotPage({
  cards,
  allCards,
  onOpenCard,
  isTooltipDisabled = false,
}: TarotPageProps) {
  const [drawnCards, setDrawnCards] = useState<CardData[]>([]);
  const [revealCount, setRevealCount] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isReadingVisible, setIsReadingVisible] = useState(false);
  const [visibleSentence, setVisibleSentence] = useState("");
  const drawSource = cards.length >= DRAW_COUNT ? cards : allCards;
  const dominantTag = useMemo(() => {
    if (drawnCards.length !== DRAW_COUNT) {
      return null;
    }

    return getDominantTag(drawnCards);
  }, [drawnCards]);
  const dominantTagDefinition =
    dominantTag === null ? null : CARD_TAGS.find((tag) => tag.id === dominantTag) ?? null;

  const readingSentence = useMemo(() => {
    if (dominantTag === null) {
      return "";
    }

    return TAROT_SENTENCES[dominantTag];
  }, [dominantTag]);

  useEffect(() => {
    if (!hasDrawn || drawnCards.length !== DRAW_COUNT) {
      return undefined;
    }

    setRevealCount(0);
    setIsReadingVisible(false);
    setVisibleSentence("");

    const revealTimers = drawnCards.map((_, index) =>
      window.setTimeout(() => {
        setRevealCount(index + 1);
      }, FIRST_CARD_DELAY_MS + index * CARD_REVEAL_DELAY_MS)
    );

    const readingTimer = window.setTimeout(() => {
      setIsReadingVisible(true);
    }, FIRST_CARD_DELAY_MS + drawnCards.length * CARD_REVEAL_DELAY_MS + READING_BOX_DELAY_MS);

    let typewriterTimers: number[] = [];

    const textTimer = window.setTimeout(() => {
      typewriterTimers = readingSentence.split("").map((_, index) =>
        window.setTimeout(() => {
          setVisibleSentence(readingSentence.slice(0, index + 1));
        }, index * TYPEWRITER_DELAY_MS)
      );
    }, FIRST_CARD_DELAY_MS + drawnCards.length * CARD_REVEAL_DELAY_MS + READING_BOX_DELAY_MS + 150);

    return () => {
      revealTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(readingTimer);
      window.clearTimeout(textTimer);
      typewriterTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [drawnCards, hasDrawn, readingSentence]);

  const handleDrawCards = () => {
    const nextCards = shuffleCards(drawSource).slice(0, DRAW_COUNT);
    setDrawnCards(nextCards);
    setHasDrawn(true);
  };

  return (
    <main className="tarot-page">
      {!hasDrawn ? (
        <button type="button" className="tarot-draw-button" onClick={handleDrawCards}>
          draw cards
        </button>
      ) : (
        <div className="tarot-layout">
          <div className="tarot-card-row" aria-live="polite">
            {drawnCards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className={`tarot-card-slot${revealCount > index ? " is-visible" : ""}`}
              >
                <ImageCardThumb
                  card={card}
                  onClick={() => onOpenCard(card)}
                  longSide={240}
                  isTooltipDisabled={isTooltipDisabled}
                />
              </div>
            ))}
          </div>

          <div className={`tarot-reading${isReadingVisible ? " is-visible" : ""}`}>
            {dominantTagDefinition ? (
              <div className="tarot-reading-tags">
                <span
                  className="modal-tag"
                  style={
                    {
                      "--tag-color": dominantTagDefinition.color,
                      "--tag-text-color": dominantTagDefinition.textColor,
                    } as CSSProperties
                  }
                >
                  {dominantTagDefinition.label}
                </span>
              </div>
            ) : null}
            <p className="tarot-reading-text">{visibleSentence}</p>
          </div>
        </div>
      )}
    </main>
  );
}
