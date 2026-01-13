
import { PyramidFeature } from './types';

// Approximate dimensions in meters (scaled for 3D view where 1 unit = 10 meters)
export const PYRAMID_HEIGHT = 14.6; // ~146m
export const PYRAMID_BASE = 23.0;   // ~230m

export const PYRAMID_FEATURES: PyramidFeature[] = [
  {
    id: 'kings-chamber',
    name: "King's Chamber",
    description: "The Burner: A high-heat combustion zone where sulfur dioxide (SO2) gas is refined.",
    position: [0, 4.3, 0],
  },
  {
    id: 'antechamber',
    name: "Antechamber",
    description: "The Acoustic Accelerator: Granite portcullis slabs vibrate to generate ultrasound for sonochemical catalysis.",
    position: [0, 4.3, 0.8],
  },
  {
    id: 'queens-chamber',
    name: "Queen's Chamber",
    description: "The Gas Mixer: Northern and Southern shafts introduce chemicals to produce reactive hydrogen gases.",
    position: [0, 2.1, 0],
  },
  {
    id: 'grand-gallery',
    name: "Grand Gallery",
    description: "The Reaction Ramp: A compression chamber finalizing concentrated sulfuric acid solution.",
    position: [0, 3.2, 1.5],
  },
  {
    id: 'subterranean-chamber',
    name: "Subterranean Chamber",
    description: "The Sump: Water reservoir and waste collection point for the chemical transport system.",
    position: [0, -3.0, 0],
  }
];

export const COLORS = {
  sand: '#D2B48C',
  gold: '#FFD700',
  sky: '#87CEEB',
  stone: '#C2B280',
  glow: '#00ffff'
};
