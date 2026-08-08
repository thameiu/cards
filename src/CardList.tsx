import type { CardData } from "./types";

type CardDefinition = {
  id: string;
  label: string;
  description: string;
};

const CARD_DEFINITIONS: CardDefinition[] = [
  { id: "blackmoonbotanica", label: "Black Moon Botanica", description: "very cool witchcraft shop in edinburgh." },
  { id: "cafearriba", label: "Cafe Arriba", description: "nice cafe in portree, skye. good mac and cheese with leeks." },
  { id: "chinamarket", label: "China Market", description: "a chinese store in plan-de-campagne, cabriès." },
  { id: "diedododa", label: "Diedododa", description: "cute prints, sold at the royal market in edinburgh (or online)." },
  { id: "elamrani", label: "El Amrani", description: "leatherworker in the marrakech souk." },
  { id: "highlandcowshop", label: "Highland Cow Shop", description: "a shop containing everything related to hairy highland cows, in edinburgh." },
  { id: "kingpins", label: "Kingpins", description: "reusable arcade pass for any kingpins in the uk." },
  { id: "laterrassebiaggi", label: "La Terrasse Biaggi", description: "a rooftop in marseille, i think i went there on my first day of fourth year of cs." },
  { id: "lecesar", label: "Le Cesar", description: "seafood (mostly) restaurant in sausset-les-pins." },
  { id: "lesbainsdulotus", label: "Les Bains du Lotus", description: "great hammam/spa in marrakech, loved it." },
  { id: "lesterrasses", label: "Les Terrasses", description: "seafood restaurant in carry-le-rouet." },
  { id: "letainois", label: "Le Tainois", description: "a pub i may have gone to during a business seminar in tournon, i'm not sure i remember this one well." },
  { id: "lepotitatelier", label: "Le Pôtitatelier", description: "wonderful pottery based on sea creatures i came across at a pottery market in cabriès." },
  { id: "musiquenumero1", label: "Musique N°1", description: "music shop, selling instruments and other stuff, in plan-de-campagne." },
  { id: "myjewelledbox", label: "My Jewelled Box", description: "very beautiful and creative artisanal jewelry, seen at the royal mile market in edinburgh." },
  { id: "seito", label: "Seito", description: "korean bbq restaurant in aix-en-provence." },
  { id: "thewitchery", label: "The Witchery", description: "very cool and classy witchcraft shop in edinburgh." },
  { id: "uplandsroast", label: "Uplands Roast", description: "small cafe in edinburgh, they make the best hot chocolate i ever tried, with toasted marshmallows, cinnamon, etc." },
  { id: "viviennewestwood", label: "Vivienne Westwood", description: "found in the bag of my vivienne westwood armor ring, which i bought in london." },
];

export const cardList: CardData[] = CARD_DEFINITIONS.map(({ id, label, description }) => ({
  id,
  label,
  description,
  front: `/assets/cards/${id}_r.png`,
  back: `/assets/cards/${id}_v.png`,
}));
