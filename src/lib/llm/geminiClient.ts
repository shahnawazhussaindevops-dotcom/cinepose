import type { AIDirectorResponse, LLMContext, LLMCacheEntry } from './types';

const CACHE_TTL = 30_000;
const MIN_CALL_INTERVAL = 2_000;

let cache: Map<string, LLMCacheEntry> = new Map();
let lastCallTime = 0;

function makeCacheKey(ctx: LLMContext): string {
  const scene = ctx.scene;
  return [
    Math.round(scene.luminance * 10),
    Math.round(scene.temperature / 100),
    scene.isGoldenHour,
    scene.isBacklit,
    Math.round(scene.tiltAngle / 5),
    scene.locationType,
    ctx.user.selectedStyle,
    ctx.user.selectedGender,
    ctx.activeAgents.sort().join(','),
  ].join('|');
}

export async function queryGeminiDirector(ctx: LLMContext): Promise<AIDirectorResponse | null> {
  const key = makeCacheKey(ctx);
  const now = Date.now();

  const cached = cache.get(key);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.response;
  }

  if (now - lastCallTime < MIN_CALL_INTERVAL) {
    return null;
  }
  lastCallTime = now;

  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scene: ctx.scene,
        user: ctx.user,
        activeAgents: ctx.activeAgents,
        timestamp: now,
      }),
    });

    if (!res.ok) {
      console.warn('Gemini API returned', res.status);
      return null;
    }

    const data: AIDirectorResponse = await res.json();

    cache.set(key, { key, response: data, timestamp: now });

    return data;
  } catch (err) {
    console.warn('Gemini API call failed:', err);
    return null;
  }
}

export function clearLLMCache() {
  cache = new Map();
}

export function getLLMCacheSize(): number {
  return cache.size;
}
