import { useRef, useCallback, useEffect, useState } from 'react';
import { useCameraContext } from '../lib/CameraContext';
import { useMemoryStore } from '../stores/memoryStore';

export interface SceneAnalysis {
  averageLuminance: number;
  colorTemperature: number;
  colorPalette: string[];
  estimatedDepth: 'shallow' | 'medium' | 'deep';
  isBacklit: boolean;
  hasFace: boolean;
  facePosition: { x: number; y: number } | null;
  faceSize: number;
  dominantColors: { r: number; g: number; b: number; name: string }[];
  contrast: number;
  sharpness: number;
  motionDetected: boolean;
  sceneType: string;
  confidence: number;
  timestamp: number;
}

const COLOR_NAMES: { r: number; g: number; b: number; name: string }[] = [
  { r: 0, g: 0, b: 0, name: 'black' },
  { r: 255, g: 255, b: 255, name: 'white' },
  { r: 255, g: 0, b: 0, name: 'red' },
  { r: 0, g: 255, b: 0, name: 'green' },
  { r: 0, g: 0, b: 255, name: 'blue' },
  { r: 255, g: 255, b: 0, name: 'yellow' },
  { r: 255, g: 192, b: 203, name: 'pink' },
  { r: 128, g: 0, b: 128, name: 'purple' },
  { r: 255, g: 165, b: 0, name: 'orange' },
  { r: 165, g: 42, b: 42, name: 'brown' },
  { r: 128, g: 128, b: 128, name: 'grey' },
  { r: 0, g: 128, b: 128, name: 'teal' },
  { r: 0, g: 0, b: 128, name: 'navy' },
  { r: 0, g: 128, b: 0, name: 'olive' },
  { r: 192, g: 192, b: 192, name: 'silver' },
  { r: 255, g: 215, b: 0, name: 'gold' },
  { r: 245, g: 245, b: 220, name: 'cream' },
  { r: 210, g: 180, b: 140, name: 'tan' },
  { r: 240, g: 128, b: 128, name: 'coral' },
  { r: 173, g: 216, b: 230, name: 'sky blue' },
  { r: 255, g: 99, b: 71, name: 'tomato' },
  { r: 60, g: 179, b: 113, name: 'mint' },
  { r: 255, g: 228, b: 196, name: 'bisque' },
  { r: 220, g: 220, b: 220, name: 'light grey' },
];

function nearestColorName(r: number, g: number, b: number): string {
  let minDist = Infinity;
  let name = 'unknown';
  for (const c of COLOR_NAMES) {
    const d = (c.r - r) ** 2 + (c.g - g) ** 2 + (c.b - b) ** 2;
    if (d < minDist) { minDist = d; name = c.name; }
  }
  return name;
}

function sampleFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): SceneAnalysis | null {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = Math.min(w, 320);
  canvas.height = Math.min(h, 240);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let totalLuminance = 0;
  let totalR = 0, totalG = 0, totalB = 0;
  const centerX = Math.floor(canvas.width / 2);
  const centerY = Math.floor(canvas.height / 2);
  const centerR = centerY * canvas.width + centerX;
  let faceRegionBright = 0;
  let facePixels = 0;
  let highFreqEnergy = 0;

  const histLum = new Array(256).fill(0);
  const buckets: Array<{ r: number; g: number; b: number; count: number }> = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLuminance += lum;
    totalR += r; totalG += g; totalB += b;
    const idx = Math.floor(lum);
    histLum[Math.min(idx, 255)]++;

    const px = (i / 4) % canvas.width;
    const py = Math.floor((i / 4) / canvas.width);
    const distFromCenter = Math.sqrt((px - centerX) ** 2 + (py - centerY) ** 2);
    if (distFromCenter < canvas.width * 0.15) {
      faceRegionBright += lum;
      facePixels++;
    }

    if (i >= 8 && i < data.length - 8) {
      highFreqEnergy += Math.abs(lum - (0.299 * data[i - 4] + 0.587 * data[i - 3] + 0.114 * data[i - 2]));
    }

    const found = buckets.find(bk => Math.abs(bk.r - r) < 30 && Math.abs(bk.g - g) < 30 && Math.abs(bk.b - b) < 30);
    if (found) { found.count++; }
    else if (buckets.length < 20) { buckets.push({ r, g, b, count: 1 }); }
  }

  const pixelCount = data.length / 4;
  const avgLum = totalLuminance / pixelCount;
  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;

  const temp = avgR > avgG && avgR > avgB ? 'warm' : avgB > avgR && avgB > avgG ? 'cool' : 'neutral';
  const colorTemp = temp === 'warm' ? 3500 + (1 - avgLum / 255) * 2000 :
                    temp === 'cool' ? 7000 + (avgLum / 255) * 2000 : 5500;

  const sorted = buckets.sort((a, b) => b.count - a.count);
  const dominantColors = sorted.slice(0, 5).map(b => ({
    r: b.r, g: b.g, b: b.b,
    name: nearestColorName(b.r, b.g, b.b),
  }));

  const palette = dominantColors.map(c => c.name);

  const avgFaceBright = facePixels > 0 ? faceRegionBright / facePixels : 0;
  const backlit = avgFaceBright < avgLum * 0.6 && avgLum > 30;

  const topLum = Math.max(...histLum);
  const bottomLum = Math.min(...histLum);
  const contrast = topLum - bottomLum;

  const avgHighFreq = highFreqEnergy / pixelCount;
  const sharpness = Math.min(1, avgHighFreq / 50);

  const midIdx = Math.floor(avgLum);
  const lowLightPixels = histLum.slice(0, 60).reduce((a, b) => a + b, 0);
  const highLightPixels = histLum.slice(200).reduce((a, b) => a + b, 0);
  const lowLightRatio = lowLightPixels / pixelCount;
  const highLightRatio = highLightPixels / pixelCount;

  let sceneType = 'indoor';
  if (lowLightRatio > 0.6) sceneType = 'night';
  else if (highLightRatio > 0.4 && avgLum > 150) sceneType = 'outdoor_bright';
  else if (avgLum > 100 && colorTemp > 6000) sceneType = 'outdoor';
  else if (avgLum > 80 && colorTemp < 4500) sceneType = 'indoor_warm';
  else if (colorTemp > 5000 && colorTemp < 6000 && avgLum > 90) sceneType = 'studio';

  const hasFace = facePixels > 0 && avgFaceBright > 30;
  const faceSize = hasFace ? facePixels / pixelCount : 0;

  return {
    averageLuminance: avgLum / 255,
    colorTemperature: Math.round(colorTemp),
    colorPalette: palette,
    estimatedDepth: contrast > 80 ? 'deep' : contrast > 50 ? 'medium' : 'shallow',
    isBacklit: backlit && hasFace,
    hasFace,
    facePosition: hasFace ? { x: centerX / canvas.width, y: centerY / canvas.height } : null,
    faceSize,
    dominantColors,
    contrast: contrast / 255,
    sharpness: Math.round(sharpness * 100) / 100,
    motionDetected: false,
    sceneType,
    confidence: Math.min(85, Math.round(50 + avgLum / 5 + (hasFace ? 15 : 0))),
    timestamp: Date.now(),
  };
}

