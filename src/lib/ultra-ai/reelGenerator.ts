import type { ReelPlan, LocationType, MoodType } from './types';

export class AIReelGeneratorEngine {
  generate(location: LocationType, mood: MoodType, isGoldenHour: boolean): ReelPlan {
    const format = this.pickFormat(location, mood);
    return {
      shotSequence: this.generateShotSequence(location, mood, isGoldenHour),
      musicSuggestions: this.getMusicSuggestions(mood),
      transitions: this.getTransitions(mood),
      textOverlays: this.getTextOverlays(mood),
      colorGrading: this.getColorGrading(isGoldenHour, mood),
      duration: 15 + Math.floor(Math.random() * 15),
      format,
      estimatedEngagement: Math.floor(70 + Math.random() * 25),
    };
  }

  private pickFormat(location: LocationType, mood: MoodType): ReelPlan['format'] {
    if (mood === 'luxury' || mood === 'cinematic') return 'luxury_content';
    if (mood === 'adventure' || location === 'mountain') return 'travel_vlog';
    if (mood === 'romantic' || mood === 'dreamy') return 'youtube_shorts';
    if (mood === 'energetic' || mood === 'happy') return 'tiktok';
    if (mood === 'professional') return 'facebook_reels';
    return 'instagram_reels';
  }

  private generateShotSequence(location: LocationType, mood: MoodType, golden: boolean): string[] {
    const shots: string[] = [];
    shots.push(golden ? 'Wide establishing shot of golden hour scene' : 'Wide establishing shot of location');
    shots.push(`Subject walking into frame, ${mood} expression`);
    shots.push('Medium shot — subject interacts with environment');
    shots.push('Close-up — facial expression detail');
    shots.push(golden ? 'Backlit silhouette shot against golden sky' : 'Detail shot — hands, accessories, or elements');
    shots.push('Wide walking away shot — cinematic exit');
    return shots;
  }

  private getMusicSuggestions(mood: MoodType): string[] {
    const map: Record<MoodType, string[]> = {
      luxury: ['Lo-fi hip hop', 'Jazz fusion', 'Ambient electronic'],
      adventure: ['Epic orchestral', 'Indie folk rock', 'Cinematic drums'],
      romantic: ['Acoustic guitar', 'Piano ballads', 'Soft R&B'],
      happy: ['Upbeat pop', 'Reggaeton', 'Feel-good indie'],
      confident: ['Hip hop beats', 'Electronic pop', 'R&B groove'],
      professional: ['Ambient electronic', 'Minimal techno', 'Classical piano'],
      calm: ['Ambient soundscape', 'Soft piano', 'Nature sounds'],
      energetic: ['EDM', 'Dance pop', 'Rock anthem'],
      dreamy: ['Dream pop', 'Shoegaze', 'Ambient vocal'],
      cinematic: ['Orchestral score', 'Cinematic synth', 'Epic trailer'],
      mysterious: ['Dark ambient', 'Trip hop', 'Minimal synth'],
      edgy: ['Industrial', 'Dark synth', 'Alternative rock'],
      vintage: ['Swing jazz', 'Classic soul', 'Vinyl crackle'],
      minimal: ['Ambient drone', 'Minimal piano', 'Field recordings'],
      bold: ['Trap beats', 'Bass heavy', 'Orchestral hits'],
      soft: ['Folk acoustic', 'Soft vocal', 'Ambient guitar'],
      dramatic: ['Cinematic strings', 'Epic choir', 'Intense percussion'],
      nostalgic: ['Lo-fi beats', 'Vintage synth', 'Acoustic covers'],
    };
    return map[mood] || ['Ambient electronic', 'Lo-fi beats'];
  }

  private getTransitions(mood: MoodType): string[] {
    const base = ['Cross dissolve', 'Fade to black', 'Whip pan'];
    if (mood === 'energetic' || mood === 'bold') return [...base, 'Quick cut', 'Glitch effect', 'Zoom transition'];
    if (mood === 'dreamy' || mood === 'romantic') return ['Cross dissolve', 'Fade to white', 'Light leak', 'Soft blur'];
    if (mood === 'mysterious' || mood === 'edgy') return ['Whip pan', 'Quick cut', 'Black flash', 'Film burn'];
    return base;
  }

  private getTextOverlays(mood: MoodType): string[] {
    const map: Record<string, string[]> = {
      luxury: ['Timeless elegance', 'Live beautifully', 'Every moment matters'],
      adventure: ['Explore more', 'Find your path', 'The journey begins'],
      romantic: ['Love is in the air', 'Golden moments', 'Capture the heart'],
      happy: ['Good vibes only', 'Living my best life', 'Pure joy'],
      dreamy: ['Dream big', 'In another world', 'Lost in thought'],
      cinematic: ['A film by...', 'Every frame a painting', 'Cinematic life'],
      professional: ['Success mindset', 'Focus on the goal', 'Peak performance'],
    };
    return map[mood] || ['This is me', 'Live in the moment', 'Be yourself'];
  }

  private getColorGrading(golden: boolean, mood: MoodType): string {
    if (golden) return 'Teal-orange blockbuster grade. Warm highlights (3200K), cool shadows. Lift +0.05, Gamma warm shift, Gain slight desaturate.';
    if (mood === 'mysterious' || mood === 'edgy') return 'Desaturated with crushed blacks. High contrast. Split tone: shadows blue (#1a2a3a), highlights warm (#d4a050).';
    if (mood === 'romantic' || mood === 'dreamy') return 'Soft pastel grade. Lifted blacks, reduced contrast. Warm tint +0.10, soft highlights with glow.';
    if (mood === 'energetic' || mood === 'happy') return 'Bright, punchy grade. Enhanced saturation, warm cast. Vibrant greens and skin tones.';
    if (mood === 'luxury') return 'Rich, deep grade. Warm mids, cool shadows. Increased saturation for colors, reduced for skin.';
    return 'Neutral cinematic grade. Slight warmth, balanced contrast, natural skin tones.';
  }
}

export const aiReelGenerator = new AIReelGeneratorEngine();
