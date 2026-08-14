import type { CardData } from "./types";

type CardDefinition = {
  id: string;
  label: string;
  description: string;
};

const CARD_DEFINITIONS: CardDefinition[] = [
  { id: "77heavens", label: "77heavens", description: "online jewerly brand." },
  { id: "ae2i", label: "AE2I drink ticket", description: "10€ drink ticket from the ae2i, arles's uit student association." },
  { id: "blackmoonbotanica", label: "Black Moon Botanica", description: "very cool witchcraft shop in edinburgh." },
  { id: "burgerbelair", label: "Burger Bel Air", description: "great burger joint in bouc-bel-air." },
  { id: "cafearriba", label: "Cafe Arriba", description: "nice cafe in portree, skye. good mac and cheese with leeks." },
  { id: "cpa", label: "CPA", description: "car spare parts seller in châteauneuf les martigues." },
  { id: "chinamarket", label: "China Market", description: "a chinese store in plan-de-campagne, cabriès." },
  { id: "diedododa", label: "Diedododa", description: "cute prints, sold at the royal market in edinburgh (or online)." },
  { id: "elamrani", label: "El Amrani", description: "leatherworker in the marrakech souk." },
  { id: "enjoysushi", label: "Enjoy Sushi", description: "sushi restaurant in bouc-bel-air." },
  { id: "florentin", label: "Florentin", description: "great italian restaurant in plan-de-campagne, very generous portions." },
  { id: "greenbagelcafe", label: "Green Bagel Cafe", description: "great bagel joint in aix-en-provence, serving soup on the side, sadly closed now." },
  { id: "highlandcowshop", label: "Highland Cow Shop", description: "a shop containing everything related to hairy highland cows, in edinburgh." },
  { id: "holo", label: "Holo bus card", description: "hawaiian bus card i was provided during a field trip to hawaii." },
  { id: "kingpins", label: "Kingpins", description: "reusable arcade pass for any kingpins in the uk." },
  { id: "lamidupain", label: "L'Ami du Pain", description: "bakery in calas." },
  { id: "lapetiteferme", label: "La Petite Ferme", description: "amazing semi-gourmet restaurant in aix-en-provence. same card as côté cour, a gourmet restaurant by the same chef." },
  { id: "latelierburger", label: "L'Atelier Burger", description: "burger restaurant in bouc-bel-air, now closed." },
  { id: "laterrassebiaggi", label: "La Terrasse Biaggi", description: "a rooftop in marseille, i think i went there on my first day of fourth year of cs." },
  { id: "lebelange", label: "Le Bel'Ange", description: "barbershop in aix-en-provence." },
  { id: "lecesar", label: "Le Cesar", description: "seafood (mostly) restaurant in sausset-les-pins." },
  { id: "lelocal", label: "Le Local", description: "very good corsican restaurant in bouc-bel-air." },
  { id: "lequai", label: "Le Quai", description: "restaurant in sausset-les-pins." },
  { id: "lesbainsdulotus", label: "Les Bains du Lotus", description: "great hammam/spa in marrakech, loved it." },
  { id: "lesfilsamaman", label: "Les Fils a Maman", description: "french restaurant in aix-en-provence." },
  { id: "lesparfumsdegrasse", label: "Les Parfums de Grasse", description: "local perfume shop in fontaine-de-vaucluse, from which i buy my perfume online every year now." },
  { id: "lesterrasses", label: "Les Terrasses", description: "seafood restaurant in carry-le-rouet." },
  { id: "letainois", label: "Le Tainois", description: "a pub i may have gone to during a business seminar in tournon, i'm not sure i remember this one well." },
  { id: "londonsubwayticket", label: "London Subway Ticket", description: "london subway ticket to south kensington, bought during my vacation there with my girlfriend <3." },
  { id: "lepotitatelier", label: "Le Pôtitatelier", description: "wonderful pottery based on sea creatures i came across at a pottery market in cabriès." },
  { id: "manae", label: "Manae", description: "jewelry shop in marseille." },
  { id: "maisonbremond1830", label: "Maison Bremond 1830", description: "provencal gourmet food store." },
  { id: "maisonjeandittalon", label: "Maison Jean Dit Talon", description: "bakery in arles." },
  { id: "martharotten", label: "Martha Rotten", description: "very cool online alt/goth hand-made jewelry brand." },
  { id: "musiquenumero1", label: "Musique N°1", description: "music shop, selling instruments and other stuff, in plan-de-campagne." },
  { id: "myjewelledbox", label: "My Jewelled Box", description: "very beautiful and creative artisanal jewelry, seen at the royal mile market in edinburgh." },
  { id: "naruto", label: "Naruto", description: "very good japanese restaurant in aix-en-provence. the boss is really nice and makes funny reels on instagram." },
  { id: "nino", label: "Nino", description: "italian restaurant in plan-de-campagne." },
  { id: "petrarque&laure", label: "Pétrarque & Laure", description: "restaurant in fontaine-de-vaucluse." },
  { id: "puysaintvincent", label: "Puy-Saint-Vincent", description: "chair lift access card to use in the Puy-Saint-Vincent ski station." },
  { id: "retrosatanas", label: "Retro Satanas", description: "cool online alt clothing brand." },
  { id: "robertofanti", label: "Roberto Fanti", description: "my hairdresser for the past few years, in aix-en-provence." },
  { id: "sandrineberthon", label: "Sandrine Berthon", description: "sandrine berthon, french visual artist. seen in gordes." },
  { id: "sebastienallart", label: "Sébastien Allart", description: "my favorite modern painter, located in aix-en-provence. i've been a fan of his work since i was a child." },
  { id: "seito", label: "Seito", description: "korean bbq restaurant in aix-en-provence." },
  { id: "thewitchery", label: "The Witchery", description: "very cool and classy witchcraft shop in edinburgh." },
  { id: "uplandsroast", label: "Uplands Roast", description: "small cafe in edinburgh, they make the best hot chocolate i ever tried, with toasted marshmallows, cinnamon, etc." },
  { id: "viviennewestwood", label: "Vivienne Westwood", description: "found in the bag of my vivienne westwood armor ring, which i bought in london." },
  { id: "yojisu", label: "Yojisu", description: "japanese restaurant around aix-en-provence." },
];

export const cardList: CardData[] = CARD_DEFINITIONS.map(({ id, label, description }) => ({
  id,
  label,
  description,
  front: `/assets/cards/${id}_r.png`,
  back: `/assets/cards/${id}_v.png`,
}));