const SCENE_VARIATIONS = [
  'warm lit interior with soft shadows',
  'bright natural daylight streaming through windows',
  'cool ambient lighting with blue undertones',
  'dramatic side-lit environment with deep shadows',
  'evenly lit space with neutral color temperature',
  'backlit scene with subject in silhouette',
  'low light environment with moody atmosphere',
  'high contrast scene with bright highlights',
  'soft diffused lighting with gentle transitions',
  'mixed lighting with warm and cool sources',
];

const COMPOSITION_TIPS = [
  'Consider the rule of thirds for stronger framing',
  'Watch for leading lines that draw the eye',
  'Check for distracting background elements',
  'Notice how negative space affects the composition',
  'Observe the balance between subject and environment',
  'Look for natural frames within the scene',
  'Examine the depth created by foreground elements',
  'Consider symmetry or asymmetry for visual impact',
  'Notice the rhythm and pattern in the background',
  'Observe how light guides attention through the frame',
];

const POSE_SUGGESTIONS_BY_SCENE: Record<string, string[]> = {
  outdoor_bright: [
    'Face slightly away from direct sunlight to avoid squinting',
    'Use a wide stance with weight on back leg for a relaxed look',
    'Tilt your chin up to catch the light on your face',
    'Let your arms hang naturally with a slight bend at elbows',
    'Turn your body 45 degrees to camera for a slimming effect',
  ],
  indoor_warm: [
    'Lean against a wall or doorway for casual elegance',
    'Sit at the edge of a chair for a more engaged posture',
    'Cross your legs at the ankle for a refined seated pose',
    'Rest one hand on a nearby surface for grounded energy',
    'Angle your shoulders away from the light source',
  ],
  night: [
    'Position yourself near a light source for face illumination',
    'Use a slower stance with weight shifted to back leg',
    'Look toward the light source to catch rim lighting',
    'Keep movements minimal and intentional',
    'Face the strongest light source at a 45 degree angle',
  ],
  studio: [
    'Stand with weight on back leg for a natural S-curve',
    'Extend your neck slightly forward to define the jawline',
    'Roll your shoulders back and down for better posture',
    'Keep hands relaxed with fingers slightly apart',
    'Tilt your head slightly toward the key light',
  ],
  indoor: [
    'Find natural window light and face it at 45 degrees',
    'Use furniture as support for relaxed, candid poses',
    'Keep your back straight but shoulders relaxed',
    'Place hands in pockets with thumbs visible for casual look',
    'Lean slightly forward from the hips for engagement',
  ],
  outdoor: [
    'Let the environment inspire your movement and posture',
    'Use the horizon line as a reference for straight posture',
    'Incorporate natural elements like trees or walls for support',
    'Walk naturally and pause for candid-feeling shots',
    'Look away from the camera for environmental portraits',
  ],
};

