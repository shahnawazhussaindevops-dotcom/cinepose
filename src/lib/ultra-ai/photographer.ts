import type { PhotographerAnalysis } from './types';

const COMPOSITION_TIPS = [
  'Frame your subject slightly off-center using the rule of thirds for a more dynamic composition.',
  'Check the background for distracting elements — a clean background keeps focus on your subject.',
  'Leading lines in the environment can guide the viewer\'s eye toward your subject naturally.',
  'Negative space around your subject can emphasize their presence and create breathing room.',
  'Consider the balance between your subject and the surrounding environment for visual harmony.',
  'Natural frames like doorways, arches, or branches add depth and context to portraits.',
  'Watch the horizon line — keeping it level prevents the image from feeling tilted or unstable.',
  'Include foreground elements to create layers that add three-dimensional depth to the frame.',
  'Symmetry can create powerful, balanced compositions but asymmetry often feels more natural.',
  'The space between your subject and the frame edge affects the emotional tone of the image.',
];

const LIGHT_TIPS_BRIGHT = [
  'The bright scene has excellent dynamic range potential — expose for the highlights.',
  'Bright light creates crisp shadows — use them as compositional elements.',
  'Watch for harsh shadows across the face in bright overhead light.',
  'Bright conditions allow for faster shutter speeds and sharper captures.',
  'Consider using a slight negative exposure compensation to preserve highlight detail.',
];

const LIGHT_TIPS_LOW = [
  'Low light requires steady handling — brace your arms or use a stable surface.',
  'In dim conditions, look for existing light sources to illuminate the subject\'s face.',
  'Wider apertures help capture more light but reduce depth of field.',
  'Night scenes benefit from long exposures, but ensure the subject stays still.',
  'Use reflective surfaces nearby to bounce available light onto the subject.',
];

const LIGHT_TIPS_NEUTRAL = [
  'The current lighting has good natural quality — take advantage of it.',
  'Directional light creates dimension — observe where shadows fall.',
  'Diffused light on overcast days creates soft, even illumination ideal for portraits.',
  'Side lighting emphasizes texture and creates dramatic depth.',
  'The quality of light is more important than the quantity for compelling images.',
];

const WARM_LIGHT_TIPS = [
  'Warm light creates a cozy, inviting atmosphere — embrace the golden tones.',
  'In warm indoor lighting, watch for color casts on skin tones.',
  'Warm backlight creates beautiful rim lighting effects on hair and shoulders.',
  'The warm color temperature complements earth tones and neutral clothing.',
  'Consider using a cooler white balance setting to balance excessive warmth.',
];

const COOL_LIGHT_TIPS = [
  'Cool light creates a clean, modern aesthetic with crisp tones.',
  'Blue-hour light creates serene, moody atmospheres perfect for contemplative portraits.',
  'In cool lighting, warm-colored clothing creates appealing color contrast.',
  'Cool overhead lighting can create unflattering shadows under the eyes and nose.',
  'Mixed color temperatures — warm and cool sources — create the most cinematic looks.',
];

const MOTION_TIPS_MOVING = [
  'Your subject is in motion — use a faster shutter speed to freeze action.',
  'Motion blur in the background with a sharp subject creates a dynamic sense of speed.',
  'Predict your subject\'s movement path and pre-focus on that spot.',
  'Burst mode helps capture the perfect moment during movement.',
  'Track the subject smoothly with your camera for panning shots.',
];

const MOTION_TIPS_STILL = [
  'Still subjects allow for precise composition — take time to refine the frame.',
  'With minimal movement, you can use slower shutter speeds and lower ISO.',
  'Portrait orientation works well for stationary subjects in landscape settings.',
  'Take multiple shots with slight composition variations for the best result.',
  'A static subject lets you focus entirely on lighting and framing nuances.',
];

