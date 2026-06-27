import type { CinematographerPlan, ShotType, LocationType, MoodType } from './types';

const SHOT_DESCRIPTIONS: Record<ShotType, {
  movement: string;
  position: string;
  baselineDur: number;
  desc: (loc: string, mood: string) => string;
  expected: (mood: string) => string;
}[]> = {
  tracking_shot: [
    { movement: 'Smooth lateral tracking, camera glides parallel at 0.5m/s', position: 'Walking forward, slightly left of center', baselineDur: 8, desc: (l, m) => `A ${m} tracking sequence through ${l}. The subject moves with purpose as the environment unfolds beside them.`, expected: (m) => `Dynamic ${m} walking sequence with environmental storytelling.` },
    { movement: 'Following from behind at walking pace, 2m distance', position: 'Walking away from camera, looking back occasionally', baselineDur: 10, desc: (l, m) => `Following the subject through ${l}, capturing their interaction with the space. Intimate and immersive.`, expected: (m) => `Intimate following shot with a sense of journey and discovery.` },
  ],
  push_in: [
    { movement: 'Slow dolly toward subject starting at 5m, ending at 1.5m over 5 seconds', position: 'Standing still, centered, holding eye contact with lens', baselineDur: 5, desc: (l, m) => `A slow push-in toward the subject, building intimacy against the ${l} backdrop.`, expected: (m) => `Intimate push-in that builds emotional connection with the subject.` },
    { movement: 'Steadicam walk-in from 8m, circling slightly to end at 2m at 45° angle', position: 'Starting in profile, turning to face camera as it approaches', baselineDur: 7, desc: (l, m) => `A revealing push-in that discovers the subject within the ${l} environment.`, expected: (m) => `Revealing approach shot that transitions from environment to subject.` },
  ],
  pull_out: [
    { movement: 'Gradual pull back from close-up (1m) to wide (8m), revealing the full scene', position: 'Standing still in center, growing smaller in frame', baselineDur: 6, desc: (l, m) => `A pull-out shot that starts intimate and reveals the grandeur of ${l}.`, expected: (m) => `Cinematic reveal that shows the subject in context of their environment.` },
    { movement: 'Backward dolly with subject walking toward camera', position: 'Walking slowly toward camera as it pulls back', baselineDur: 8, desc: (l, m) => `The subject walks toward us as the world of ${l} opens up behind them.`, expected: (m) => `Epic reveal combining subject movement with expanding environment.` },
  ],
  orbit_shot: [
    { movement: '180° arc around subject at 3m radius, smooth gimbal rotation', position: 'Standing still, tracking the camera with eyes, rotating body slowly', baselineDur: 10, desc: (l, m) => `An orbiting shot around the subject, with ${l} as the rotating backdrop.`, expected: (m) => `360° reveal showcasing the subject from every angle against the environment.` },
    { movement: 'Slow 360° orbit starting at profile, ending facing camera with environment behind', position: 'Standing still, slowly turning to follow camera, ending facing lens', baselineDur: 12, desc: (l, m) => `A full cinematic orbit that captures the subject and the ${l} environment in dynamic relationship.`, expected: (m) => `Full environment reveal with the subject as the central anchor.` },
  ],
  hero_shot: [
    { movement: 'Static frame with slow zoom in (24mm to 35mm equivalent), held for impact', position: 'Center frame, slightly offset to left, commanding presence', baselineDur: 4, desc: (l, m) => `A powerful hero frame against ${l}. The subject commands the composition.`, expected: (m) => `Iconic hero shot that establishes the subject as the focal point.` },
    { movement: 'Low angle static shot looking up at subject, wide 24mm lens', position: 'Standing tall above camera, looking down with confidence', baselineDur: 5, desc: (l, m) => `A low-angle hero shot that makes the subject appear larger than life against ${l}.`, expected: (m) => `Powerful low-angle hero shot with dramatic scale.` },
  ],
  reveal_shot: [
    { movement: 'Start on environment (wall/column/object), pan to reveal subject', position: 'Behind an object, stepping into frame as camera reveals', baselineDur: 7, desc: (l, m) => `A dramatic reveal — the camera discovers the subject within ${l}.`, expected: (m) => `Dramatic reveal with narrative tension and payoff.` },
    { movement: 'Rack focus from background to subject, then slow push-in', position: 'Standing at mid-distance, coming into focus from blurred background', baselineDur: 6, desc: (l, m) => `A focus reveal that pulls the subject out of the ${l} environment.`, expected: (m) => `Focus-based reveal that transitions from environment to subject.` },
  ],
  low_angle_shot: [
    { movement: 'Camera on ground level, tilting up to subject, wide lens', position: 'Standing tall, looking down at camera with authority', baselineDur: 5, desc: (l, m) => `A low-angle perspective that amplifies the subject's presence against ${l}.`, expected: (m) => `Empowering low-angle shot that conveys strength and scale.` },
    { movement: 'Crane up from ground to eye level, starting low and rising', position: 'Standing still, looking at horizon as camera rises to meet eye level', baselineDur: 7, desc: (l, m) => `A rising shot that starts at the subject's feet and ends at their eyes, revealing ${l} behind.`, expected: (m) => `Ascending reveal that builds from intimate detail to full portrait.` },
  ],
  high_angle_shot: [
    { movement: 'Boom down from above, looking down at subject from 45°', position: 'Looking up at camera, seated or reclining', baselineDur: 4, desc: (l, m) => `A high-angle perspective looking down at the subject within ${l}.`, expected: (m) => `Vulnerable high-angle shot that adds context through overhead perspective.` },
    { movement: 'Overhead, slow descent from 4m height to 2m', position: 'Lying down or looking directly up at camera', baselineDur: 6, desc: (l, m) => `A descending overhead shot that frames the subject against the ${l} floor or ground.`, expected: (m) => `Overhead establishing shot with unique geometric perspective.` },
  ],
  drone_style: [
    { movement: 'Sweeping aerial movement at 45° angle, 15m height descending to 5m', position: 'Walking along a path or edge, looking ahead or at surroundings', baselineDur: 12, desc: (l, m) => `A sweeping aerial-style shot over ${l}, capturing the grand scale of the environment.`, expected: (m) => `Epic aerial-style shot that captures the full majesty of the location.` },
    { movement: 'Top-down 90° angle, slowly descending while subject moves below', position: 'Walking slowly along a path, looking up occasionally', baselineDur: 10, desc: (l, m) => `A top-down perspective of the subject moving through ${l}, like a cinematic drone shot.`, expected: (m) => `Unique overhead cinematography with environmental scale.` },
  ],
  pov_shot: [
    { movement: 'First-person walking pace, natural sway, 35mm lens', position: 'Holding camera at eye level, walking through location', baselineDur: 15, desc: (l, m) => `A first-person perspective walking through ${l}, immersive and personal.`, expected: (m) => `Immersive POV that puts the viewer inside the scene.` },
    { movement: 'Handheld, slightly unstable, documentary style', position: 'Interacting with environment, natural movements', baselineDur: 12, desc: (l, m) => `A documentary-style POV capturing authentic moments within ${l}.`, expected: (m) => `Authentic documentary POV with raw, genuine feel.` },
  ],
  overhead_shot: [
    { movement: 'Top-down, slow vertical descent from 3m to 1.5m', position: 'Lying down or arranged in a composition below', baselineDur: 6, desc: (l, m) => `An overhead perspective looking straight down at the subject within ${l}.`, expected: (m) => `Geometric overhead shot with unique compositional possibilities.` },
    { movement: '45° angled overhead, orbiting slowly while descending', position: 'Seated or reclining, looking up at camera', baselineDur: 8, desc: (l, m) => `A dynamic overhead orbit that captures the subject from evolving angles above ${l}.`, expected: (m) => `Dynamic overhead cinematography with evolving perspective.` },
  ],
  dolly_zoom: [
    { movement: 'Dolly back while zooming in (Vertigo effect), 35mm to 85mm', position: 'Standing still, centered, watching camera with intensity', baselineDur: 6, desc: (l, m) => `A disorienting dolly zoom that makes ${l} seem to shift around the subject.`, expected: (m) => `Dramatic Vertigo effect shot with psychological impact.` },
    { movement: 'Slow dolly forward with simultaneous zoom out', position: 'Walking slowly toward camera as space warps around', baselineDur: 7, desc: (l, m) => `A reverse dolly zoom that creates an expanding environment effect around the subject in ${l}.`, expected: (m) => `Expanding space effect that emphasizes the environment's scale.` },
  ],
  whip_pan: [
    { movement: 'Fast horizontal pan between two points, 180° rotation in 1s', position: 'Two positions — start at point A, camera whips to point B', baselineDur: 2, desc: (l, m) => `A fast whip pan across ${l} that transitions between two moments.`, expected: (m) => `Dynamic transition shot with high energy and visual impact.` },
    { movement: 'Whip pan from subject to environment, then back to subject', position: 'Subject at one side, environment on the other', baselineDur: 3, desc: (l, m) => `A whip pan that connects the subject to their ${l} environment in a single dynamic motion.`, expected: (m) => `Connective whip pan that links subject and environment.` },
  ],
  slide_shot: [
    { movement: 'Lateral steadicam movement, 0.5m/s, parallel to subject', position: 'Walking parallel to camera movement, same speed', baselineDur: 8, desc: (l, m) => `A smooth lateral slide alongside the subject as ${l} passes in the background.`, expected: (m) => `Smooth lateral tracking with environmental depth change.` },
    { movement: 'Quick lateral whip, then settle into static frame', position: 'Standing still as camera slides past, then turns to face', baselineDur: 5, desc: (l, m) => `A fast slide past the subject that settles into a composed frame with ${l} behind them.`, expected: (m) => `Dynamic slide-to-static transition with compositional payoff.` },
  ],
};

