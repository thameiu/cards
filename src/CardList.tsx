import type { CardData, CardTag } from "./types";

type CardDefinition = {
  id: string;
  label: string;
  description: string;
  tags: CardTag[];
};

const CARD_DEFINITIONS: CardDefinition[] = [
  { id: "77heavens", label: "77heavens", description: "online jewerly brand.", tags: ["fashion"] },
  { id: "ae2i", label: "AE2I drink ticket", description: "10€ drink ticket from the ae2i, arles's uit student association.", tags: ["food"] },
  { id: "blackmoonbotanica", label: "Black Moon Botanica", description: "very cool witchcraft shop in edinburgh.", tags: ["shop"] },
  { id: "burgerbelair", label: "Burger Bel Air", description: "great burger joint in bouc-bel-air.", tags: ["food"] },
  { id: "cafearriba", label: "Cafe Arriba", description: "nice cafe in portree, skye. good mac and cheese with leeks.", tags: ["food"] },
  { id: "cpa", label: "CPA", description: "car spare parts seller in châteauneuf les martigues.", tags: ["shop", "miscellaneous"] },
  { id: "chinamarket", label: "China Market", description: "a chinese store in plan-de-campagne, cabriès.", tags: ["shop"] },
  { id: "diedododa", label: "Diedododa", description: "cute prints, sold at the royal market in edinburgh (or online).", tags: ["art", "shop"] },
  { id: "elamrani", label: "El Amrani", description: "leatherworker in the marrakech souk.", tags: ["craftsmanship", "shop"] },
  { id: "enjoysushi", label: "Enjoy Sushi", description: "sushi restaurant in bouc-bel-air.", tags: ["food"] },
  { id: "florentin", label: "Florentin", description: "great italian restaurant in plan-de-campagne, very generous portions.", tags: ["food"] },
  { id: "greenbagelcafe", label: "Green Bagel Cafe", description: "great bagel joint in aix-en-provence, serving soup on the side, sadly closed now.", tags: ["food"] },
  { id: "highlandcowshop", label: "Highland Cow Shop", description: "a shop containing everything related to hairy highland cows, in edinburgh.", tags: ["shop"] },
  { id: "holo", label: "Holo bus card", description: "hawaiian bus card i was provided during a field trip to hawaii.", tags: ["transport"] },
  { id: "kingpins", label: "Kingpins", description: "reusable arcade pass for any kingpins in the uk.", tags: ["miscellaneous"] },
  { id: "lamidupain", label: "L'Ami du Pain", description: "bakery in calas.", tags: ["food"] },
  { id: "lapetiteferme", label: "La Petite Ferme", description: "amazing semi-gourmet restaurant in aix-en-provence. same card as côté cour, a gourmet restaurant by the same chef.", tags: ["food"] },
  { id: "latelierburger", label: "L'Atelier Burger", description: "burger restaurant in bouc-bel-air, now closed.", tags: ["food"] },
  { id: "laterrassebiaggi", label: "La Terrasse Biaggi", description: "a rooftop in marseille, i think i went there on my first day of fourth year of cs.", tags: ["food"] },
  { id: "lebelange", label: "Le Bel'Ange", description: "barbershop in aix-en-provence.", tags: ["wellness", "shop"] },
  { id: "lecesar", label: "Le Cesar", description: "seafood (mostly) restaurant in sausset-les-pins.", tags: ["food"] },
  { id: "lelocal", label: "Le Local", description: "very good corsican restaurant in bouc-bel-air.", tags: ["food"] },
  { id: "lequai", label: "Le Quai", description: "restaurant in sausset-les-pins.", tags: ["food"] },
  { id: "lesbainsdulotus", label: "Les Bains du Lotus", description: "great hammam/spa in marrakech, loved it.", tags: ["wellness"] },
  { id: "lesfilsamaman", label: "Les Fils a Maman", description: "french restaurant in aix-en-provence.", tags: ["food"] },
  { id: "lesparfumsdegrasse", label: "Les Parfums de Grasse", description: "local perfume shop in fontaine-de-vaucluse, from which i buy my perfume online every year now.", tags: ["wellness", "shop"] },
  { id: "lesterrasses", label: "Les Terrasses", description: "seafood restaurant in carry-le-rouet.", tags: ["food"] },
  { id: "letainois", label: "Le Tainois", description: "a pub i may have gone to during a business seminar in tournon, i'm not sure i remember this one well.", tags: ["food"] },
  { id: "londonsubwayticket", label: "London Subway Ticket", description: "london subway ticket to south kensington, bought during my vacation there with my girlfriend <3.", tags: ["transport"] },
  { id: "lepotitatelier", label: "Le Pôtitatelier", description: "wonderful pottery based on sea creatures i came across at a pottery market in cabriès.", tags: ["craftsmanship", "art"] },
  { id: "manae", label: "Manae", description: "jewelry shop in marseille.", tags: ["fashion", "shop"] },
  { id: "maisonbremond1830", label: "Maison Bremond 1830", description: "provencal gourmet food store.", tags: ["food", "shop"] },
  { id: "maisonjeandittalon", label: "Maison Jean Dit Talon", description: "bakery in arles.", tags: ["food"] },
  { id: "martharotten", label: "Martha Rotten", description: "very cool online alt/goth hand-made jewelry brand.", tags: ["craftsmanship","fashion"] },
  { id: "musiquenumero1", label: "Musique N°1", description: "music shop, selling instruments and other stuff, in plan-de-campagne.", tags: ["art", "shop"] },
  { id: "myjewelledbox", label: "My Jewelled Box", description: "very beautiful and creative artisanal jewelry, seen at the royal mile market in edinburgh.", tags: ["craftsmanship", "fashion", "shop"] },
  { id: "naruto", label: "Naruto", description: "very good japanese restaurant in aix-en-provence. the boss is really nice and makes funny reels on instagram.", tags: ["food"] },
  { id: "nino", label: "Nino", description: "italian restaurant in plan-de-campagne.", tags: ["food"] },
  { id: "petrarque&laure", label: "Pétrarque & Laure", description: "restaurant in fontaine-de-vaucluse.", tags: ["food"] },
  { id: "puysaintvincent", label: "Puy-Saint-Vincent", description: "chair lift access card to use in the Puy-Saint-Vincent ski station.", tags: ["transport"] },
  { id: "retrosatanas", label: "Retro Satanas", description: "cool online alt clothing brand.", tags: ["fashion"] },
  { id: "robertofanti", label: "Roberto Fanti", description: "my hairdresser for the past few years, in aix-en-provence.", tags: ["wellness"] },
  { id: "sandrineberthon", label: "Sandrine Berthon", description: "sandrine berthon, french visual artist. seen in gordes.", tags: ["art"] },
  { id: "sebastienallart", label: "Sébastien Allart", description: "my favorite modern painter, located in aix-en-provence. i've been a fan of his work since i was a child.", tags: ["art"] },
  { id: "seito", label: "Seito", description: "korean bbq restaurant in aix-en-provence.", tags: ["food"] },
  { id: "thewitchery", label: "The Witchery", description: "very cool and classy witchcraft shop in edinburgh.", tags: ["shop"] },
  { id: "uplandsroast", label: "Uplands Roast", description: "small cafe in edinburgh, they make the best hot chocolate i ever tried, with toasted marshmallows, cinnamon, etc.", tags: ["food"] },
  { id: "viviennewestwood", label: "Vivienne Westwood", description: "found in the bag of my vivienne westwood armor ring, which i bought in london.", tags: ["fashion", "shop"] },
  { id: "yojisu", label: "Yojisu", description: "japanese restaurant around aix-en-provence.", tags: ["food"] },
];

export const cardList: CardData[] = CARD_DEFINITIONS.map(({ id, label, description, tags }) => ({
  id,
  label,
  description,
  front: `/assets/cards/${id}_r.png`,
  back: `/assets/cards/${id}_v.png`,
  tags,
}));