export class AIPhotographerEngine {
  analyzeScene(
    luminance: number,
    temperature: number,
    faceDetected: boolean,
    eyesOpen: boolean,
    sharpness?: number,
    contrast?: number,
    dominantColors?: { name: string }[],
    depth?: string,
    motionDetected?: boolean,
  ): PhotographerAnalysis {
    const suggestions: string[] = [];
    const liveGuidance: string[] = [];
    const now = Date.now();

    if (!faceDetected) {
      suggestions.push('Position yourself within the frame so I can analyze the composition properly.');
      liveGuidance.push('Step into the frame');
    } else {
      if (!eyesOpen) {
        suggestions.push('Open your eyes fully — squinting reduces the visual impact of the image.');
        liveGuidance.push('Open your eyes');
      }

      if (sharpness !== undefined && sharpness < 0.3) {
        suggestions.push('The image appears soft or out of focus — check that the camera is steady.');
        liveGuidance.push('Hold still — checking focus');
      }

      if (contrast !== undefined && contrast > 0.75) {
        suggestions.push('High contrast scene — watch for blown highlights on the face. Consider moving to softer light.');
      }

      if (contrast !== undefined && contrast < 0.3) {
        suggestions.push('The scene is low contrast — consider adding a light source near the face for dimension.');
      }
    }

    if (luminance < 0.2) {
      suggestions.push('Very dark scene — find a light source or move closer to one for better visibility.');
      liveGuidance.push('Move toward light');
    } else if (luminance < 0.35) {
      suggestions.push('Lighting is low — try positioning your face near a window or light source.');
      liveGuidance.push('Find better light');
    } else if (luminance > 0.8) {
      suggestions.push('Very bright scene — avoid harsh overhead light that creates unflattering shadows.');
    }

    if (temperature > 7000) {
      suggestions.push('Cool blue light dominates — this can create a sterile look. Add warm tones if possible.');
    } else if (temperature < 3500) {
      suggestions.push('Warm amber light dominates — this creates a cozy feel but may need white balance adjustment.');
    }

    if (motionDetected && faceDetected) {
      suggestions.push('Movement detected — try to hold still for cleaner frames.');
      liveGuidance.push('Hold steady');
    }

    const tipSeed = Math.floor(now / 4000);
    const compIdx = Math.floor(dominantColors?.length ?? 1) % COMPOSITION_TIPS.length;
    suggestions.push(COMPOSITION_TIPS[(compIdx + tipSeed) % COMPOSITION_TIPS.length]);

    const lightTips = luminance > 0.65
      ? LIGHT_TIPS_BRIGHT
      : luminance < 0.35
        ? LIGHT_TIPS_LOW
        : LIGHT_TIPS_NEUTRAL;
    const lightIdx = Math.floor(temperature / 1000) % lightTips.length;
    if (lightTips[lightIdx]) suggestions.push(lightTips[lightIdx]);

    const tempTips = temperature > 6000
      ? COOL_LIGHT_TIPS
      : temperature < 4500
        ? WARM_LIGHT_TIPS
        : [];
    if (tempTips.length > 0) {
      suggestions.push(pickCyclic(tempTips, tipSeed));
    }

    const motionTips = motionDetected ? MOTION_TIPS_MOVING : MOTION_TIPS_STILL;
    suggestions.push(pickCyclic(motionTips, tipSeed + 3));

    if (liveGuidance.length === 0) {
      const guidancePool = faceDetected
        ? [
            'Soften your gaze — look slightly past the lens',
            'Roll your shoulders back to open your posture',
            'Tilt your head slightly toward the key light',
            'Shift your weight to your back leg for a natural curve',
            'Imagine a string pulling you up from the crown of your head',
            'Take a slow breath and relax your jaw before the shot',
            'Angle your body 45 degrees to the camera for depth',
            'Keep your chin slightly forward to define your jawline',
            'Part your lips slightly for a natural, relaxed look',
            'Let your hands rest naturally with fingers slightly apart',
          ]
        : [
            'Move into the frame',
            'Adjust your position for better lighting',
            'Find a clean background to stand against',
          ];
      liveGuidance.push(pickCyclic(guidancePool, tipSeed + 5));
    }

    const qualityScore = Math.min(100, Math.round(
      (faceDetected ? 35 : 0) +
      (eyesOpen ? 20 : 0) +
      Math.round(Math.min(1, luminance) * 25) +
      (temperature > 4500 && temperature < 6000 ? 10 : 0) +
      (contrast !== undefined && contrast > 0.35 && contrast < 0.75 ? 10 : 0) +
      (sharpness !== undefined && sharpness > 0.5 ? 5 : 0)
    ));

    const compositionScore = Math.min(100, Math.round(
      40 +
      (contrast !== undefined ? contrast * 30 : 15) +
      (depth === 'deep' ? 20 : depth === 'medium' ? 10 : 0) +
      (faceDetected ? 15 : 0)
    ));

    const poseScore = Math.min(100, Math.round(
      35 +
      (eyesOpen ? 25 : 0) +
      (faceDetected ? 25 : 0) +
      (luminance > 0.3 && luminance < 0.75 ? 15 : 0)
    ));

    const socialScore = Math.min(100, Math.round(
      (qualityScore * 0.4 + poseScore * 0.3 + compositionScore * 0.3) +
      (Math.random() * 8)
    ));

    return {
      qualityScore,
      compositionScore,
      poseScore,
      socialScore,
      eyeDetection: { eyesOpen, blinkDetected: !eyesOpen },
      blurDetected: sharpness !== undefined ? sharpness < 0.3 : false,
      unwantedObjects: [],
      suggestions: suggestions.slice(0, 5),
      liveGuidance: liveGuidance.slice(0, 2),
    };
  }
}

function pickCyclic<T>(arr: T[], idx: number): T {
  return arr[Math.abs(idx) % arr.length];
}

export const aiPhotographer = new AIPhotographerEngine();
