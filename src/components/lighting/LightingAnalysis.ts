import type { LightingData, LightingCondition } from '../../lib/types';

interface ZoneReading {
  averageLuminance: number;
  dominantColor: [number, number, number];
  shadowCount: number;
  highlightCount: number;
}

export function analyzeFrameLighting(
  imageData: ImageData
): LightingData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const totalPixels = width * height;

  const zones = getZoneReadings(imageData);
  const averageLuminance = zones.reduce((s, z) => s + z.averageLuminance, 0) / zones.length;

  let shadowClip = 0;
  let highlightClip = 0;
  let totalR = 0, totalG = 0, totalB = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

    if (brightness < 0.05) shadowClip++;
    if (brightness > 0.95) highlightClip++;

    totalR += r;
    totalG += g;
    totalB += b;
  }

  const avgR = totalR / totalPixels;
  const avgG = totalG / totalPixels;
  const avgB = totalB / totalPixels;

  const colorTemperature = estimateColorTemperature(avgR, avgG, avgB);

  const histogramSpread = calculateHistogramSpread(data, totalPixels);

  const condition = classifyLighting(
    averageLuminance,
    colorTemperature,
    shadowClip / totalPixels,
    highlightClip / totalPixels,
    zones
  );

  return {
    condition,
    averageLuminance,
    colorTemperature,
    shadowClip: shadowClip / totalPixels,
    highlightClip: highlightClip / totalPixels,
    histogramSpread,
    suggestion: getLightingSuggestion(condition, averageLuminance),
  };
}

function getZoneReadings(imageData: ImageData): ZoneReading[] {
  const { width, height, data } = imageData;
  const zones: ZoneReading[] = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const xStart = Math.floor((col / 3) * width);
      const xEnd = Math.floor(((col + 1) / 3) * width);
      const yStart = Math.floor((row / 3) * height);
      const yEnd = Math.floor(((row + 1) / 3) * height);

      let sumBrightness = 0;
      let totalR = 0, totalG = 0, totalB = 0;
      let pixels = 0;
      let shadowCount = 0;
      let highlightCount = 0;

      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

          sumBrightness += brightness;
          totalR += r; totalG += g; totalB += b;
          pixels++;

          if (brightness < 0.05) shadowCount++;
          if (brightness > 0.95) highlightCount++;
        }
      }

      zones.push({
        averageLuminance: sumBrightness / pixels,
        dominantColor: [totalR / pixels / 255, totalG / pixels / 255, totalB / pixels / 255],
        shadowCount,
        highlightCount,
      });
    }
  }

  return zones;
}

function estimateColorTemperature(avgR: number, avgG: number, avgB: number): number {
  const rRatio = avgR / (avgR + avgG + avgB + 0.001);
  const bRatio = avgB / (avgR + avgG + avgB + 0.001);

  if (rRatio > 0.4) return 3500;
  if (bRatio > 0.38) return 7500;
  if (Math.abs(rRatio - bRatio) < 0.02) return 5500;
  return rRatio > bRatio ? 4500 : 6500;
}

function calculateHistogramSpread(
  data: Uint8ClampedArray,
  totalPixels: number
): number {
  const bins = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const brightness = Math.round(
      (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
    );
    bins[brightness]++;
  }

  let minBin = 255, maxBin = 0;
  const threshold = totalPixels * 0.01;

  for (let i = 0; i < 256; i++) {
    if (bins[i] > threshold) {
      minBin = Math.min(minBin, i);
      maxBin = Math.max(maxBin, i);
    }
  }

  return (maxBin - minBin) / 255;
}

function classifyLighting(
  luminance: number,
  temperature: number,
  shadowRatio: number,
  highlightRatio: number,
  zones: ZoneReading[]
): LightingCondition {
  const centerZone = zones[4];
  const topAvg = (zones[0].averageLuminance + zones[1].averageLuminance + zones[2].averageLuminance) / 3;
  const bottomAvg = (zones[6].averageLuminance + zones[7].averageLuminance + zones[8].averageLuminance) / 3;

  const backlit = bottomAvg > topAvg * 1.5;
  const sidelit = Math.abs(zones[2].averageLuminance - zones[0].averageLuminance) > 0.3 ||
                  Math.abs(zones[6].averageLuminance - zones[8].averageLuminance) > 0.3;

  if (backlit && luminance < 0.5) return 'backlit';
  if (sidelit && luminance > 0.4) return 'side_lit';
  if (!backlit && !sidelit && luminance > 0.35) return 'front_lit';

  if (luminance > 0.7 && temperature > 6000) return 'harsh_midday';
  if (luminance > 0.5 && temperature < 4200) return 'golden_hour';
  if (luminance > 0.3 && luminance < 0.6 && temperature > 6500) return 'blue_hour';
  if (luminance < 0.3 && temperature < 4500) return 'indoor_tungsten';
  if (luminance < 0.3 && temperature > 5500) return 'indoor_fluorescent';
  if (luminance > 0.3 && luminance < 0.6 && temperature > 5000 && temperature < 6500) return 'overcast';
  if (luminance < 0.3) return 'indoor_low_light';

  return 'bright_daylight';
}

function getLightingSuggestion(
  condition: LightingCondition,
  luminance: number
): string {
  switch (condition) {
    case 'golden_hour':
      return 'Golden light — warm portraits. Turn 15° into the light.';
    case 'blue_hour':
      return 'Cool tones — silhouette shots work well now.';
    case 'harsh_midday':
      return 'Harsh shadows — seek open shade or use diffusion.';
    case 'backlit':
      return 'Backlit — expose for the subject\'s face. Try rim light portraits.';
    case 'side_lit':
      return 'Side-lit — dramatic shadows. Try a ¾ angle.';
    case 'front_lit':
      return 'Front-lit — even exposure, classic portraits.';
    case 'overcast':
      return 'Softbox sky — perfect for portraits, even skin tones.';
    case 'indoor_tungsten':
      return 'Warm indoor light — set white balance to 3200K.';
    case 'indoor_fluorescent':
      return 'Fluorescent — green cast. Use magenta tint correction.';
    case 'indoor_low_light':
      return 'Low light — steady hands or tripod recommended.';
    default:
      return 'Good lighting — you\'re ready to shoot.';
  }
}
