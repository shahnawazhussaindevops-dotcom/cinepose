import type { DirectorInstruction, SceneContext, PoseScore } from './types';

export class AIDirector {
  generateInstructions(pose: PoseScore, context: SceneContext): DirectorInstruction[] {
    const instructions: DirectorInstruction[] = [];
    let order = 0;

    if (context.isGoldenHour) {
      instructions.push({
        type: 'turn',
        target: 'body',
        value: '15° towards light',
        description: 'Turn 15° toward the golden light to catch the warm rim on your face',
        order: order++,
      });
    }

    if (context.lightingDirection === 'backlit') {
      instructions.push({
        type: 'turn',
        target: 'face',
        value: '30° away from camera',
        description: 'Turn your face 30° away to create a dramatic profile silhouette',
        order: order++,
      });
    }

    if (context.cameraAngle === 'low_angle') {
      instructions.push({
        type: 'tilt',
        target: 'chin',
        value: 'slightly down',
        description: 'Tilt your chin slightly down to avoid looking up into the lens',
        order: order++,
      });
      instructions.push({
        type: 'look',
        target: 'eyes',
        value: 'past camera, slightly down',
        description: 'Look past the camera, slightly downward — creates contemplative mood',
        order: order++,
      });
    }

    if (pose.difficulty === 'easy') {
      instructions.push(
        {
          type: 'relax', target: 'shoulders', value: 'drop and roll back',
          description: 'Roll your shoulders back and down — opens the chest, looks confident',
          order: order++,
        },
        {
          type: 'breathe', target: 'breath', value: 'slow exhale',
          description: 'Take a slow breath in, then exhale — your expression softens naturally',
          order: order++,
        }
      );
    }

    if (pose.difficulty === 'hard') {
      instructions.push(
        {
          type: 'shift', target: 'weight', value: 'back leg, 60%',
          description: 'Shift 60% of your weight to your back leg — creates natural S-curve',
          order: order++,
        },
        {
          type: 'move', target: 'hand', value: 'relax fingers, slight gap',
          description: 'Keep fingers relaxed with a slight gap between them — looks natural, not stiff',
          order: order++,
        },
        {
          type: 'angle', target: 'hip', value: 'pop slightly left',
          description: 'Pop your left hip out slightly — creates elegant silhouette',
          order: order++,
        }
      );
    }

    if (instructions.length < 3) {
      instructions.push({
        type: 'look',
        target: 'eyes',
        value: 'soft gaze, slightly squinting',
        description: 'Soften your gaze. Slight squint creates confidence without aggression',
        order: order++,
      });
    }

    if (instructions.length < 4) {
      instructions.push({
        type: 'step',
        target: 'left foot',
        value: '6 inches forward',
        description: 'Step your left foot 6 inches forward — breaks the straight line, adds depth',
        order: order++,
      });
    }

    return instructions.sort((a, b) => a.order - b.order);
  }
}

export const aiDirector = new AIDirector();
