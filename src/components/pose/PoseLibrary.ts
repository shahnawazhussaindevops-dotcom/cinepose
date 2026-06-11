import type { Pose, Gender, SceneType, CameraAngle, JointPosition } from '../../lib/types';

const baseJoints = (): JointPosition[] => [
  { name: 'head', x: 0, y: 0.8, z: 0 },
  { name: 'neck', x: 0, y: 0.7, z: 0 },
  { name: 'leftShoulder', x: -0.15, y: 0.68, z: 0 },
  { name: 'rightShoulder', x: 0.15, y: 0.68, z: 0 },
  { name: 'leftElbow', x: -0.2, y: 0.55, z: 0 },
  { name: 'rightElbow', x: 0.2, y: 0.55, z: 0 },
  { name: 'leftHand', x: -0.22, y: 0.4, z: 0 },
  { name: 'rightHand', x: 0.22, y: 0.4, z: 0 },
  { name: 'spine', x: 0, y: 0.55, z: 0 },
  { name: 'hip', x: 0, y: 0.4, z: 0 },
  { name: 'leftHip', x: -0.1, y: 0.4, z: 0 },
  { name: 'rightHip', x: 0.1, y: 0.4, z: 0 },
  { name: 'leftKnee', x: -0.08, y: 0.22, z: 0 },
  { name: 'rightKnee', x: 0.08, y: 0.22, z: 0 },
  { name: 'leftFoot', x: -0.08, y: 0.0, z: 0 },
  { name: 'rightFoot', x: 0.08, y: 0.0, z: 0 },
];

