import type { MoodResult, MoodType } from './types';

const MOOD_EXPRESSIONS: Record<MoodType, { expression: string; bodyLanguage: string; pose: string; direction: string }[]> = {
  luxury: [
    { expression: 'Subtle, confident smirk. Relaxed jaw, half-lidded eyes.', bodyLanguage: 'Elegant, refined posture. Controlled, deliberate movements.', pose: 'Standing tall, one hand in pocket, looking away', direction: 'Slow, deliberate movements. Extended holds on poses.' },
    { expression: 'Sophisticated half-smile. Eyes slightly narrowed, chin raised.', bodyLanguage: 'Poised and graceful. Each movement measured and intentional.', pose: 'Leaning against a surface with crossed ankles', direction: 'Move like you own the space — slow and commanding.' },
  ],
  adventure: [
    { expression: 'Wide-eyed excitement. Genuine smile, eyebrows raised.', bodyLanguage: 'Open, dynamic posture. Body angled forward, engaged.', pose: 'Walking toward camera, looking at surroundings', direction: 'Energetic movement. Explore the space around you.' },
    { expression: 'Curious, engaged expression. Slight wonder in the eyes.', bodyLanguage: 'Restless energy, shifting weight, ready to move.', pose: 'Looking up and around as if discovering something', direction: 'Move through the scene like you are seeing it for the first time.' },
  ],
  romantic: [
    { expression: 'Soft, dreamy gaze. Gentle smile, relaxed lips.', bodyLanguage: 'Soft, curved posture. Shoulders relaxed, slight lean.', pose: 'Leaning against wall or rail, soft gaze to side', direction: 'Soft, flowing movements. Pause and breathe often.' },
    { expression: 'Warm, intimate look. Eyes slightly heavy-lidded.', bodyLanguage: 'Open and vulnerable. Arms slightly away from body.', pose: 'Looking down then slowly up at the camera', direction: 'Slow, tender movements. Let each gesture linger.' },
  ],
  happy: [
    { expression: 'Full genuine smile. Eyes crinkling at corners.', bodyLanguage: 'Open, approachable body language. Arms relaxed or open.', pose: 'Arms open, genuine laugh, head slightly back', direction: 'Lively, spontaneous. Move naturally and laugh.' },
    { expression: 'Radiant, natural smile. Light in the eyes.', bodyLanguage: 'Bouncy, energetic posture. Light on the feet.', pose: 'Mid-laugh or mid-sentence candid moment', direction: 'Stay in motion — happiness reads best in movement.' },
  ],
  confident: [
    { expression: 'Direct eye contact. Slight smirk, chin slightly raised.', bodyLanguage: 'Expansive posture. Shoulders back, chest slightly out.', pose: 'Power stance, hands on hips, direct eye contact', direction: 'Strong, grounded movements. Own the space.' },
    { expression: 'Bold, unwavering gaze. Commanding presence.', bodyLanguage: 'Occupying space. Wide stance, grounded energy.', pose: 'Hands in pockets with thumbs out, chin up', direction: 'Walk with purpose. Pause and hold eye contact.' },
  ],
  professional: [
    { expression: 'Neutral, composed expression. Straight face with soft eyes.', bodyLanguage: 'Straight, aligned posture. Minimal movement.', pose: 'Standing straight, hands clasped in front', direction: 'Measured, controlled. Each movement intentional.' },
    { expression: 'Approachable but authoritative. Warm but serious.', bodyLanguage: 'Square shoulders, balanced weight. Minimal fidgeting.', pose: 'Sitting upright with hands on table or crossed legs', direction: 'Clean, professional transitions. No wasted movement.' },
  ],
  calm: [
    { expression: 'Peaceful expression. Slight smile, soft eyes looking into distance.', bodyLanguage: 'Relaxed, grounded posture. Even weight distribution.', pose: 'Sitting or standing, looking into distance peacefully', direction: 'Slow, meditative pace. Minimal, gentle transitions.' },
    { expression: 'Serene, centered. Breathing is visible but natural.', bodyLanguage: 'Stillness with gentle energy. Balanced and grounded.', pose: 'Standing with arms crossed, soft gaze down', direction: 'Move like water — smooth, continuous, effortless.' },
  ],
  energetic: [
    { expression: 'Big smile, animated face. Open expression.', bodyLanguage: 'Dynamic, active posture. Body in motion or poised to move.', pose: 'Mid-stride or jumping, active body angle', direction: 'Quick, dynamic movements. Do not hold still long.' },
    { expression: 'High energy, vibrant. Eyes bright and engaged.', bodyLanguage: 'Ready to burst into action. Springs in the step.', pose: 'One hand raised, mid-gesture, walking dynamically', direction: 'Keep the energy up — fast transitions, big movements.' },
  ],
  dreamy: [
    { expression: 'Soft focus gaze. Looking slightly past camera, lips parted.', bodyLanguage: 'Loose, flowing body language. Gentle sways and shifts.', pose: 'Looking up, touching hair or face gently', direction: 'Floating, soft movements. Slow motion quality.' },
    { expression: 'Lost in thought. Eyes unfocused, gentle smile playing.', bodyLanguage: 'Floating quality. Weight shifting gently, ethereal.', pose: 'Hand reaching out as if touching something invisible', direction: 'Ethereal and slow. Imagine moving through water.' },
  ],
  cinematic: [
    { expression: 'Intense, moody expression. Serious but not aggressive.', bodyLanguage: 'Strong, intentional poses. Each limb placed with purpose.', pose: 'Walking slowly, looking over shoulder', direction: 'Deliberate, dramatic movements. Hold and release.' },
    { expression: 'Deep, penetrating gaze. Storytelling through the eyes.', bodyLanguage: 'Controlled power. Tension held in the frame.', pose: 'Standing in profile, looking toward the horizon', direction: 'Think in frames — each position tells a different story.' },
  ],
  mysterious: [
    { expression: 'Half-smile. Looking away from camera, slightly down.', bodyLanguage: 'Enclosed body language. Partial turns, hidden hands.', pose: 'Half-turn, looking back at camera over shoulder', direction: 'Slow, subtle movements. Maintain the mystery.' },
    { expression: 'Enigmatic. Eyes visible through shadow, hint of a smile.', bodyLanguage: 'Shifting between openness and concealment.', pose: 'Standing partially behind a column or in shadow', direction: 'Reveal yourself slowly. Let curiosity build.' },
  ],
  edgy: [
    { expression: 'Bold, direct stare. Slight frown, jaw tight.', bodyLanguage: 'Angular, sharp poses. Asymmetrical weight distribution.', pose: 'Leaning back, arms crossed, direct stare', direction: 'Sharp, quick movements. Angular transitions.' },
    { expression: 'Intense, challenging. Unblinking focus.', bodyLanguage: 'Tension in the frame. Asymmetrical, unbalanced.', pose: 'Tilting head slightly, hand on jaw, piercing look', direction: 'Make each movement count. Sharp and deliberate.' },
  ],
  vintage: [
    { expression: 'Classic Hollywood smile. Slightly posed, timeless.', bodyLanguage: 'Posed but natural. Classic Hollywood elegance.', pose: 'Classic pin-up or old Hollywood pose', direction: 'Classic, controlled movements. Timeless grace.' },
    { expression: 'Old-money elegance. Warm, knowing smile.', bodyLanguage: 'Graceful lines. Hands placed with intention.', pose: 'Standing with one hand on hip, the other holding a prop', direction: 'Channel old Hollywood — elegance in every gesture.' },
  ],
  minimal: [
    { expression: 'Blank but not bored expression. Neutral, clean.', bodyLanguage: 'Clean, simple lines. Minimal angularity.', pose: 'Standing straight, arms at sides, simple', direction: 'Clean, precise movements. No wasted motion.' },
    { expression: 'Serene neutrality. Peaceful emptiness.', bodyLanguage: 'Stillness. Every line is intentional and clean.', pose: 'Sitting with hands in lap, direct but soft gaze', direction: 'Subtract everything unnecessary. Pure intention.' },
  ],
  natural: [
    { expression: 'Effortless, relaxed expression. Soft eyes, gentle smile.', bodyLanguage: 'Authentic, unforced posture. At ease in their own skin.', pose: 'Standing naturally, weight on one leg, looking around', direction: 'Move as you naturally would — authentic is always better.' },
    { expression: 'Genuine, candid expression. Mid-thought, natural.', bodyLanguage: 'Unselfconscious and free. Body moves without thought.', pose: 'Caught in a natural moment, half-turned', direction: 'Forget the camera. Focus on what is in front of you.' },
  ],
  bold: [
    { expression: 'Strong eye contact. Confident, almost challenging.', bodyLanguage: 'Assertive, occupying space. Grounded wide stance.', pose: 'Standing with hand on hip, direct confident look', direction: 'Big, expansive movements. Command attention.' },
    { expression: 'Unapologetic. Eyes wide, direct, powerful.', bodyLanguage: 'Dominant posture. Expanding into available space.', pose: 'Arms spread, looking up, owning the frame', direction: 'Fill the frame with your presence. Maximum energy.' },
  ],
  soft: [
    { expression: 'Gentle, yielding expression. Warm eyes, soft smile.', bodyLanguage: 'Curled, gentle postures. Intimate, vulnerable.', pose: 'Curled sitting pose, arms wrapped around knees', direction: 'Gentle, yielding movements. Intimate and tender.' },
    { expression: 'Vulnerable and open. Slight downward gaze.', bodyLanguage: 'Protective, inward-focused. Touching self soothingly.', pose: 'Touching collar or neck gently, looking down', direction: 'Create intimate moments. Small, delicate gestures.' },
  ],
  dramatic: [
    { expression: 'Intense gaze. Enhanced shadows on face for depth.', bodyLanguage: 'Strong diagonals. Sharp angles in limbs and posture.', pose: 'Diagonal body angle, one arm reaching out', direction: 'Exaggerated, theatrical movements. Big energy.' },
    { expression: 'High-impact expression. Strong emotions readable.', bodyLanguage: 'Theatrical. Extended limbs, dynamic angles.', pose: 'Arching back slightly, one hand above head', direction: 'The bigger the gesture, the better the drama.' },
  ],
  nostalgic: [
    { expression: 'Wistful look. Slightly sad smile, distant eyes.', bodyLanguage: 'Closed, contemplative. Arms folded or hands touching face.', pose: 'Looking at old photo or touching a keepsake', direction: 'Slow, reflective movements. Touch objects gently.' },
    { expression: 'Melancholic beauty. Eyes carrying memory.', bodyLanguage: 'Introspective. Touching objects, looking at hands.', pose: 'Sitting alone, looking at an empty space beside you', direction: 'Let memories guide your movements. Pensive and real.' },
  ],
};

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

