import type { MoodResult, MoodType } from './types';

export class MoodDetectionEngine {
  detect(
    luminance: number,
    temperature: number,
    isGoldenHour: boolean,
    isBacklit: boolean,
    tiltAngle: number
  ): MoodResult {
    let primary: MoodType = 'calm';
    const secondary: MoodType[] = [];

    if (isGoldenHour) {
      primary = 'romantic';
      secondary.push('dreamy', 'cinematic');
    } else if (isBacklit) {
      primary = 'dramatic';
      secondary.push('mysterious', 'cinematic');
    } else if (luminance > 0.7 && temperature > 6000) {
      primary = 'energetic';
      secondary.push('happy', 'confident');
    } else if (luminance > 0.5 && temperature < 5000) {
      primary = 'calm';
      secondary.push('professional', 'soft');
    } else if (luminance < 0.3 && temperature < 3500) {
      primary = 'mysterious';
      secondary.push('moody', 'nostalgic');
    } else if (luminance < 0.2) {
      primary = 'edgy';
      secondary.push('dramatic', 'bold');
    } else if (temperature > 6500) {
      primary = 'minimal';
      secondary.push('calm', 'professional');
    } else {
      primary = 'happy';
      secondary.push('confident', 'natural');
    }

    const confidence = Math.min(90, Math.round(65 + Math.random() * 25));

    return {
      primary,
      secondary,
      confidence,
      expression: this.getExpression(primary),
      bodyLanguage: this.getBodyLanguage(primary),
      adaptivePose: this.getAdaptivePose(primary),
      adaptiveDirection: this.getAdaptiveDirection(primary),
    };
  }

  private getExpression(mood: MoodType): string {
    const map: Record<MoodType, string> = {
      luxury: 'Subtle, confident smirk. Relaxed jaw, half-lidded eyes.',
      adventure: 'Wide-eyed excitement. Genuine smile, eyebrows raised.',
      romantic: 'Soft, dreamy gaze. Gentle smile, relaxed lips.',
      happy: 'Full genuine smile. Eyes crinkling at corners.', 
      confident: 'Direct eye contact. Slight smirk, chin slightly raised.',
      professional: 'Neutral, composed expression. Straight face with soft eyes.',
      calm: 'Peaceful expression. Slight smile, soft eyes looking into distance.',
      energetic: 'Big smile, animated face. Open expression.',
      dreamy: 'Soft focus gaze. Looking slightly past camera, lips parted.',
      cinematic: 'Intense, moody expression. Serious but not aggressive.',
      mysterious: 'Half-smile. Looking away from camera, slightly down.',
      edgy: 'Bold, direct stare. Slight frown, jaw tight.',
      vintage: 'Classic Hollywood smile. Slightly posed, timeless.',
      minimal: 'Blank but not bored expression. Neutral, clean.',
      bold: 'Strong eye contact. Confident, almost challenging.',
      soft: 'Gentle, yielding expression. Warm eyes, soft smile.',
      dramatic: 'Intense gaze. Enhanced shadows on face for depth.',
      nostalgic: 'Wistful look. Slightly sad smile, distant eyes.',
    };
    return map[mood] || 'Natural, relaxed expression with soft eyes.';
  }

  private getBodyLanguage(mood: MoodType): string {
    const map: Record<MoodType, string> = {
      luxury: 'Elegant, refined posture. Controlled, deliberate movements.',
      adventure: 'Open, dynamic posture. Body angled forward, engaged.',
      romantic: 'Soft, curved posture. Shoulders relaxed, slight lean.',
      happy: 'Open, approachable body language. Arms relaxed or open.',
      confident: 'Expansive posture. Shoulders back, chest slightly out.',
      professional: 'Straight, aligned posture. Minimal movement.',
      calm: 'Relaxed, grounded posture. Even weight distribution.',
      energetic: 'Dynamic, active posture. Body in motion or poised to move.',
      dreamy: 'Loose, flowing body language. Gentle sways and shifts.',
      cinematic: 'Strong, intentional poses. Each limb placed with purpose.',
      mysterious: 'Enclosed body language. Partial turns, hidden hands.',
      edgy: 'Angular, sharp poses. Asymmetrical weight distribution.',
      vintage: 'Posed but natural. Classic Hollywood elegance.',
      minimal: 'Clean, simple lines. Minimal angularity.',
      bold: 'Assertive, occupying space. Grounded wide stance.',
      soft: 'Curled, gentle postures. Intimate, vulnerable.',
      dramatic: 'Strong diagonals. Sharp angles in limbs and posture.',
      nostalgic: 'Closed, contemplative. Arms folded or hands touching face.',
    };
    return map[mood] || 'Natural, relaxed posture with balanced weight.';
  }

  private getAdaptivePose(mood: MoodType): string {
    const map: Record<MoodType, string> = {
      luxury: 'Standing tall, one hand in pocket, looking away',
      adventure: 'Walking toward camera, looking at surroundings',
      romantic: 'Leaning against wall or rail, soft gaze to side',
      happy: 'Arms open, genuine laugh, head slightly back',
      confident: 'Power stance, hands on hips, direct eye contact',
      professional: 'Standing straight, hands clasped in front',
      calm: 'Sitting or standing, looking into distance peacefully',
      energetic: 'Mid-stride or jumping, active body angle',
      dreamy: 'Looking up, touching hair or face gently',
      cinematic: 'Walking slowly, looking over shoulder',
      mysterious: 'Half-turn, looking back at camera over shoulder',
      edgy: 'Leaning back, arms crossed, direct stare',
      vintage: 'Classic pin-up or old Hollywood pose',
      minimal: 'Standing straight, arms at sides, simple',
      bold: 'Standing with hand on hip, direct confident look',
      soft: 'Curled sitting pose, arms wrapped around knees',
      dramatic: 'Diagonal body angle, one arm reaching out',
      nostalgic: 'Looking at old photo or touching a keepsake',
    };
    return map[mood] || 'Natural standing pose, relaxed and authentic';
  }

  private getAdaptiveDirection(mood: MoodType): string {
    const map: Record<MoodType, string> = {
      luxury: 'Slow, deliberate movements. Extended holds on poses.',
      adventure: 'Energetic movement. Explore the space around you.',
      romantic: 'Soft, flowing movements. Pause and breathe often.',
      happy: 'Lively, spontaneous. Move naturally and laugh.',
      confident: 'Strong, grounded movements. Own the space.',
      professional: 'Measured, controlled. Each movement intentional.',
      calm: 'Slow, meditative pace. Minimal, gentle transitions.',
      energetic: 'Quick, dynamic movements. Don\'t hold still long.',
      dreamy: 'Floating, soft movements. Slow motion quality.',
      cinematic: 'Deliberate, dramatic movements. Hold and release.',
      mysterious: 'Slow, subtle movements. Maintain the mystery.',
      edgy: 'Sharp, quick movements. Angular transitions.',
      vintage: 'Classic, controlled movements. Timeless grace.',
      minimal: 'Clean, precise movements. No wasted motion.',
      bold: 'Big, expansive movements. Command attention.',
      soft: 'Gentle, yielding movements. Intimate and tender.',
      dramatic: 'Exaggerated, theatrical movements. Big energy.',
      nostalgic: 'Slow, reflective movements. Touch objects gently.',
    };
    return map[mood] || 'Natural, authentic movement. Be yourself.';
  }
}

export const moodDetection = new MoodDetectionEngine();
