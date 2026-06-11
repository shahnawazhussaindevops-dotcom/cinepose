import type { CineGPTResponse, LocationType, MoodType } from './types';

interface KnowledgeEntry {
  patterns: RegExp[];
  response: (input: string, context?: any) => string;
  suggestions: string[];
}

export class CineGPTEngine {
  private knowledge: KnowledgeEntry[] = [
    {
      patterns: [/pose|how should (i|I) (stand|pose)/i, /best pose/i, /what pose/i],
      response: (input, ctx) => {
        const loc = ctx?.location || 'this location';
        const mood = ctx?.mood || 'natural';
        return `For ${loc} with a ${mood} mood, try: stand with your weight on your back leg, shoulders relaxed, and chin slightly down. Turn your body 45° to the camera for a slimming, dynamic silhouette. If you want ${mood}, soften your gaze and breathe slowly.`;
      },
      suggestions: ['Best pose for beach sunset?', 'How should I stand in this location?', 'Pose for portrait photography'],
    },
    {
      patterns: [/outfit|wear|clothing|dress/i, /what should (i|I) wear/i, /best outfit/i],
      response: (input, ctx) => {
        const loc = ctx?.location || 'your location';
        if (loc === 'beach') return 'For the beach: white linen shirt, cream shorts, straw hat, leather sandals. Light fabrics and neutral tones create effortless coastal luxury.';
        if (loc === 'mountain') return 'For the mountains: earth-tone jacket, dark jeans, beanie, hiking boots. Layers add visual depth and practical warmth.';
        if (loc === 'luxury_property' || loc === 'rooftop') return 'For luxury settings: black suit or evening gown. Gold accessories. Statement watch. High-contrast monochrome reads as premium.';
        if (loc === 'city' || loc === 'street') return 'For urban settings: tailored blazer or oversized jacket, neutral tones, clean sneakers. Urban sophistication with comfort.';
        return 'Classic piece in solid colors. Black, white, or navy works everywhere. Minimal accessories keep the focus on you.';
      },
      suggestions: ['What outfit fits this location?', 'Best colors for beach photos', 'What shoes to wear for photoshoot'],
    },
    {
      patterns: [/lighting|light/i, /how (do|should) (i|I) use light/i, /best time/i, /golden hour/i],
      response: (input, ctx) => {
        return 'Golden hour (sunrise/sunset) gives you warm, soft directional light — the most flattering for portraits. Blue hour (twilight) gives cool, moody tones. Avoid harsh midday sun (11am-2pm). If shooting midday, find open shade or use a diffuser. For backlight, expose for the face (+1EV) and let the rim light create separation. Side lighting creates dramatic depth — position your subject 45° to the light source.';
      },
      suggestions: ['Best time to shoot outdoors?', 'How to use golden hour light?', 'Photography lighting tips'],
    },
    {
      patterns: [/camera angle|angle|where should (i|I) put the camera/i, /how to frame/i, /composition/i],
      response: (input, ctx) => {
        const loc = ctx?.location || 'the scene';
        return `For ${loc}: Eye level (1.2m) creates intimate connection. Low angle makes subjects look powerful and heroic. High angle adds vulnerability. If the background has strong lines (horizons, architecture), use the rule of thirds — place your subject off-center. Leading lines draw the eye: roads, railings, shorelines all work. Frame within a frame using doors, windows, or arches for depth.`;
      },
      suggestions: ['Best camera angle for portraits?', 'How to compose a shot?', 'Rule of thirds explained'],
    },
    {
      patterns: [/reel|video|record|film/i, /how (do|should) (i|I) (record|shoot|film)/i],
      response: (input, ctx) => {
        const loc = ctx?.location || 'this location';
        const mood = ctx?.mood || 'cinematic';
        return `For a ${mood} reel at ${loc}: Start with a wide establishing shot (3s). Then cut to your subject walking into frame (2s). Medium shot of subject interacting with environment (3s). Close-up of expression or detail (2s). End with a wide walking-away shot (3s). Use slow motion at 60fps for walking shots. Add a gentle color grade — warm tones for ${mood}. Music suggestion: ${this.getMusicForMood(mood)}.`;
      },
      suggestions: ['How should I record a travel reel here?', 'Best video settings for cinematic footage', 'How to shoot Instagram Reels'],
    },
    {
      patterns: [/color|grade|edit|lut|filter/i, /how (do|should) (i|I) edit/i],
      response: (input, ctx) => {
        return 'For cinematic color grading: Start with exposure correction, then set white balance. Lift your shadows slightly (+0.05-0.10) for that modern film look. Add a subtle teal-orange split: warm highlights (3200K), cool shadows (6500K). Reduce saturation on skin tones slightly, boost on environment colors. For Instagram: +0.10 warmth, +0.05 contrast, -0.10 highlights, +0.15 shadows. Use CinePose\'s LUT engine for instant cinema-grade color.';
      },
      suggestions: ['Color grading tips for beginners', 'Best LUT for sunset photos', 'How to edit like a movie'],
    },
    {
      patterns: [/expression|face|smile|look/i, /how (do|should) (i|I) (look|express)/i],
      response: (input, ctx) => {
        const mood = ctx?.mood || 'natural';
        if (mood === 'romantic' || mood === 'dreamy') return 'For a dreamy look: Soft gaze slightly past the camera. Lips gently parted. Think of something that makes you happy. Let your eyes soften — squint slightly for a mysterious, confident look.';
        if (mood === 'confident' || mood === 'bold') return 'For confidence: Chin slightly raised. Direct eye contact. Think "I own this moment." A slight smirk (one side of mouth) reads as confident without being aggressive.';
        if (mood === 'happy') return 'For genuine happiness: Think of something funny. Let the smile reach your eyes — if your eyes don\'t crinkle, the smile looks fake. Laugh naturally right before the shot.';
        return 'For natural expression: Relax your jaw. Take a deep breath and exhale slowly right before the shot — this relaxes your entire face. Think of a happy memory. Soft eyes, gentle smile.';
      },
      suggestions: ['How to look natural in photos?', 'Best facial expression for photos?', 'How to smile naturally?'],
    },
  ];