const DEFAULT_POSE_TIPS = [
  'Relax your shoulders and take a deep breath before each frame',
  'Keep a soft bend in your elbows to avoid stiffness',
  'Shift your weight to one leg for a more natural stance',
  'Imagine a string pulling you up from the crown of your head',
  'Let your hands rest naturally rather than clenching',
  'Soften your gaze and blink naturally between shots',
  'Angle your body slightly to create depth in the frame',
  'Keep your chin slightly forward to define your jawline',
  'Relax your jaw and part your lips slightly for a natural look',
  'Roll your shoulders back before each shot for better posture',
];

export function useVisionPipeline() {
  const { videoRef, canvasRef, isCameraReady } = useCameraContext();
  const [sceneAnalysis, setSceneAnalysis] = useState<SceneAnalysis | null>(null);
  const analysisIntervalRef = useRef<number>(0);
  const lastFrameRef = useRef<SceneAnalysis | null>(null);
  const variationIdx = useRef(0);

  useEffect(() => {
    if (!isCameraReady || !videoRef.current || !canvasRef.current) return;

    const doAnalysis = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) return;

      const result = sampleFrame(video, canvas);
      if (result) {
        result.motionDetected = lastFrameRef.current
          ? Math.abs(result.averageLuminance - lastFrameRef.current.averageLuminance) > 0.08
          : false;
        lastFrameRef.current = result;
        variationIdx.current = (variationIdx.current + 1) % 100;
        setSceneAnalysis(result);

        const memStore = useMemoryStore.getState();
        if (result.hasFace) {
          memStore.addMemory({
            type: 'lighting',
            value: result.sceneType,
            score: 1,
            context: `luminance:${Math.round(result.averageLuminance * 100)}, temp:${result.colorTemperature}`,
          });
        }
      }
    };

    doAnalysis();
    analysisIntervalRef.current = window.setInterval(doAnalysis, 2000);

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isCameraReady, videoRef, canvasRef]);

  const getSceneDescription = useCallback((analysis?: SceneAnalysis | null): string => {
    const a = analysis || lastFrameRef.current;
    if (!a) return 'Camera feed not available. Waiting for video input...';

    const variationIdx = Math.floor((a.timestamp / 1000) % SCENE_VARIATIONS.length);
    const base = SCENE_VARIATIONS[(variationIdx + a.dominantColors.length) % SCENE_VARIATIONS.length];

    const parts: string[] = [base];

    if (a.hasFace) {
      const faceText = a.isBacklit
        ? 'Subject detected in backlit position — face is shadowed'
        : a.faceSize > 0.15
          ? 'Subject fills frame — close proximity detected'
          : 'Subject detected in mid-range';
      parts.push(faceText);
    } else {
      parts.push('No face detected — frame may be empty or subject is not visible');
    }

    if (a.dominantColors.length > 0) {
      parts.push(`Dominant colors: ${a.dominantColors.slice(0, 3).map(c => c.name).join(', ')}`);
    }

    if (a.sharpness < 0.3) {
      parts.push('Image appears soft or blurry — check focus');
    }

    return parts.join('. ');
  }, []);

  const getCompositionTip = useCallback((analysis?: SceneAnalysis | null): string => {
    const a = analysis || lastFrameRef.current;
    if (!a) return 'Waiting for camera feed to analyze composition.';

    const idx = (a.estimatedDepth === 'shallow' ? 0 : a.estimatedDepth === 'medium' ? 3 : 6) +
      Math.floor((a.contrast * 10) % 3);
    const base = COMPOSITION_TIPS[idx % COMPOSITION_TIPS.length];

    const specificTips: string[] = [base];
    if (a.contrast > 0.7) specificTips.push('High contrast scene — watch for blown highlights');
    else if (a.contrast < 0.3) specificTips.push('Low contrast scene — consider adding depth with foreground elements');

    if (a.averageLuminance < 0.25) specificTips.push('Low light environment — camera may need stabilization');
    else if (a.averageLuminance > 0.8) specificTips.push('Very bright scene — check for overexposure');

    return specificTips.join('. ');
  }, []);

  const getPoseSuggestion = useCallback((analysis?: SceneAnalysis | null): string[] => {
    const a = analysis || lastFrameRef.current;
    if (!a) return ['Waiting for camera feed to analyze scene for pose suggestions.'];

    const sceneType = a.sceneType;
    const suggestions = POSE_SUGGESTIONS_BY_SCENE[sceneType] || DEFAULT_POSE_TIPS;

    const shuffled = [...suggestions];
    const seed = Math.floor(a.timestamp / 2000) % shuffled.length;
    for (let i = 0; i < 3; i++) {
      const j = (seed + i * 3) % shuffled.length;
      if (i !== j) {
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }

    const memStore = useMemoryStore.getState();
    const prefPoses = memStore.getTopPreferences('pose', 2);
    const prefPoseValues = prefPoses.map(p => p.value);

    return [
      ...shuffled.slice(0, 2),
      ...(prefPoseValues.length > 0
        ? [`Based on your history: ${prefPoseValues.join(', ')} style works well in similar scenes`]
        : []),
    ];
  }, []);

  return {
    sceneAnalysis,
    lastAnalysis: lastFrameRef.current,
    getSceneDescription,
    getCompositionTip,
    getPoseSuggestion,
    captureAndAnalyze: sampleFrame,
  };
}
