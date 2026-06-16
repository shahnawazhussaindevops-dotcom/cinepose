export type Gender = 'male' | 'female' | 'neutral';
export type SceneType = 'urban' | 'nature' | 'indoor' | 'beach' | 'mountain' | 'street' | 'architecture';
export type CameraAngle = 'eye_level' | 'low_angle' | 'high_angle' | 'bird_eye' | 'overhead';

export interface JointPosition {
  name: string;
  x: number;
  y: number;
  z: number;
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
}

export type PoseCategory =
  | 'portrait' | 'travel' | 'fashion' | 'luxury' | 'couple' | 'family'
  | 'solo' | 'street' | 'nature' | 'beach' | 'mountain' | 'sunset'
  | 'rooftop' | 'cafe' | 'car' | 'bike' | 'drone' | 'fitness'
  | 'lifestyle' | 'influencer' | 'wedding' | 'cinematic_hero'
  | 'editorial_magazine' | 'business_professional';

export type StyleTab =
  | 'Aesthetic' | 'Cinematic' | 'Lovely' | 'Natural' | 'Travel'
  | 'Street' | 'Luxury' | 'Fashion' | 'Editorial' | 'Hero'
  | 'Minimal' | 'Cute' | 'Adventure' | 'Creative' | 'Drone'
  | 'Couple' | 'Wedding' | 'InstagramTrend' | 'PinterestTrend'
  | 'Viral' | 'Vintage' | 'Retro' | 'Moody' | 'Dark'
  | 'Bright' | 'Professional' | 'Business' | 'Fitness';

export interface SceneContext {
  locationType: string;
  weather: string;
  lightingDirection: string;
  isGoldenHour: boolean;
  isBlueHour: boolean;
  indoorLighting: string;
  artificialLighting: string;
  backgroundDepth: number;
  subjectDistance: number;
  cameraAngle: CameraAngleType;
  cameraHeight: number;
  focalLength: number;
  environmentMood: string;
  timeOfDay: string;
  temperature: number;
}

export type CameraAngleType = 'eye_level' | 'low_angle' | 'high_angle' | 'bird_eye' | 'overhead' | 'dutch_angle' | 'worm_eye';

export interface PoseScore {
  poseId: string;
  poseName: string;
  overallScore: number;
  poseMatchScore: number;
  lightingScore: number;
  backgroundScore: number;
  compositionScore: number;
  trendScore: number;
  comfortScore: number;
  uniquenessScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
  comfort: 'comfortable' | 'moderate' | 'strenuous';
  explanation: string;
  cameraInstructions: string;
  lightingInstructions: string;
  expectedResult: string;
  engagementPotential: number;
}

export interface DirectorInstruction {
  type: 'turn' | 'look' | 'step' | 'relax' | 'move' | 'tilt' | 'shift' | 'breathe' | 'angle';
  target: string;
  value: string;
  description: string;
  order: number;
}

export interface TrendData {
  category: string;
  trendingPoses: string[];
  popularAngles: string[];
  recommendedFraming: string;
  engagement: number;
  hashtags: string[];
  season: string;
}

export interface SceneAnalysisResult {
  bestPoses: PoseScore[];
  bestCameraAngle: string;
  bestLensSuggestion: string;
  bestFraming: string;
  bestSubjectPlacement: string;
  directorInstructions: DirectorInstruction[];
  trends: TrendData[];
  overallMood: string;
  styleSuggestion: StyleTab;
}
