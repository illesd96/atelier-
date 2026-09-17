export interface Studio {
  id: string;
  name: string;
  price?: number;
  /** Slot length in minutes. Defaults to 60; the makeup rooms use 30. */
  slotMinutes?: number;
}

export interface StudioGridProps {
  onCartUpdate?: () => void;
}

