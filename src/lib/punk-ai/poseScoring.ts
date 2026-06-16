import type { PoseScore, SceneContext, StyleTab, Pose } from './types';
import type { PunkPose } from '../../components/punk/PunkPoseDatabase';
import { ALL_POSES } from '../../components/punk/PunkPoseDatabase';

export class PoseScoringEngine {
  scorePose(pose: Pose, context: SceneContext, style: StyleTab): PoseScore {
    const poseMatchScore = this.calculatePoseMatch(pose, context);
    const lightingScore = this.calculateLightingScore(pose, context);
    const backgroundScore = this.calculateBackgroundScore(pose, context);
    const compositionScore = this.calculateCompositionScore(pose, context);
    const trendScore = this.calculateTrendScore(pose, style);
    const comfortScore = this.calculateComfortScore(pose);
    const uniquenessScore = this.calculateUniquenessScore(pose, context);

    const overallScore = Math.round(
      poseMatchScore * 0.25 +
      lightingScore * 0.15 +
      backgroundScore * 0.10 +
      compositionScore * 0.20 +
      trendScore * 0.10 +
      comfortScore * 0.10 +
      uniquenessScore * 0.10
    );

    const difficulty = overallScore > 75 ? 'hard' : overallScore > 50 ? 'medium' : 'easy';
    const comfort = comfortScore > 70 ? 'comfortable' : comfortScore > 40 ? 'moderate' : 'strenuous';

    return {
      poseId: pose.id,
      poseName: pose.name,
      overallScore,
      poseMatchScore,
      lightingScore,
      backgroundScore,
      compositionScore,
      trendScore,
      comfortScore,
      uniquenessScore,
      difficulty,
      comfort,
      explanation: this.generateExplanation(pose, context, overallScore),
      cameraInstructions: this.generateCameraInstructions(pose, context),
      lightingInstructions: this.generateLightingInstructions(context),
      expectedResult: this.generateExpectedResult(pose, context, overallScore),
      engagementPotential: Math.round((overallScore + trendScore) / 2),
    };
  }

  getTopPoses(context: SceneContext, style: StyleTab, count: number = 5): PoseScore[] {
    const stylePoses = (ALL_POSES as PunkPose[]).filter(p => p.styles.includes(style));
    const scored = stylePoses.map(p => this.scorePose(p, context, style));
    return scored.sort((a, b) => b.overallScore - a.overallScore).slice(0, count);
  }

  private calculatePoseMatch(pose: Pose, context: SceneContext): number {
    let score = 50;
    const cat = pose.category.toLowerCase();

    if (context.locationType.includes('landscape') || context.locationType.includes('beach')) {
      if (['nature', 'beach', 'mountain', 'travel'].some(c => cat.includes(c))) score += 30;
    }
    if (context.locationType.includes('urban')) {
      if (['street', 'urban', 'fashion', 'editorial'].some(c => cat.includes(c))) score += 30;
    }
    if (context.isGoldenHour) {
      if (['sunset', 'portrait', 'romantic'].some(c => cat.includes(c))) score += 20;
    }
    if (context.environmentMood.includes('dramatic')) {
      if (['cinematic', 'hero', 'editorial'].some(c => cat.includes(c))) score += 20;
    }

    return Math.min(100, score);
  }

  private calculateLightingScore(pose: Pose, context: SceneContext): number {
    let score = 60;
    if (context.isGoldenHour) score += 25;
    if (context.isBlueHour) score += 15;
    if (context.lightingDirection === 'backlit') score += 10;
    if (context.lightingDirection === 'side_lit') score += 10;
    if (context.indoorLighting === 'low') score -= 15;
    return Math.max(0, Math.min(100, score));
  }

  private calculateBackgroundScore(pose: Pose, context: SceneContext): number {
    let score = 60;
    if (context.backgroundDepth > 0.5) score += 20;
    if (context.locationType.includes('landscape') || context.locationType.includes('urban')) {
      if (['nature', 'travel', 'street', 'mountain', 'beach'].some(c => pose.category.toLowerCase().includes(c))) {
        score += 15;
      }
    }
    return Math.min(100, score);
  }

