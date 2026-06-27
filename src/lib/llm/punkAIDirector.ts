import { queryGeminiDirector } from './geminiClient';
import { sceneEngine } from '../punk-ai/sceneUnderstanding';
import { poseScoring } from '../punk-ai/poseScoring';
import { aiDirector } from '../punk-ai/director';
import { trendEngine } from '../punk-ai/trendEngine';
import type {
  AIDirectorResponse, AgentInstruction, LLMContext, SceneInput, UserContext, AgentID,
} from './types';
import type { StyleTab, PoseScore, DirectorInstruction, TrendData, SceneContext } from '../punk-ai/types';

export type AgentResult = {
  sceneContext: SceneContext | null;
  topPoses: PoseScore[];
  directorInstructions: DirectorInstruction[];
  trends: TrendData[];
  llmResponse: AIDirectorResponse | null;
  usingLLM: boolean;
  llmAgents: AgentInstruction[];
};

export class PunkAIDirector {
  private lastSceneInput: SceneInput | null = null;
  private lastUserContext: UserContext | null = null;
  private lastResult: AgentResult | null = null;
  private llmEnabled = true;

  setLLMEnabled(enabled: boolean) {
    this.llmEnabled = enabled;
  }

  isLLMEnabled(): boolean {
    return this.llmEnabled;
  }

  getLastResult(): AgentResult | null {
    return this.lastResult;
  }

  async analyze(
    sceneInput: SceneInput | null,
    userContext: UserContext | null,
    activeAgents: AgentID[] = ['scene_analyzer'],
  ): Promise<AgentResult> {
    this.lastSceneInput = sceneInput || this.lastSceneInput;
    this.lastUserContext = userContext || this.lastUserContext;

    const lCtx = this.lastSceneInput;
    const uCtx = this.lastUserContext;

    const ruleResult = this.runRuleBasedAnalysis(lCtx, uCtx);

    if (!this.llmEnabled || !lCtx || !uCtx) {
      this.lastResult = { ...ruleResult, llmResponse: null, usingLLM: false, llmAgents: [] };
      return this.lastResult;
    }

    const llmCtx: LLMContext = {
      scene: lCtx,
      user: uCtx,
      activeAgents,
      timestamp: Date.now(),
    };

    const llmResponse = await queryGeminiDirector(llmCtx);

    const result: AgentResult = {
      ...ruleResult,
      llmResponse,
      usingLLM: !!llmResponse,
      llmAgents: llmResponse?.agents || [],
    };

    this.lastResult = result;
    return result;
  }

  private runRuleBasedAnalysis(
    sceneInput: SceneInput | null,
    _userContext: UserContext | null,
  ) {
    const result = {
      sceneContext: null as SceneContext | null,
      topPoses: [] as PoseScore[],
      directorInstructions: [] as DirectorInstruction[],
      trends: [] as TrendData[],
    };

    if (!sceneInput) return result;

    try {
      const raw = sceneEngine.analyzeScene(
        sceneInput.luminance,
        sceneInput.temperature,
        0, false, false, false, 0, 0,
      );
      result.sceneContext = raw;

      result.topPoses = poseScoring.getTopPoses(
        raw,
        (_userContext?.selectedStyle as StyleTab) || 'Cinematic',
        5,
      );

      if (result.topPoses.length > 0) {
        result.directorInstructions = aiDirector.generateInstructions(result.topPoses[0], raw);
      }

      result.trends = trendEngine.getTrendsForScene(raw);
    } catch (e) {
      console.warn('Rule-based analysis failed:', e);
    }

    return result;
  }
}

export const punkAIDirector = new PunkAIDirector();
