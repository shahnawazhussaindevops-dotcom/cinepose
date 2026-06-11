import type { PhotographerAnalysis } from './types';

export class AIPhotographerEngine {
  analyzeScene(
    luminance: number,
    temperature: number,
    faceDetected: boolean,
    eyesOpen: boolean
  ): PhotographerAnalysis {
    const suggestions: string[] = [];
    const liveGuidance: string[] = [];

    if (!faceDetected) {
      suggestions.push('Position your face within the frame');
      liveGuidance.push('Move into frame');
    }

    if (!eyesOpen) {
      suggestions.push('Open your eyes fully — squinting reduces impact');
      liveGuidance.push('Open your eyes');
    }

    if (luminance < 0.3) {
      suggestions.push('Increase lighting — scene is too dark');
      liveGuidance.push('Move toward light source');
    }

    if (temperature > 6500) {
      suggestions.push('Color temperature is too cool — use warmer light');
      liveGuidance.push('Find warmer light');
    }

    if (luminance > 0.7 && temperature > 5500 && temperature < 6500) {
      suggestions.push('Perfect lighting conditions. Shoot now!');
    }

    const qualityScore = Math.min(100, Math.round(
      (faceDetected ? 40 : 0) +
      (eyesOpen ? 20 : 0) +
      Math.round(luminance * 30) +
      (temperature > 4500 && temperature < 6000 ? 10 : 0)
    ));

    const compositionScore = Math.min(100, Math.round(60 + Math.random() * 30));
    const poseScore = Math.min(100, Math.round(50 + Math.random() * 40));
    const socialScore = Math.min(100, Math.round((qualityScore + poseScore) / 2 + Math.random() * 10));

    if (liveGuidance.length === 0) {
      const guidanceOptions = [
        'Move 2 steps left',
        'Raise chin slightly',
        'Turn shoulder 15 degrees',
        'Relax arms',
        'Take one step forward',
        'Soften your gaze',
        'Roll shoulders back',
        'Shift weight to back leg',
        'Tilt head slightly right',
        'Breathe and relax',
      ];
      liveGuidance.push(guidanceOptions[Math.floor(Math.random() * guidanceOptions.length)]);
    }

    return {
      qualityScore,
      compositionScore,
      poseScore,
      socialScore,
      eyeDetection: { eyesOpen, blinkDetected: !eyesOpen },
      blurDetected: luminance < 0.15,
      unwantedObjects: [],
      suggestions,
      liveGuidance,
    };
  }

  getPhotoTips(location: string): string[] {
    const tips: Record<string, string[]> = {
      beach: [
        'Shoot during golden hour for warm skin tones',
        'Use polarizer to cut glare from water',
        'Include foreground elements like shells or footprints',
      ],
      mountain: [
        'Use leading lines from trails or ridges',
        'Include a person for scale',
        'Shoot at f/8-f/11 for maximum sharpness',
      ],
      sunset: [
        'Expose for the sky, use flash for subject fill',
        'Silhouettes work best at twilight',
        'Shoot in RAW for maximum color data',
      ],
      city: [
        'Look for reflections in glass buildings',
        'Use long exposures for light trails',
        'Frame shots with architectural elements',
      ],
      cafe: [
        'Use natural window light as your key light',
        'Shoot from above for flat lay compositions',
        'Include hands holding cups for human element',
      ],
    };
    return tips[location] || [
      'Find clean backgrounds',
      'Use natural framing elements',
      'Shoot in golden hour light',
    ];
  }
}

export const aiPhotographer = new AIPhotographerEngine();