export const POSES: Pose[] = [
  {
    id: 'confident_stand',
    name: 'Confident Stand',
    category: 'standing',
    description: 'Weight on one leg, arms relaxed',
    genders: ['male', 'female', 'neutral'],
    scenes: ['urban', 'architecture', 'street'],
    angles: ['eye_level', 'low_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 14) return { ...j, x: -0.06, y: 0.0, z: 0.02 };
      if (i === 15) return { ...j, x: 0.1, y: 0.0, z: -0.02 };
      if (i === 6) return { ...j, x: -0.2, y: 0.35, z: 0.05 };
      return j;
    }),
    tip: 'Shift your weight to your back leg — it softens the silhouette',
    score: 'Great for this scene ✦',
  },
  {
    id: 'crossed_arms',
    name: 'Crossed Arms',
    category: 'standing',
    description: 'Arms crossed, confident urban look',
    genders: ['male', 'neutral'],
    scenes: ['urban', 'architecture', 'street'],
    angles: ['eye_level', 'low_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 6) return { ...j, x: -0.12, y: 0.5, z: 0.1 };
      if (i === 7) return { ...j, x: 0.12, y: 0.5, z: 0.1 };
      if (i === 4) return { ...j, x: -0.12, y: 0.55, z: 0.05 };
      if (i === 5) return { ...j, x: 0.12, y: 0.55, z: 0.05 };
      return j;
    }),
    tip: 'Keep shoulders relaxed — tension travels to your face',
    score: 'Classic',
  },
  {
    id: 'hand_in_pocket',
    name: 'Hand in Pocket',
    category: 'candid',
    description: 'One hand in pocket, casual stance',
    genders: ['male', 'neutral'],
    scenes: ['urban', 'street', 'architecture'],
    angles: ['eye_level', 'high_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 6) return { ...j, x: -0.15, y: 0.3, z: -0.05 };
      if (i === 14) return { ...j, x: -0.04, y: 0, z: 0.03 };
      return j;
    }),
    tip: 'The hand you show — keep fingers relaxed, not clenched',
    score: 'Cinematic',
  },
  {
    id: 'looking_away',
    name: 'Looking Away',
    category: 'candid',
    description: 'Over the shoulder look',
    genders: ['male', 'female', 'neutral'],
    scenes: ['urban', 'nature', 'beach', 'mountain'],
    angles: ['eye_level'],
    joints: baseJoints().map((j, i) => {
      if (i === 0) return { ...j, x: 0.05, y: 0.8, z: -0.1 };
      if (i === 14) return { ...j, x: -0.04, y: 0, z: 0.02 };
      return j;
    }),
    tip: 'Look past the camera, not into it — creates mystery',
    score: 'Great for this scene ✦',
  },
  {
    id: 'walking_step',
    name: 'Walking Step',
    category: 'action',
    description: 'One foot forward, mid-stride',
    genders: ['male', 'female', 'neutral'],
    scenes: ['urban', 'street', 'nature'],
    angles: ['eye_level', 'low_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 12) return { ...j, x: -0.15, y: 0.2, z: 0.1 };
      if (i === 13) return { ...j, x: 0.15, y: 0.25, z: -0.1 };
      if (i === 14) return { ...j, x: -0.15, y: 0, z: 0.15 };
      if (i === 15) return { ...j, x: 0.15, y: 0, z: -0.12 };
      if (i === 6) return { ...j, x: -0.25, y: 0.35, z: 0.05 };
      if (i === 7) return { ...j, x: 0.2, y: 0.4, z: -0.05 };
      return j;
    }),
    tip: 'Candid walking shots work best at 1/125s or faster',
    score: 'Cinematic',
  },
  {
    id: 'arms_out',
    name: 'Arms Out',
    category: 'standing',
    description: 'Arms out to sides, panoramic',
    genders: ['male', 'female', 'neutral'],
    scenes: ['nature', 'mountain', 'beach'],
    angles: ['eye_level', 'low_angle', 'high_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 4) return { ...j, x: -0.4, y: 0.6, z: 0 };
      if (i === 5) return { ...j, x: 0.4, y: 0.6, z: 0 };
      if (i === 6) return { ...j, x: -0.5, y: 0.45, z: 0 };
      if (i === 7) return { ...j, x: 0.5, y: 0.45, z: 0 };
      return j;
    }),
    tip: 'Embrace the landscape — open body language invites the viewer in',
    score: 'Great for this scene ✦',
  },
  {
    id: 'leaning_wall',
    name: 'Leaning on Wall',
    category: 'urban',
    description: 'Casual lean against a wall',
    genders: ['male', 'female', 'neutral'],
    scenes: ['urban', 'architecture', 'street'],
    angles: ['eye_level'],
    joints: baseJoints().map((j, i) => {
      if (i === 8) return { ...j, x: -0.05, y: 0.55, z: 0.05 };
      if (i === 14) return { ...j, x: -0.1, y: 0, z: 0.05 };
      return j;
    }),
    tip: 'Don\'t fully lean — just touch the wall with your shoulder blade',
    score: 'Classic',
  },
  {
    id: 'sitting_steps',
    name: 'Sitting on Steps',
    category: 'sitting',
    description: 'Sitting on stairs or ledge',
    genders: ['male', 'female', 'neutral'],
    scenes: ['urban', 'architecture'],
    angles: ['eye_level', 'high_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 12) return { ...j, x: -0.12, y: 0.15, z: 0.1 };
      if (i === 13) return { ...j, x: 0.12, y: 0.15, z: 0.1 };
      if (i === 14) return { ...j, x: -0.12, y: 0.05, z: 0.2 };
      if (i === 15) return { ...j, x: 0.12, y: 0.05, z: 0.2 };
      if (i === 9) return { ...j, x: 0, y: 0.25, z: 0 };
      return j;
    }),
    tip: 'Sit on the edge — leaning back flattens the composition',
    score: 'Great for this scene ✦',
  },
  {
    id: 'crouching',
    name: 'Crouching',
    category: 'standing',
    description: 'Low crouch, street photography look',
    genders: ['male', 'female', 'neutral'],
    scenes: ['urban', 'street', 'architecture'],
    angles: ['eye_level', 'low_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 12) return { ...j, x: -0.15, y: 0.1, z: 0.05 };
      if (i === 13) return { ...j, x: 0.1, y: 0.1, z: 0.05 };
      if (i === 14) return { ...j, x: -0.15, y: 0, z: 0.1 };
      if (i === 15) return { ...j, x: 0.1, y: 0, z: 0.1 };
      if (i === 9) return { ...j, x: 0, y: 0.15, z: 0 };
      return j;
    }),
    tip: 'Crouch on the balls of your feet — looks active, not tired',
    score: 'Cinematic',
  },
  {
    id: 'lying_ground',
    name: 'Lying on Ground',
    category: 'lying',
    description: 'Prone on ground, aerial view',
    genders: ['male', 'female', 'neutral'],
    scenes: ['nature', 'beach', 'mountain'],
    angles: ['bird_eye', 'overhead'],
    joints: baseJoints().map((j, i) => {
      return { ...j, y: j.y * 0.3, z: j.z - 0.1 };
    }),
    tip: 'Position camera directly overhead for symmetry',
    score: 'Great for this scene ✦',
  },
  {
    id: 'arms_wide',
    name: 'Arms Stretched Wide',
    category: 'nature',
    description: 'Arms wide, embracing landscape',
    genders: ['male', 'female', 'neutral'],
    scenes: ['nature', 'mountain', 'beach'],
    angles: ['eye_level', 'low_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 4) return { ...j, x: -0.5, y: 0.6, z: 0 };
      if (i === 5) return { ...j, x: 0.5, y: 0.6, z: 0 };
      if (i === 6) return { ...j, x: -0.65, y: 0.5, z: 0 };
      if (i === 7) return { ...j, x: 0.65, y: 0.5, z: 0 };
      return j;
    }),
    tip: 'Tilt your head back slightly — opens the neck line',
    score: 'Great for this scene ✦',
  },
  {
    id: 'jump',
    name: 'Jump Mid-Air',
    category: 'action',
    description: 'Jumping, peak action',
    genders: ['male', 'female', 'neutral'],
    scenes: ['nature', 'mountain', 'beach'],
    angles: ['low_angle', 'eye_level'],
    joints: baseJoints().map((j, i) => {
      if (i === 12) return { ...j, x: -0.1, y: 0.3, z: 0.1 };
      if (i === 13) return { ...j, x: 0.1, y: 0.35, z: -0.05 };
      if (i === 14) return { ...j, x: -0.12, y: 0.2, z: 0.15 };
      if (i === 15) return { ...j, x: 0.12, y: 0.25, z: -0.08 };
      if (i === 4) return { ...j, x: -0.3, y: 0.55, z: 0.1 };
      if (i === 5) return { ...j, x: 0.3, y: 0.55, z: -0.1 };
      return { ...j, y: j.y + 0.1 };
    }),
    tip: 'Jump on the spot — moving forward ruins the composition',
    score: 'Cinematic',
  },
  {
    id: 'looking_distance',
    name: 'Looking into Distance',
    category: 'nature',
    description: 'Silhouette profile, gazing out',
    genders: ['male', 'female', 'neutral'],
    scenes: ['nature', 'mountain', 'beach'],
    angles: ['eye_level', 'high_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 0) return { ...j, x: 0.08, y: 0.8, z: -0.15 };
      if (i === 14) return { ...j, x: -0.06, y: 0, z: 0.02 };
      return j;
    }),
    tip: 'For silhouette shots, expose for the sky — not the subject',
    score: 'Great for this scene ✦',
  },
  {
    id: 'sitting_crossed',
    name: 'Sitting Cross-Legged',
    category: 'sitting',
    description: 'Cross-legged seated pose',
    genders: ['male', 'female', 'neutral'],
    scenes: ['nature', 'indoor', 'beach'],
    angles: ['eye_level', 'high_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 12) return { ...j, x: -0.15, y: 0.05, z: 0.05 };
      if (i === 13) return { ...j, x: 0.15, y: 0.05, z: 0.05 };
      if (i === 14) return { ...j, x: -0.15, y: 0.0, z: 0.1 };
      if (i === 15) return { ...j, x: 0.15, y: 0.0, z: 0.1 };
      if (i === 9) return { ...j, x: 0, y: 0.15, z: 0 };
      return j;
    }),
    tip: 'Sit up straight — slouching reads as low energy',
    score: 'Classic',
  },
  {
    id: 'walking_uphill',
    name: 'Walking Uphill',
    category: 'mountain',
    description: 'Walking uphill silhouette',
    genders: ['male', 'female', 'neutral'],
    scenes: ['mountain', 'nature'],
    angles: ['eye_level', 'low_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 14) return { ...j, x: 0.08, y: 0.0, z: -0.05 };
      if (i === 15) return { ...j, x: -0.08, y: 0.02, z: 0.05 };
      if (i === 6) return { ...j, x: -0.25, y: 0.38, z: 0.05 };
      if (i === 7) return { ...j, x: 0.2, y: 0.4, z: -0.05 };
      if (i === 8) return { ...j, x: 0, y: 0.5, z: 0.02 };
      return j;
    }),
    tip: 'Shoot from low angle to emphasize the climb',
    score: 'Great for this scene ✦',
  },
  {
    id: 'leaning_railing',
    name: 'Leaning on Railing',
    category: 'urban',
    description: 'Leaning on a railing, looking down',
    genders: ['male', 'female', 'neutral'],
    scenes: ['urban', 'architecture'],
    angles: ['high_angle', 'eye_level'],
    joints: baseJoints().map((j, i) => {
      if (i === 6) return { ...j, x: -0.18, y: 0.3, z: 0.1 };
      if (i === 7) return { ...j, x: 0.18, y: 0.3, z: 0.1 };
      if (i === 8) return { ...j, x: 0, y: 0.5, z: 0.05 };
      if (i === 9) return { ...j, x: 0, y: 0.35, z: 0.08 };
      return j;
    }),
    tip: 'Foreground railing adds depth — include it in frame',
    score: 'Cinematic',
  },
  {
    id: 'looking_down',
    name: 'Looking Down from Height',
    category: 'urban',
    description: 'Looking down from a high vantage',
    genders: ['male', 'female', 'neutral'],
    scenes: ['urban', 'architecture', 'mountain'],
    angles: ['high_angle', 'bird_eye'],
    joints: baseJoints().map((j, i) => {
      if (i === 0) return { ...j, x: 0, y: 0.75, z: 0.1 };
      if (i === 14) return { ...j, x: -0.08, y: 0, z: 0 };
      return j;
    }),
    tip: 'Camera above, subject looks down — creates vulnerability and scale',
    score: 'Great for this scene ✦',
  },
  {
    id: 'pointing_landmark',
    name: 'Pointing at Landmark',
    category: 'urban',
    description: 'Pointing at a distant landmark',
    genders: ['male', 'female', 'neutral'],
    scenes: ['urban', 'architecture', 'mountain'],
    angles: ['eye_level', 'low_angle'],
    joints: baseJoints().map((j, i) => {
      if (i === 4) return { ...j, x: -0.35, y: 0.55, z: 0.1 };
      if (i === 6) return { ...j, x: -0.5, y: 0.4, z: 0.2 };
      if (i === 14) return { ...j, x: -0.04, y: 0, z: 0.02 };
      return j;
    }),
    tip: 'Point with your whole arm — bent elbows look tentative',
    score: 'Cinematic',
  },
  {
    id: 'candid_walk',
    name: 'Candid Walk',
    category: 'candid',
    description: 'Natural walking, looking straight',
    genders: ['male', 'female', 'neutral'],
    scenes: ['urban', 'street', 'nature'],
    angles: ['eye_level'],
    joints: baseJoints().map((j, i) => {
      if (i === 12) return { ...j, x: -0.12, y: 0.18, z: 0.08 };
      if (i === 13) return { ...j, x: 0.12, y: 0.22, z: -0.08 };
      if (i === 14) return { ...j, x: -0.12, y: 0, z: 0.12 };
      if (i === 15) return { ...j, x: 0.12, y: 0, z: -0.12 };
      if (i === 6) return { ...j, x: -0.2, y: 0.35, z: 0.03 };
      if (i === 7) return { ...j, x: 0.2, y: 0.38, z: -0.03 };
      return j;
    }),
    tip: 'Walk naturally — don\'t overthink the stride',
    score: 'Classic',
  },
];

