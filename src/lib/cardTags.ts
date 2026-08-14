import type { CardTag } from "../types";

export type CardTagDefinition = {
  id: CardTag;
  label: string;
  color: string;
  textColor: string;
};

export const CARD_TAGS: CardTagDefinition[] = [
  { id: "craftsmanship", label: "craftsmanship", color: "#B6350E", textColor: "#fff" },
  { id: "shop", label: "shop", color: "#FF8703", textColor: "#19001A" },
  { id: "food", label: "food", color: "#FFC72C", textColor: "#19001A" },
  { id: "wellness", label: "wellness", color: "#339936", textColor: "#fff" },
  { id: "transport", label: "transport", color: "#0110A2", textColor: "#fff" },
  { id: "art", label: "art", color: "#9E4AFF", textColor: "#fff" },
  { id: "fashion", label: "fashion", color: "#FFABCD", textColor: "#19001A" },
  { id: "miscellaneous", label: "miscellaneous", color: "#19001A", textColor: "#fff" },
];

export const CARD_TAG_MAP = new Map(CARD_TAGS.map((tag) => [tag.id, tag]));
