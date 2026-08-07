import type { CardData } from "../types";
import { ImageCardThumb } from "./ImageCardThumb";

type ScrollableGalleryProps = {
  cards: CardData[];
  onOpenCard: (card: CardData) => void;
  isModalOpen?: boolean;
};

export function ScrollableGallery({ cards, onOpenCard, isModalOpen = false }: ScrollableGalleryProps) {
  return (
    <main className="cards-scroll">
      <div className="cards-grid">
        {cards.map((card) => (
          <ImageCardThumb
            key={card.id}
            card={card}
            onClick={() => onOpenCard(card)}
            isTooltipDisabled={isModalOpen}
          />
        ))}
      </div>
    </main>
  );
}