export class AICinematographerEngine {
  generateShot(
    locationType: LocationType,
    mood: MoodType,
    isGoldenHour: boolean,
    depth: number,
    contrast?: number,
  ): CinematographerPlan {
    const shotType = this.pickShotType(locationType, mood, depth, contrast);
    const variations = SHOT_DESCRIPTIONS[shotType];
    const now = Date.now();
    const v = variations[Math.floor(now / 5000) % variations.length];

    const locationName = locationType.replace(/_/g, ' ');
    const lightingDesc = isGoldenHour
      ? 'warm golden hour light at 45° creating long shadows'
      : 'natural ambient light with moderate diffusion';

    const direction = `${lightingDesc}. Camera ${v.movement.split(',')[0].toLowerCase()}.`;

    return {
      shotType,
      cameraMovement: v.movement,
      subjectPosition: v.position,
      direction,
      duration: v.baselineDur + (isGoldenHour ? 2 : 0),
      description: v.desc(locationName, mood),
      liveInstructions: this.getLiveInstructions(shotType, mood, isGoldenHour),
      expectedResult: v.expected(mood),
    };
  }

  generateShotList(locationType: LocationType, mood: MoodType, depth?: number, contrast?: number): CinematographerPlan[] {
    const shotTypes: ShotType[] = [
      'hero_shot', 'tracking_shot', 'push_in', 'orbit_shot',
      'drone_style', 'reveal_shot', 'slide_shot',
    ];
    return shotTypes.map(st => this.generateShot(locationType, mood, false, depth ?? 0.5, contrast));
  }

