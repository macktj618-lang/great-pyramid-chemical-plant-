
export interface PyramidFeature {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
}

export type ViewMode = 'exterior' | 'interior' | 'xray';
export type ChemicalMode = 'combustion' | 'industrial_acid';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface SimState {
  concentration: number; // 0 to 100%
  temperature: number;   // Celsius
  pressure: number;      // Bars
  isReacting: boolean;
  hasReacted: boolean;
  energyReleased: number; // MegaJoules
  corrosionLevel: number; // 0 to 1
  phLevel: number;        // 0 to 14
}
