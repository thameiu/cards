export type CardTag =
  | "craftsmanship"
  | "shop"
  | "food"
  | "wellness"
  | "transport"
  | "art"
  | "fashion"
  | "miscellaneous";

export type CardData = {
  id: string;
  label: string;
  description: string;
  front: string;
  back: string | null;
  tags: CardTag[];
};

export type ViewMode = "about" | "scroll" | "infinite";