  private pickShotType(location: LocationType, mood: MoodType, depth?: number, contrast?: number): ShotType {
    if (mood === 'cinematic' || mood === 'dramatic') return contrast !== undefined && contrast > 0.7 ? 'dolly_zoom' : 'hero_shot';
    if (depth !== undefined && depth > 0.7) return 'drone_style';
    if (['mountain', 'lake', 'beach', 'desert'].includes(location)) return 'drone_style';
    if (mood === 'romantic' || mood === 'dreamy') return 'orbit_shot';
    if (mood === 'adventure' || mood === 'energetic') return 'tracking_shot';
    if (mood === 'mysterious' || mood === 'edgy') return 'reveal_shot';
    if (mood === 'luxury' || mood === 'minimal') return 'pull_out';
    if (mood === 'professional' || mood === 'calm') return 'push_in';
    return 'hero_shot';
  }

  private getLiveInstructions(shot: ShotType, mood: MoodType, golden: boolean): string[] {
    const base: string[] = [];
    if (golden) base.push('Position yourself so the warm light hits your face at a 45° angle');
    if (mood === 'romantic' || mood === 'dreamy') base.push('Move slowly, let each gesture breathe');
    if (mood === 'energetic' || mood === 'adventure') base.push('Keep your movements dynamic and full of energy');
    if (mood === 'mysterious' || mood === 'edgy') base.push('Be deliberate — each movement should feel intentional');
    if (mood === 'luxury') base.push('Move as if you have all the time in the world — slow, elegant, controlled');

    base.push(this.getShotInstruction(shot));
    return base;
  }

  private getShotInstruction(shot: ShotType): string {
    const map: Record<ShotType, string> = {
      tracking_shot: 'Walk at a steady pace, let the world move beside you.',
      push_in: 'Hold your position and maintain eye contact as the camera approaches.',
      pull_out: 'Stay centered as the world expands around you.',
      orbit_shot: 'Rotate slowly with the camera, discovering the space.',
      hero_shot: 'Own this moment. Stand tall, breathe, and hold the frame.',
      reveal_shot: 'Step into frame at the right moment — timing is everything.',
      low_angle_shot: 'Look down with authority — you are the subject of this story.',
      high_angle_shot: 'Look up, soften your expression, let the camera see you.',
      drone_style: 'Move through the space as if being watched from above.',
      pov_shot: 'Show me what you see — move naturally through the scene.',
      overhead_shot: 'Arrange yourself below, aware of the geometric composition.',
      dolly_zoom: 'Hold still and let the world warp around you.',
      whip_pan: 'Hit your mark fast — energy and precision matter.',
      slide_shot: 'Walk parallel to the camera, matching its pace exactly.',
    };
    return map[shot] || 'Hold your position and let the camera do the work.';
  }
}

export const aiCinematographer = new AICinematographerEngine();
