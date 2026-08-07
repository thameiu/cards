export type CardData = {
  id: string;
  label: string;
  description: string;
  front: string;
  back: string | null;
};

export type ViewMode = "about" | "scroll" | "infinite";