export class MoodDetectionEngine {
  detect(
    luminance: number,
    temperature: number,
    isGoldenHour: boolean,
    isBacklit: boolean,
    tiltAngle: number,
    hasFace?: boolean,
    dominantColors?: string[],
  ): MoodResult {
    let primary: MoodType = 'calm';
    const secondary: MoodType[] = [];
    const now = Date.now();

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
      secondary.push('edgy', 'nostalgic');
    } else if (luminance < 0.2) {
      primary = 'edgy';
      secondary.push('dramatic', 'bold');
    } else if (temperature > 6500) {
      primary = 'minimal';
      secondary.push('calm', 'professional');
    } else if (hasFace === false) {
      primary = 'cinematic';
      secondary.push('minimal', 'dramatic');
    } else if (dominantColors?.some(c => ['gold', 'orange', 'coral'].includes(c))) {
      primary = 'happy';
      secondary.push('energetic', 'confident');
    } else if (dominantColors?.some(c => ['navy', 'grey', 'black'].includes(c))) {
      primary = 'mysterious';
      secondary.push('cinematic', 'edgy');
    } else {
      primary = 'happy';
      secondary.push('confident', 'natural');
    }

    const variations = MOOD_EXPRESSIONS[primary];
    const v = pickRandom(variations, now + Math.round(luminance * 100));
    const v2 = secondary.length > 0 ? pickRandom(MOOD_EXPRESSIONS[secondary[0]] || variations, now + Math.round(temperature)) : v;

    const confidence = Math.min(95, Math.round(
      45 +
      (isGoldenHour ? 25 : 0) +
      (isBacklit ? 15 : 0) +
      Math.round(luminance * 15) +
      (hasFace ? 10 : -10)
    ));

    return {
      primary,
      secondary,
      confidence: Math.max(30, confidence),
      expression: v.expression,
      bodyLanguage: v.bodyLanguage,
      adaptivePose: v.pose,
      adaptiveDirection: v.direction,
    };
  }
}

export const moodDetection = new MoodDetectionEngine();
