export type Gender = 'male' | 'female' | 'neutral';

export type LocationType =
  | 'beach' | 'mountain' | 'cafe' | 'street' | 'city' | 'forest' | 'desert'
  | 'lake' | 'luxury_property' | 'sunset_point' | 'historical_place'
  | 'rooftop' | 'garden' | 'indoor_studio' | 'pool' | 'waterfall'
  | 'snow' | 'night_club' | 'restaurant' | 'hotel_room' | 'unknown';

export type MoodType =
  | 'luxury' | 'adventure' | 'romantic' | 'happy' | 'confident' | 'professional'
  | 'calm' | 'energetic' | 'dreamy' | 'cinematic' | 'mysterious' | 'edgy'
  | 'vintage' | 'minimal' | 'bold' | 'soft' | 'dramatic' | 'nostalgic'
  | 'natural';

export type ShotType =
  | 'tracking_shot' | 'push_in' | 'pull_out' | 'orbit_shot' | 'hero_shot'
  | 'reveal_shot' | 'low_angle_shot' | 'high_angle_shot' | 'drone_style'
  | 'pov_shot' | 'overhead_shot' | 'dolly_zoom' | 'whip_pan' | 'slide_shot';

export type SceneTypeAI =
  | 'epic_arrival' | 'adventure_discovery' | 'luxury_lifestyle' | 'hero_introduction'
  | 'road_journey' | 'romantic_sunset' | 'dream_sequence' | 'travel_documentary'
  | 'motivational_success' | 'cinematic_walking' | 'editorial_spread'
  | 'street_candid' | 'golden_hour_portrait' | 'night_cinematography'
  | 'urban_editorial' | 'intimate_portrait' | 'mystery_noir';

export interface PhotographerAnalysis {
  qualityScore: number;
  compositionScore: number;
  poseScore: number;
  socialScore: number;
  eyeDetection: { eyesOpen: boolean; blinkDetected: boolean };
  blurDetected: boolean;
  unwantedObjects: string[];
  suggestions: string[];
  liveGuidance: string[];
}

export interface CinematographerPlan {
  shotType: ShotType;
  cameraMovement: string;
  subjectPosition: string;
  direction: string;
  duration: number;
  description: string;
  liveInstructions: string[];
  expectedResult: string;
}

export interface OutfitAnalysis {
  currentColors: string[];
  recommendedColors: string[];
  recommendedOutfit: string;
  recommendedAccessories: string[];
  recommendedFootwear: string;
  outfitMatchScore: number;
  explanation: string;
}

export interface LocationScore {
  cinematic: number;
  instagram: number;
  travel: number;
  romantic: number;
  luxury: number;
  drone: number;
  sunset: number;
}

export interface LocationAnalysis {
  locationType: LocationType;
  locationName: string;
  scores: LocationScore;
  weather: string;
  bestTimeToShoot: string;
  tips: string[];
}

export interface DirectorVisionResult {
  storyType: string;
  storytellingPotential: string;
  foregroundElements: string[];
  backgroundElements: string[];
  depthAnalysis: string;
  colorPalette: string[];
  atmosphere: string;
  visualTheme: string;
  suggestion: string;
}

export interface HollywoodScene {
  sceneType: SceneTypeAI;
  cameraPosition: string;
  subjectPosition: string;
  movementDirection: string;
  facialExpression: string;
  handPosition: string;
  walkingSpeed: string;
  shotDuration: number;
  expectedResult: string;
  directionSteps: string[];
}

export interface MoodResult {
  primary: MoodType;
  secondary: MoodType[];
  confidence: number;
  expression: string;
  bodyLanguage: string;
  adaptivePose: string;
  adaptiveDirection: string;
}

export interface MasterSceneResult {
  location: LocationAnalysis;
  weather: string;
  lighting: string;
  composition: string;
  humanPosition: string;
  background: string;
  mood: string;
  bestPose: string;
  bestCameraAngle: string;
  bestLens: string;
  bestColorGrade: string;
  bestLUT: string;
  bestStorytellingConcept: string;
  bestReelIdea: string;
  bestThumbnailIdea: string;
  bestHollywoodDirection: string;
  overallRecommendation: string;
}

export interface ReelPlan {
  shotSequence: string[];
  musicSuggestions: string[];
  transitions: string[];
  textOverlays: string[];
  colorGrading: string;
  duration: number;
  format: 'instagram_reels' | 'youtube_shorts' | 'tiktok' | 'facebook_reels' | 'travel_vlog' | 'luxury_content';
  estimatedEngagement: number;
}

export interface CineGPTResponse {
  answer: string;
  suggestions: string[];
  confidence: number;
}

export interface TrendSource {
  platform: 'instagram' | 'pinterest';
  trendName: string;
  engagement: number;
  hashtags: string[];
  season: string;
  styleTags: string[];
  poseCategories: string[];
  colorPalettes: string[];
  sampleUrls: string[];
}
