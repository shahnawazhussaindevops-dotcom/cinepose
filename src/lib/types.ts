export type Gender = 'male' | 'female' | 'neutral';

export type SceneType = 'urban' | 'nature' | 'indoor' | 'beach' | 'mountain' | 'street' | 'architecture';
export type LightingCondition = 'bright_daylight' | 'golden_hour' | 'blue_hour' | 'overcast' | 'indoor_low_light' | 'harsh_midday' | 'indoor_tungsten' | 'indoor_fluorescent' | 'backlit' | 'side_lit' | 'front_lit';
export type CameraAngle = 'eye_level' | 'low_angle' | 'high_angle' | 'bird_eye' | 'overhead';

export interface SceneAnalysis {
  sceneType: SceneType;
  lighting: LightingCondition;
  cameraAngle: CameraAngle;
  mood?: string;
  temperature?: number;
  luminance?: number;
}

export interface PoseTip {
  pose: string;
  tip: string;
  score?: string;
  compositionTip?: string;
}

export interface ClaudeResponse {
  scene_type: string;
  lighting: string;
  mood: string;
  poses: string[];
  composition_tip: string;
}

export interface LUTPreset {
  id: string;
  name: string;
  inspiredBy: string;
  tone: string;
  intensity: number;
  colors: LUTColorTransform;
}

export interface LUTColorTransform {
  shadows: [number, number, number];
  mids: [number, number, number];
  highlights: [number, number, number];
  saturation: number;
  contrast: number;
  temperature: number;
  tint: number;
}

export interface ProColorControls {
  exposure: number;
  highlights: number;
  shadows: number;
  contrast: number;
  temperature: number;
  tint: number;
  vibrance: number;
  saturation: number;
  vignette: number;
  grain: number;
  hueShift: [number, number, number, number, number, number];
  satShift: [number, number, number, number, number, number];
  lumShift: [number, number, number, number, number, number];
  lift: [number, number, number];
  gamma: [number, number, number];
  gain: [number, number, number];
}

export interface Pose {
  id: string;
  name: string;
  category: PoseCategory;
  description: string;
  genders: Gender[];
  scenes: SceneType[];
  angles: CameraAngle[];
  joints: JointPosition[];
  tip?: string;
  score?: string;
}

export type PoseCategory = 'standing' | 'urban' | 'nature' | 'mountain' | 'sitting' | 'lying' | 'candid' | 'action';

export interface JointPosition {
  name: string;
  x: number;
  y: number;
  z: number;
}

export interface Bone {
  start: string;
  end: string;
}

export interface HumanoidConfig {
  gender: Gender;
  shoulderWidth: number;
  hipWidth: number;
  scale: number;
  color: string;
  emissive: string;
  opacity: number;
}

export interface GalleryPhoto {
  id: string;
  uri: string;
  thumbnail: string;
  lut: string;
  date: number;
  width: number;
  height: number;
}

export interface DroneModeConfig {
  active: boolean;
  subMode: 'frame_overlay' | 'cinematic_guide';
  keyframes: DroneKeyframe[];
  currentStep: number;
}

export interface DroneKeyframe {
  position: [number, number, number];
  rotation: [number, number, number];
  duration: number;
  label: string;
}

export interface LightingData {
  condition: LightingCondition;
  averageLuminance: number;
  colorTemperature: number;
  shadowClip: number;
  highlightClip: number;
  histogramSpread: number;
  timeRemaining?: number;
  suggestion?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  language: string;
  gender: Gender;
  gridOverlay: 'off' | 'rule_of_thirds' | 'golden_ratio' | 'square' | 'phi';
  focusPeaking: boolean;
  histogram: boolean;
  levelIndicator: boolean;
  timerDelay: number;
  burstMode: boolean;
  cloudBackup: boolean;
  haptics: boolean;
  showTutorial: boolean;
  telemetry: boolean;
}

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  genderSelected: boolean;
  permissionsGranted: boolean;
}

export type PermissionType = 'camera' | 'microphone' | 'storage' | 'location';

export interface PermissionState {
  camera: boolean;
  microphone: boolean;
  storage: boolean;
  location: boolean;
}
