import type { LocationAnalysis, LocationType, LocationScore } from './types';

function detectLocation(luminance: number, temperature: number, isGoldenHour: boolean, tiltAngle: number): { type: LocationType; name: string } {
  if (isGoldenHour) return { type: 'sunset_point', name: 'Golden Hour Vista' };
  if (luminance > 0.7 && temperature > 7000) return { type: 'beach', name: 'Coastal Area' };
  if (luminance > 0.6 && temperature > 5500) return { type: 'city', name: 'Urban Center' };
  if (luminance > 0.5 && tiltAngle > 30) return { type: 'mountain', name: 'High Altitude' };
  if (luminance > 0.5 && temperature < 5500) return { type: 'forest', name: 'Woodland Area' };
  if (luminance > 0.4 && temperature > 6000) return { type: 'street', name: 'Street Scene' };
  if (luminance > 0.3 && temperature < 4000) return { type: 'cafe', name: 'Indoor Cafe' };
  if (luminance > 0.3) return { type: 'lake', name: 'Lakeside View' };
  if (luminance < 0.2) return { type: 'night_club', name: 'Night/Dark Environment' };
  return { type: 'unknown', name: 'General Location' };
}

function generateScores(type: LocationType): LocationScore {
  const base: Record<LocationType, Partial<LocationScore>> = {
    beach: { cinematic: 85, instagram: 95, travel: 90, romantic: 80, luxury: 75, drone: 90, sunset: 95 },
    mountain: { cinematic: 95, instagram: 88, travel: 95, romantic: 70, luxury: 65, drone: 98, sunset: 85 },
    cafe: { cinematic: 60, instagram: 80, travel: 65, romantic: 75, luxury: 70, drone: 20, sunset: 40 },
    street: { cinematic: 70, instagram: 85, travel: 75, romantic: 55, luxury: 60, drone: 60, sunset: 65 },
    city: { cinematic: 88, instagram: 90, travel: 85, romantic: 65, luxury: 85, drone: 85, sunset: 70 },
    forest: { cinematic: 90, instagram: 82, travel: 88, romantic: 85, luxury: 50, drone: 75, sunset: 60 },
    desert: { cinematic: 92, instagram: 85, travel: 88, romantic: 60, luxury: 70, drone: 95, sunset: 98 },
    lake: { cinematic: 88, instagram: 90, travel: 92, romantic: 90, luxury: 75, drone: 90, sunset: 92 },
    luxury_property: { cinematic: 85, instagram: 92, travel: 70, romantic: 80, luxury: 98, drone: 70, sunset: 75 },
    sunset_point: { cinematic: 98, instagram: 96, travel: 95, romantic: 98, luxury: 85, drone: 88, sunset: 100 },
    historical_place: { cinematic: 85, instagram: 88, travel: 92, romantic: 75, luxury: 80, drone: 80, sunset: 82 },
    rooftop: { cinematic: 82, instagram: 90, travel: 75, romantic: 80, luxury: 85, drone: 75, sunset: 90 },
    garden: { cinematic: 75, instagram: 85, travel: 78, romantic: 88, luxury: 72, drone: 55, sunset: 80 },
    indoor_studio: { cinematic: 70, instagram: 75, travel: 40, romantic: 60, luxury: 80, drone: 10, sunset: 20 },
    pool: { cinematic: 78, instagram: 92, travel: 70, romantic: 80, luxury: 88, drone: 60, sunset: 85 },
    waterfall: { cinematic: 96, instagram: 90, travel: 95, romantic: 85, luxury: 55, drone: 85, sunset: 70 },
    snow: { cinematic: 94, instagram: 92, travel: 90, romantic: 80, luxury: 78, drone: 95, sunset: 88 },
    night_club: { cinematic: 80, instagram: 85, travel: 40, romantic: 55, luxury: 75, drone: 15, sunset: 10 },
    restaurant: { cinematic: 65, instagram: 75, travel: 55, romantic: 72, luxury: 82, drone: 10, sunset: 25 },
    hotel_room: { cinematic: 70, instagram: 78, travel: 45, romantic: 82, luxury: 90, drone: 5, sunset: 35 },
    unknown: { cinematic: 60, instagram: 60, travel: 60, romantic: 60, luxury: 50, drone: 50, sunset: 50 },
  };

  const s = base[type] || base.unknown;
  return {
    cinematic: s.cinematic || 60,
    instagram: s.instagram || 60,
    travel: s.travel || 60,
    romantic: s.romantic || 60,
    luxury: s.luxury || 50,
    drone: s.drone || 50,
    sunset: s.sunset || 50,
  };
}

function getTips(type: LocationType): string[] {
  const tips: Record<LocationType, string[]> = {
    beach: ['Shoot during golden hour', 'Use CPL filter for water', 'Include footprints as leading lines'],
    mountain: ['Wait for clouds to clear', 'Include person for scale', 'Shoot at f/8 for sharpness'],
    cafe: ['Use window light', 'Include coffee cup prop', 'Shoot from above for flat lay'],
    street: ['Use leading lines from buildings', 'Shoot at eye level', 'Include motion blur'],
    city: ['Find reflections in glass', 'Shoot from high vantage', 'Use long exposure at night'],
    forest: ['Use light rays through trees', 'Include moss/leaves texture', 'Shoot with wide aperture'],
    desert: ['Shoot at sunrise/sunset', 'Use dune lines as leading', 'Include camel or tent for scale'],
    lake: ['Find reflections', 'Shoot at blue hour', 'Include foreground rocks'],
    luxury_property: ['Use symmetry in architecture', 'Include pool reflections', 'Shoot at twilight'],
    sunset_point: ['Arrive 30min before sunset', 'Use silhouette technique', 'Include clouds for drama'],
    historical_place: ['Include architectural details', 'Shoot early morning', 'Use natural frames'],
    rooftop: ['Shoot during golden hour', 'Include skyline', 'Use city lights at night'],
    garden: ['Include flowers as foreground', 'Shoot in soft light', 'Use winding paths'],
    indoor_studio: ['Control all lighting', 'Use textured backgrounds', 'Experiment with gels'],
    pool: ['Shoot from water level', 'Use reflection', 'Include splashes for action'],
    waterfall: ['Use slow shutter (1s)', 'Include person for scale', 'Shoot from multiple angles'],
    snow: ['Overexpose by +1EV', 'Include dark elements', 'Shoot during blue hour'],
    night_club: ['Use neon lights', 'Include smoke machine', 'Shoot with wide aperture'],
    restaurant: ['Use candle light', 'Include food/drink', 'Shoot from interesting angle'],
    hotel_room: ['Use natural window light', 'Include bed texture', 'Shoot from corner'],
    unknown: ['Find interesting foreground', 'Wait for good light', 'Experiment with angles'],
  };
  return tips[type] || tips.unknown;
}

export class AILocationIntelligenceEngine {
  analyze(luminance: number, temperature: number, isGoldenHour: boolean, tiltAngle: number): LocationAnalysis {
    const { type, name } = detectLocation(luminance, temperature, isGoldenHour, tiltAngle);
    return {
      locationType: type,
      locationName: name,
      scores: generateScores(type),
      weather: luminance > 0.6 ? 'clear' : luminance > 0.3 ? 'partly cloudy' : 'overcast/dark',
      bestTimeToShoot: type === 'sunset_point' ? '30 minutes before sunset' : 'Golden hour',
      tips: getTips(type),
    };
  }
}

export const aiLocationIntel = new AILocationIntelligenceEngine();
