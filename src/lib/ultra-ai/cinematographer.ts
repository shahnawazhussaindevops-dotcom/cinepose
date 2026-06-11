import type { CinematographerPlan, ShotType, LocationType, MoodType } from './types';

export class AICinematographerEngine {
  generateShot(
    locationType: LocationType,
    mood: MoodType,
    isGoldenHour: boolean,
    depth: number
  ): CinematographerPlan {
    let shotType = this.pickShotType(locationType, mood);
    let cameraMovement = this.getCameraMovement(shotType);
    let subjectPosition = this.getSubjectPosition(shotType);
    let direction = this.getDirection(shotType, isGoldenHour);
    let duration = this.getDuration(shotType);

    const liveInstructions = [
      'Walk slowly toward camera',
      'Look over your shoulder',
      'Turn at the sunlight',
      `Pause for ${duration} seconds`,
    ];

    return {
      shotType,
      cameraMovement,
      subjectPosition,
      direction,
      duration,
      description: this.getDescription(shotType, locationType, mood),
      liveInstructions,
      expectedResult: this.getExpectedResult(shotType, mood),
    };
  }

  generateShotList(locationType: LocationType, mood: MoodType): CinematographerPlan[] {
    const shotTypes: ShotType[] = [
      'hero_shot',
      'tracking_shot',
      'push_in',
      'orbit_shot',
      'drone_style',
      'reveal_shot',
    ];
    return shotTypes.map(st => this.generateShot(locationType, mood, false, 0.5));
  }

  private pickShotType(location: LocationType, mood: MoodType): ShotType {
    if (mood === 'epic' || mood === 'cinematic') return 'hero_shot';
    if (location === 'mountain' || location === 'lake' || location === 'beach') return 'drone_style';
    if (mood === 'romantic' || mood === 'dreamy') return 'orbit_shot';
    if (mood === 'adventure' || mood === 'energetic') return 'tracking_shot';
    if (mood === 'mysterious' || mood === 'dramatic') return 'reveal_shot';
    return 'push_in';
  }

  private getCameraMovement(shot: ShotType): string {
    const map: Record<ShotType, string> = {
      tracking_shot: 'Follow subject laterally, 1m/s smooth movement',
      push_in: 'Slow dolly toward subject, 0.3m/s',
      pull_out: 'Gradual pull back revealing environment',
      orbit_shot: 'Arc around subject at constant radius',
      hero_shot: 'Static frame with slow zoom in',
      reveal_shot: 'Start on environment, pan to subject',
      low_angle_shot: 'Crane up from low to eye level',
      high_angle_shot: 'Boom down from above',
      drone_style: 'Sweeping aerial movement, 45° angle',
      pov_shot: 'Walking pace, natural sway',
      overhead_shot: 'Top-down, slow vertical descent',
      dolly_zoom: 'Dolly back while zooming in',
      whip_pan: 'Fast pan between two subjects',
      slide_shot: 'Lateral movement, 0.5m/s',
    };
    return map[shot] || 'Slow push-in';
  }

  private getSubjectPosition(shot: ShotType): string {
    const map: Record<ShotType, string> = {
      tracking_shot: 'Walking forward, center frame',
      push_in: 'Standing still, center, looking at lens',
      pull_out: 'Walking away from camera, slow pace',
      orbit_shot: 'Standing still, rotating with camera',
      hero_shot: 'Center frame, slight offset left',
      reveal_shot: 'Behind an object, step out on cue',
      low_angle_shot: 'Standing tall, looking down at camera',
      high_angle_shot: 'Sitting or looking up at camera',
      drone_style: 'Walking along a path, looking ahead',
      pov_shot: 'Holding camera at eye level, walking',
      overhead_shot: 'Lying down or looking up',
      dolly_zoom: 'Walking toward camera, steady pace',
      whip_pan: 'Two subjects, opposite sides of frame',
      slide_shot: 'Walking parallel to camera movement',
    };
    return map[shot] || 'Center frame, facing camera';
  }

  private getDirection(shot: ShotType, goldenHour: boolean): string {
    const base = goldenHour ? 'Sunlight at 45° to subject face' : 'Natural ambient light';
    const dirs: Record<ShotType, string> = {
      tracking_shot: `${base}. Camera tracks parallel.`,
      push_in: `${base}. Camera moves straight.`,
      pull_out: `${base}. Camera pulls back.`,
      orbit_shot: `${base}. Camera arcs 180°.`,
      hero_shot: `${base}. Camera holds steady.`,
      reveal_shot: `${base}. Camera pans to reveal.`,
      low_angle_shot: `${base}. Camera tilts up.`,
      high_angle_shot: `${base}. Camera tilts down.`,
      drone_style: `${base}. Aerial perspective.`,
      pov_shot: `${base}. First-person perspective.`,
      overhead_shot: `${base}. Top-down view.`,
      dolly_zoom: `${base}. Vertigo effect.`,
      whip_pan: `${base}. Fast horizontal rotation.`,
      slide_shot: `${base}. Lateral steadicam.`,
    };
    return dirs[shot] || base;
  }

  private getDuration(shot: ShotType): number {
    const map: Record<ShotType, number> = {
      tracking_shot: 8, push_in: 5, pull_out: 6, orbit_shot: 10,
      hero_shot: 4, reveal_shot: 7, low_angle_shot: 5, high_angle_shot: 4,
      drone_style: 12, pov_shot: 15, overhead_shot: 6, dolly_zoom: 6,
      whip_pan: 2, slide_shot: 8,
    };
    return map[shot] || 5;
  }

  private getDescription(shot: ShotType, location: LocationType, mood: MoodType): string {
    return `A ${mood} ${shot.replace(/_/g, ' ')} at ${location.replace(/_/g, ' ')}. ${this.getCameraMovement(shot)}.`;
  }

  private getExpectedResult(shot: ShotType, mood: MoodType): string {
    if (shot === 'hero_shot') return 'Powerful, cinematic hero introduction shot';
    if (shot === 'drone_style') return 'Epic aerial-style shot with sweeping environment';
    if (shot === 'orbit_shot') return 'Dynamic 360° reveal with subject as focal point';
    if (shot === 'tracking_shot') return 'Cinematic walking sequence with environmental context';
    if (shot === 'reveal_shot') return 'Dramatic reveal with narrative tension';
    return `Professional ${mood} cinematography`;
  }
}

export const aiCinematographer = new AICinematographerEngine();
