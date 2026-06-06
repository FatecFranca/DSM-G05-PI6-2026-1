export type Recommendation = 'good' | 'regular' | 'bad';

export interface PricePoint {
  date: string;
  price: number;
}

export interface CommodityDto {
  id: string;
  name: string;
  currentPrice: number;
  unit: string;
  forecastPercent: number;
  recommendation: Recommendation;
  history: PricePoint[];
}
