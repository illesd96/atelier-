export interface Studio {
  id: string;
  name: string;
  price?: number;
}

export interface StudioGridProps {
  onCartUpdate?: () => void;
}