export function getPosesByScene(scene: SceneType, gender: Gender): Pose[] {
  return POSES.filter(
    (pose) => pose.scenes.includes(scene) && pose.genders.includes(gender)
  );
}

export function getPosesByAngle(angle: CameraAngle): Pose[] {
  return POSES.filter((pose) => pose.angles.includes(angle));
}

export function getRecommendedPoses(
  scene: SceneType,
  angle: CameraAngle,
  gender: Gender
): Pose[] {
  const sceneMatch = getPosesByScene(scene, gender);
  const angleMatch = getPosesByAngle(angle);
  const intersection = sceneMatch.filter((p) => angleMatch.includes(p));
  const sceneOnly = sceneMatch.filter((p) => !angleMatch.includes(p));

  const sorted = [...intersection, ...sceneOnly];
  if (sorted.length < 3) {
    const genderMatch = POSES.filter(
      (p) => p.genders.includes(gender) && !sorted.includes(p)
    );
    sorted.push(...genderMatch.slice(0, 5 - sorted.length));
  }

  return sorted.slice(0, 10);
}

export const BONES: { start: string; end: string }[] = [
  { start: 'head', end: 'neck' },
  { start: 'neck', end: 'leftShoulder' },
  { start: 'neck', end: 'rightShoulder' },
  { start: 'leftShoulder', end: 'leftElbow' },
  { start: 'rightShoulder', end: 'rightElbow' },
  { start: 'leftElbow', end: 'leftHand' },
  { start: 'rightElbow', end: 'rightHand' },
  { start: 'neck', end: 'spine' },
  { start: 'spine', end: 'hip' },
  { start: 'hip', end: 'leftHip' },
  { start: 'hip', end: 'rightHip' },
  { start: 'leftHip', end: 'leftKnee' },
  { start: 'rightHip', end: 'rightKnee' },
  { start: 'leftKnee', end: 'leftFoot' },
  { start: 'rightKnee', end: 'rightFoot' },
];
