import type { OutfitAnalysis, LocationType } from './types';

const LOCATION_OUTFITS: Record<LocationType, {
  outfit: string;
  colors: string[];
  accessories: string[];
  footwear: string;
  explanation: string;
}> = {
  beach: {
    outfit: 'White linen shirt + cream shorts',
    colors: ['white', 'cream', 'sand', 'sky blue', 'coral'],
    accessories: ['straw hat', 'sunglasses', 'shell necklace', 'woven bracelet'],
    footwear: 'Leather sandals or barefoot',
    explanation: 'Light fabrics reflect heat. White linen creates effortless coastal luxury.',
  },
  mountain: {
    outfit: 'Earth-tone jacket + dark jeans + thermal',
    colors: ['olive', 'brown', 'burgundy', 'charcoal', 'mustard'],
    accessories: ['beanie', 'leather backpack', 'scarf', 'aviator sunglasses'],
    footwear: 'Hiking boots',
    explanation: 'Earth tones complement the natural palette. Layers add visual depth.',
  },
  cafe: {
    outfit: 'Cashmere sweater + tailored trousers',
    colors: ['cream', 'black', 'navy', 'camel', 'burgundy'],
    accessories: ['leather watch', 'reading glasses', 'minimalist jewelry'],
    footwear: 'Loafers or clean sneakers',
    explanation: 'Smart casual with warm textures fits intimate cafe atmosphere.',
  },
  city: {
    outfit: 'Tailored blazer + silk blouse + trousers',
    colors: ['black', 'white', 'red', 'navy', 'grey'],
    accessories: ['structured bag', 'statement earrings', 'silk scarf'],
    footwear: 'Block heels or clean white sneakers',
    explanation: 'Urban sophistication. Clean lines against architectural backgrounds.',
  },
  street: {
    outfit: 'Oversized blazer + graphic tee + wide-leg pants',
    colors: ['black', 'white', 'denim', 'olive', 'cream'],
    accessories: ['chain necklace', 'bucket hat', 'crossbody bag'],
    footwear: 'Chunky sneakers or combat boots',
    explanation: 'High-fashion street style. Proportions create visual interest.',
  },
  forest: {
    outfit: 'Flowing maxi dress or linen shirt + cargo pants',
    colors: ['forest green', 'brown', 'cream', 'rust', 'navy'],
    accessories: ['leaf crown', 'leather belt', 'woven bag'],
    footwear: 'Sturdy boots',
    explanation: 'Natural tones blend with foliage while flowing fabrics catch the light.',
  },
  desert: {
    outfit: 'Flowing caftan or linen shirt + wide-leg pants',
    colors: ['terracotta', 'sand', 'white', 'orange', 'gold'],
    accessories: ['wide-brim hat', 'gold jewelry', 'leather sandals'],
    footwear: 'Flat sandals',
    explanation: 'Light layers protect from sun while creating dramatic wind-blown silhouettes.',
  },
  lake: {
    outfit: 'White dress or light linen shirt + shorts',
    colors: ['white', 'navy', 'striped blue', 'cream', 'soft pink'],
    accessories: ['straw tote', 'sunglasses', 'delicate necklace'],
    footwear: 'Espadrilles or barefoot',
    explanation: 'Classic waterside elegance. Blue and white reflect the aquatic setting.',
  },
  luxury_property: {
    outfit: 'Black suit or evening gown',
    colors: ['black', 'white', 'gold', 'burgundy', 'emerald'],
    accessories: ['statement watch', 'diamond earrings', 'clutch bag', 'silk tie'],
    footwear: 'Stiletto heels or patent leather shoes',
    explanation: 'High-contrast luxury. Monochrome with gold accents reads as premium.',
  },
  rooftop: {
    outfit: 'Satin slip dress or silk shirt + tailored pants',
    colors: ['black', 'gold', 'red', 'silver', 'navy'],
    accessories: ['choker', 'metallic clutch', 'slim watch'],
    footwear: 'Strappy heels or loafers',
    explanation: 'Sunset city backdrop demands sleek silhouettes with reflective textures.',
  },
  sunset_point: {
    outfit: 'Flowing dress or relaxed linen suit',
    colors: ['warm orange', 'pink', 'cream', 'gold', 'terracotta'],
    accessories: ['wide hat', 'delicate chain', 'sunglasses'],
    footwear: 'Wedges or stylish sandals',
    explanation: 'Warm tones complement golden hour. Light fabrics catch the backlight.',
  },
  historical_place: {
    outfit: 'Mid-century style dress or vintage suit',
    colors: ['mustard', 'olive', 'cream', 'burgundy', 'brown'],
    accessories: ['beret', 'pearl earrings', 'vintage watch', 'leather gloves'],
    footwear: 'Oxford shoes or vintage heels',
    explanation: 'Vintage aesthetics match classical architecture for timeless photographs.',
  },
  garden: {
    outfit: 'Floral dress or light blazer + chinos',
    colors: ['pink', 'green', 'white', 'lavender', 'yellow'],
    accessories: ['flower crown', 'straw bag', 'delicate rings'],
    footwear: 'Ballet flats or clean sneakers',
    explanation: 'Florals and pastels harmonize with botanical surroundings.',
  },
  indoor_studio: {
    outfit: 'Statement piece + neutral basics',
    colors: ['black', 'white', 'any bold accent'],
    accessories: ['minimal jewelry', 'structured bag'],
    footwear: 'Clean heels or dress shoes',
    explanation: 'Studio photography focuses on you — bold but clean styling works best.',
  },
  pool: {
    outfit: 'Swimwear + sheer cover-up',
    colors: ['white', 'coral', 'teal', 'black', 'gold'],
    accessories: ['straw hat', 'sunglasses', 'gold chain'],
    footwear: 'Slide sandals or barefoot',
    explanation: 'Poolside luxury. High-shine fabrics and reflective surfaces pop.',
  },
  waterfall: {
    outfit: 'Quick-dry athletic wear or swimsuit',
    colors: ['black', 'teal', 'white', 'lime', 'coral'],
    accessories: ['waterproof watch', 'hair tie'],
    footwear: 'Water shoes or barefoot',
    explanation: 'Functional fashion. Dark colors contrast with white water spray.',
  },
  snow: {
    outfit: 'Monochromatic winter coat + cashmere layers',
    colors: ['white', 'cream', 'black', 'red', 'navy'],
    accessories: ['beanie', 'leather gloves', 'scarf', 'goggles'],
    footwear: 'Snow boots',
    explanation: 'High contrast against snow. Red accent pops dramatically.',
  },
  night_club: {
    outfit: 'Sequins + leather + metallic accents',
    colors: ['black', 'silver', 'gold', 'red', 'purple'],
    accessories: ['statement earrings', 'chain belt', 'body chain'],
    footwear: 'Platform heels or boots',
    explanation: 'Reflective materials catch club lighting for dramatic night shots.',
  },
  restaurant: {
    outfit: 'Little black dress or tailored suit',
    colors: ['black', 'white', 'red', 'navy', 'champagne'],
    accessories: ['statement watch', 'minimalist earrings', 'slim wallet'],
    footwear: 'Heels or dress shoes',
    explanation: 'Timeless elegance. Clean silhouettes read as effortless sophistication.',
  },
  hotel_room: {
    outfit: 'Silk robe or cashmere set + minimal makeup',
    colors: ['white', 'cream', 'champagne', 'black', 'soft pink'],
    accessories: ['delicate chain', 'watch', 'room key prop'],
    footwear: 'Slippers or barefoot',
    explanation: 'Intimate luxury. Soft textures and neutral tones create cozy elegance.',
  },
  unknown: {
    outfit: 'Classic piece in solid color',
    colors: ['black', 'white', 'navy'],
    accessories: ['minimal jewelry', 'clean shoes'],
    footwear: 'Clean white sneakers',
    explanation: 'Classic styling works in any environment.',
  },
};

export class AIOutfitAnalyzerEngine {
  analyze(locationType: LocationType, detectedColors: string[] = []): OutfitAnalysis {
    const loc = LOCATION_OUTFITS[locationType] || LOCATION_OUTFITS.unknown;
    return {
      currentColors: detectedColors.length ? detectedColors : ['black', 'white'],
      recommendedColors: loc.colors,
      recommendedOutfit: loc.outfit,
      recommendedAccessories: loc.accessories,
      recommendedFootwear: loc.footwear,
      outfitMatchScore: this.calculateMatch(locationType, detectedColors),
      explanation: loc.explanation,
    };
  }

  private calculateMatch(location: LocationType, colors: string[]): number {
    const loc = LOCATION_OUTFITS[location] || LOCATION_OUTFITS.unknown;
    const matchCount = colors.filter(c => loc.colors.includes(c.toLowerCase())).length;
    return Math.min(100, Math.round((matchCount / Math.max(colors.length, 1)) * 60 + 40));
  }
}

export const aiOutfitAnalyzer = new AIOutfitAnalyzerEngine();
