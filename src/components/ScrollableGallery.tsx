import type { CardData } from "../types";
import { ImageCardThumb } from "./ImageCardThumb";

type ScrollableGalleryProps = {
  cards: CardData[];
  onOpenCard: (card: CardData) => void;
  isTooltipDisabled?: boolean;
};

export function ScrollableGallery({
  cards,
  onOpenCard,
  isTooltipDisabled = false,
}: ScrollableGalleryProps) {
  return (
    <main className="cards-scroll">
      <div className="cards-grid">
        {cards.map((card) => (
          <div key={card.id} className="cards-grid-item">
            <ImageCardThumb
              card={card}
              onClick={() => onOpenCard(card)}
              isTooltipDisabled={isTooltipDisabled}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
