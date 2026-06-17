export type AgentID =
  | 'photographer'
  | 'cinematographer'
  | 'outfit_analyst'
  | 'location_intel'
  | 'director_vision'
  | 'hollywood_director'
  | 'cinegpt'
  | 'reel_generator'
  | 'mood_detector'
  | 'pose_projector'
  | 'human_clone'
  | 'scene_analyzer';

export type AgentWork = {
  role: string;
  responsibilities: string[];
  tools: string[];
};

export type AgentLearn = {
  method: string;
  dataSources: string[];
  adaptation: string;
  feedbackLoop: string;
};

export type AgentPerform = {
  successMetrics: string[];
  evaluationCriteria: string[];
  outputFormat: string;
  latencyExpectation: string;
};

export type AgentMemory = {
  shortTerm: { key: string; value: string }[];
  longTerm: { key: string; value: string; timestamp: number }[];
};

export interface AgentDefinition {
  id: AgentID;
  name: string;
  icon: string;
  color: string;
  work: AgentWork;
  learn: AgentLearn;
  perform: AgentPerform;
  memory: AgentMemory;
  isActive: boolean;
}

export type SceneInput = {
  luminance: number;
  temperature: number;
  isGoldenHour: boolean;
  isBacklit: boolean;
  tiltAngle: number;
  cameraAngle: string;
  locationType: string;
  weather: string;
  timeOfDay: string;
};

export type UserContext = {
  selectedGender: 'male' | 'female' | 'neutral' | null;
  selectedStyle: string;
  preferredFacingMode: string;
  recentFeedback: string[];
  sessionHistory: string[];
};

export interface LLMContext {
  scene: SceneInput;
  user: UserContext;
  activeAgents: AgentID[];
  timestamp: number;
}

export interface AgentInstruction {
  agentId: AgentID;
  work: string;
  learn: string;
  perform: string;
  action: string;
  output: Record<string, unknown>;
  confidence: number;
}

export interface AIDirectorResponse {
  sceneSummary: string;
  mood: string;
  agents: AgentInstruction[];
  styleSuggestion: string;
  directorSteps: { step: number; instruction: string; target: string }[];
  overallAdvice: string;
}

export interface LLMCacheEntry {
  key: string;
  response: AIDirectorResponse;
  timestamp: number;
}

export const ALL_AGENTS: AgentID[] = [
  'photographer',
  'cinematographer',
  'outfit_analyst',
  'location_intel',
  'director_vision',
  'hollywood_director',
  'cinegpt',
  'reel_generator',
  'mood_detector',
  'pose_projector',
  'human_clone',
  'scene_analyzer',
];