  private calculateCompositionScore(pose: Pose, context: SceneContext): number {
    let score = 55;
    const angle = context.cameraAngle;
    if (pose.angles.includes(angle as any)) score += 25;
    if (pose.angles.includes('eye_level') && angle === 'eye_level') score += 10;
    if (pose.angles.includes('low_angle') && angle === 'low_angle') score += 10;
    return Math.min(100, score);
  }

  private calculateTrendScore(pose: Pose, style: StyleTab): number {
    const trendMap: Record<string, number> = {
      'InstagramTrend': 90, 'PinterestTrend': 85, 'Viral': 95,
      'Fashion': 80, 'Editorial': 75, 'Luxury': 70,
      'Travel': 75, 'Cinematic': 80, 'Aesthetic': 85,
    };
    return trendMap[style] || 50;
  }

  private calculateComfortScore(pose: Pose): number {
    const difficultPoses = ['jump', 'crouching', 'lying', 'action'];
    const hasDifficult = difficultPoses.some(d => pose.id.includes(d));
    return hasDifficult ? 40 : 80;
  }

  private calculateUniquenessScore(pose: Pose, context: SceneContext): number {
    let score = 50;
    if (context.cameraAngle === 'bird_eye' || context.cameraAngle === 'overhead') score += 25;
    if (context.cameraAngle === 'low_angle') score += 15;
    if (pose.category === 'cinematic_hero' || pose.category === 'editorial_magazine') score += 20;
    if (pose.category === 'drone') score += 15;
    return Math.min(100, score);
  }

  private generateExplanation(pose: Pose, context: SceneContext, score: number): string {
    const parts: string[] = [];
    if (context.isGoldenHour) parts.push('Perfect golden hour light');
    if (context.environmentMood.includes('dramatic')) parts.push('Dramatic mood matches pose energy');
    if (score > 80) parts.push('Exceptional composition potential');
    else if (score > 60) parts.push('Strong choice for this scene');
    else parts.push('Decent option with room for creativity');
    return parts.join('. ') + '.';
  }

  private generateCameraInstructions(pose: Pose, context: SceneContext): string {
    const angle = context.cameraAngle;
    const instructions: Record<string, string> = {
      eye_level: `Position camera at eye level (1.2m). Focus on subject's eyes. ${pose.name} works best with slight downward tilt.`,
      low_angle: `Crouch low, tilt camera up 15°. Emphasizes height and power for ${pose.name}.`,
      high_angle: `Shoot from slightly above (1.5m). Creates intimacy for ${pose.name}.`,
      bird_eye: `Position directly overhead. ${pose.name} benefits from symmetrical framing.`,
      overhead: 'Full top-down perspective. Clean background essential.',
    };
    return instructions[angle] || instructions.eye_level;
  }

  private generateLightingInstructions(context: SceneContext): string {
    if (context.isGoldenHour) return 'Position subject with sun at 45° angle to face. Warm rim light creates separation.';
    if (context.isBlueHour) return 'Use long exposure (1/30s+). Cool tones enhance mood. Bounce light with reflector.';
    if (context.lightingDirection === 'backlit') return 'Expose for subject face (+1EV). Use spot metering. Rim light effect.';
    if (context.lightingDirection === 'side_lit') return 'Fill shadows with reflector on opposite side. Dramatic ¾ lighting.';
    if (context.indoorLighting === 'low') return 'Increase ISO to 800-1600. Open aperture to f/1.4-f/2. Use available window light.';
    return 'Natural diffused light. Soft shadows, even exposure.';
  }

  private generateExpectedResult(pose: Pose, context: SceneContext, score: number): string {
    if (score > 85) return 'Cinematic, magazine-quality shot. Strong visual impact, natural composition.';
    if (score > 70) return 'Professional-grade photograph. Pleasing composition with good atmosphere.';
    if (score > 55) return 'Solid photograph. Will look great with minimal editing.';
    return 'Decent shot. Try adjusting angle or lighting for better results.';
  }
}

export const poseScoring = new PoseScoringEngine();
