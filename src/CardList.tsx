import type { CardData } from "./types";

type CardDefinition = {
  id: string;
  label: string;
  description: string;
};

const CARD_DEFINITIONS: CardDefinition[] = [
  { id: "blackmoonbotanica", label: "Black Moon Botanica", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "cafearriba", label: "Cafe Arriba", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "chinamarket", label: "China Market", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "diedododa", label: "Diedododa", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "elamrani", label: "El Amrani", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "highlandcowshop", label: "Highland Cow Shop", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "kingpins", label: "Kingpins", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "laterrassebiaggi", label: "La Terrasse Biaggi", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "lecesar", label: "Le Cesar", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "lesbainsdulotus", label: "Les Bains du Lotus", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "lesterrasses", label: "Les Terrasses", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "letainois", label: "Le Tainois", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "lepotitatelier", label: "Le Potit Atelier", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "musiquenumero1", label: "Musique Numero 1", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "myjewelledbox", label: "My Jewelled Box", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "seito", label: "Seito", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "thewitchery", label: "The Witchery", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "uplandsroast", label: "Uplands Roast", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "viviennewestwood", label: "Vivienne Westwood", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
];

export const cardList: CardData[] = CARD_DEFINITIONS.map(({ id, label, description }) => ({
  id,
  label,
  description,
  front: `/assets/cards/${id}_r.png`,
  back: `/assets/cards/${id}_v.png`,
}));