  ask(question: string, context?: { location?: string; mood?: string; goldenHour?: boolean }): CineGPTResponse {
    const matched = this.knowledge.find(entry =>
      entry.patterns.some(p => p.test(question))
    );

    if (matched) {
      return {
        answer: matched.response(question, context),
        suggestions: matched.suggestions,
        confidence: 85 + Math.floor(Math.random() * 10),
      };
    }

    return {
      answer: `Great question about "${question.slice(0, 50)}..." Here's what I recommend: The key to great photos is preparation — check your lighting (golden hour is best), compose using the rule of thirds, and keep your subject relaxed. For specific advice, try asking about poses, outfits, lighting, camera angles, or color grading.`,
      suggestions: [
        'Best pose for photos?',
        'What outfit should I wear?',
        'How to use natural lighting?',
        'Tips for video reels',
        'Color grading advice',
      ],
      confidence: 70,
    };
  }

  private getMusicForMood(mood: string): string {
    const map: Record<string, string> = {
      romantic: 'Soft acoustic guitar or piano',
      adventure: 'Epic orchestral or indie folk',
      luxury: 'Lo-fi hip hop or jazz fusion',
      cinematic: 'Cinematic synth or orchestral score',
      energetic: 'Upbeat pop or dance',
      dreamy: 'Dream pop or ambient vocal',
      mysterious: 'Dark ambient or trip hop',
    };
    return map[mood] || 'Ambient electronic';
  }

  getBestPoseForLocation(location: string): string {
    if (location === 'beach') return 'Walk along the shore, let the water lap at your feet. Look back over your shoulder at the camera.';
    if (location === 'mountain') return 'Stand on a high point, arms slightly open, looking at the vast view. Profile silhouette works beautifully.';
    if (location === 'city') return 'Lean against a building, one hand in pocket, looking casually at the camera or away.';
    if (location === 'cafe') return 'Sit by the window, hold your coffee cup with both hands, look down or out the window.';
    if (location === 'rooftop') return 'Stand at the edge, looking out at the skyline. Backlit sunset creates magical rim light.';
    return 'Stand naturally with your weight on one leg, relaxed shoulders, and a genuine expression.';
  }

  getColorAdvice(scene: string): string {
    if (scene === 'sunset') return 'Warm teal-orange grade. Lift shadows to +0.08, warm highlights to 4500K. Use CinePose "Golden Hour" LUT.';
    if (scene === 'portrait') return 'Soft neutral grade. Skin tone priority. Reduce saturation on greens, warm up skin tones slightly.';
    if (scene === 'night') return 'Keep blacks deep. Cool shadows at 6500K. Reduce noise. Use "Night" or "Moody" LUT.';
    if (scene === 'travel') return 'Vibrant grade. Boost blues and greens. Warm highlights. Use "Travel" or "Vibrant" LUT.';
    return 'Balanced cinematic grade. Slight teal-orange split, lifted shadows, warm mids.';
  }
}

export const cineGPT = new CineGPTEngine();
