import type { MasterSceneResult, LocationType, LocationScore } from './types';
import { aiLocationIntel } from './locationIntel';
import { directorVision } from './directorVision';
import { moodDetection } from './moodDetection';

export class MasterSceneAnalyzerEngine {
  analyze(
    luminance: number,
    temperature: number,
    isGoldenHour: boolean,
    isBacklit: boolean,
    tiltAngle: number,
    locationOverride?: LocationType
  ): MasterSceneResult {
    const location = aiLocationIntel.analyze(luminance, temperature, isGoldenHour, tiltAngle);
    const mood = moodDetection.detect(luminance, temperature, isGoldenHour, isBacklit, tiltAngle);
    const vision = directorVision.analyze(location.locationType, mood.primary, isGoldenHour);

    return {
      location,
      weather: location.weather,
      lighting: isGoldenHour ? 'Golden hour — warm, directional, cinematic' : isBacklit ? 'Backlit — dramatic rim light' : temperature > 6000 ? 'Cool, diffused' : temperature < 4000 ? 'Warm, tungsten' : 'Neutral, balanced',
      composition: vision.depthAnalysis,
      humanPosition: mood.adaptivePose,
      background: vision.storytellingPotential,
      mood: `${mood.primary} (${mood.confidence}% confidence)`,
      bestPose: mood.adaptivePose,
      bestCameraAngle: this.getBestAngle(location.locationType, tiltAngle),
      bestLens: this.getBestLens(location.locationType),
      bestColorGrade: isGoldenHour ? 'Warm teal-orange grade, +0.3 temp, +0.2 tint' : isBacklit ? 'Low contrast, lifted shadows, soft glow' : 'Neutral grade with slight warmth',
      bestLUT: isGoldenHour ? 'Golden Hour' : isBacklit ? 'Ethereal' : location.locationType === 'mountain' ? 'Mountain' : 'Cinematic',
      bestStorytellingConcept: vision.storyType,
      bestReelIdea: `${mood.primary} ${location.locationType} reel — ${vision.suggestion.slice(0, 60)}`,
      bestThumbnailIdea: `${mood.primary} expression, ${location.locationType} background, warm ${isGoldenHour ? 'golden' : 'natural'} light`,
      bestHollywoodDirection: `${vision.visualTheme}. ${vision.suggestion}`,
      overallRecommendation: `This is a ${mood.primary} scene in a ${location.locationName}. ${isGoldenHour ? 'Shoot now during golden hour for maximum cinematic impact.' : 'Wait for golden hour for best results.'} Use ${this.getBestLens(location.locationType)} at ${this.getBestAngle(location.locationType, tiltAngle)}. ${vision.suggestion}`,
    };
  }

  private getBestAngle(location: LocationType, tiltAngle: number): string {
    if (location === 'mountain' || location === 'desert') return tiltAngle > 30 ? 'High angle for scale' : 'Eye level for intimacy';
    if (location === 'beach') return tiltAngle > 20 ? 'Low angle for dramatic sky' : 'Eye level for horizon line';
    if (location === 'city' || location === 'street') return 'Eye level with slight upward tilt';
    if (location === 'luxury_property') return 'Slightly high angle for elegance';
    return 'Eye level';
  }

  private getBestLens(location: LocationType): string {
    if (location === 'mountain' || location === 'desert') return '24-70mm f/2.8 (versatile)';
    if (location === 'beach' || location === 'lake') return '35mm f/1.4 (environmental portraits)';
    if (location === 'city') return '50mm f/1.8 (street perspective)';
    if (location === 'luxury_property') return '85mm f/1.4 (compression and elegance)';
    if (location === 'forest') return '16-35mm f/2.8 (capture the scale)';
    return '50mm f/1.8 (natural perspective)';
  }
}

export const masterSceneAnalyzer = new MasterSceneAnalyzerEngine();
