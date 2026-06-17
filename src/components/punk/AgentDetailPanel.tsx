import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { agentDefinitions } from '../../lib/llm/agentDefinitions';
import { usePunkAIContext } from '../../lib/llm/punkAIContext';
import type { AgentID } from '../../lib/llm/types';

const ALL_AGENT_IDS: AgentID[] = [
  'photographer', 'cinematographer', 'outfit_analyst', 'location_intel',
  'director_vision', 'hollywood_director', 'cinegpt', 'reel_generator',
  'mood_detector', 'pose_projector', 'human_clone', 'scene_analyzer',
];

export function AgentDetailPanel() {
  const { activeAgents, setActiveAgents, agentResult } = usePunkAIContext();

  const llmAgentMap = new Map(
    (agentResult?.llmAgents || []).map(a => [a.agentId, a]),
  );

  return (
    <div className="space-y-3">
      <GlassCard padding="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#A78BFA] tracking-wider">AI AGENT SYSTEM</h3>
          <span className="text-[9px] text-[#6B7280]">
            {agentResult?.usingLLM ? '🧠 LLM Powered' : '⚙️ Rule-Based'}
          </span>
        </div>

        <p className="text-[9px] text-[#6B7280] mb-3 leading-relaxed">
          12 specialized agents collaborating via event bus. Each agent has defined work, learning mechanism, and performance metrics.
        </p>

        {agentResult?.llmResponse && (
          <div className="mb-3 p-2 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/20">
            <p className="text-[9px] text-[#A78BFA] font-medium mb-1">Director's Analysis</p>
            <p className="text-[9px] text-white/70 leading-relaxed">{agentResult.llmResponse.sceneSummary}</p>
            <p className="text-[8px] text-[#6B7280] mt-1">Mood: {agentResult.llmResponse.mood} · Style: {agentResult.llmResponse.styleSuggestion}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-2">
          {ALL_AGENT_IDS.map(aid => {
            const def = agentDefinitions.get(aid);
            if (!def) return null;
            const llmInfo = llmAgentMap.get(aid);
            const isActive = activeAgents.includes(aid);
            return (
              <button
                key={aid}
                onClick={() => {
                  if (isActive) {
                    setActiveAgents(activeAgents.filter(a => a !== aid));
                  } else {
                    setActiveAgents([...activeAgents, aid]);
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-medium transition-all ${
                  isActive
                    ? 'bg-white/15 border border-white/20 text-white'
                    : 'bg-white/5 border border-white/5 text-[#6B7280] hover:text-white/70'
                }`}
                title={def.name}
              >
                <span>{def.icon}</span>
                <span>{def.name.split(' ')[0]}</span>
                {llmInfo && <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]" />}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Active Agent Details */}
      {activeAgents.map(aid => {
        const def = agentDefinitions.get(aid);
        if (!def) return null;
        const llmInfo = llmAgentMap.get(aid);
        return (
          <GlassCard key={aid} padding="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{def.icon}</span>
              <div className="flex-1">
                <h4 className="text-[10px] font-bold text-white">{def.name}</h4>
                <p className="text-[8px] text-[#6B7280]">{def.work.role}</p>
              </div>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 rounded text-[7px] font-mono bg-[#6EE7B7]/10 text-[#6EE7B7]">
                  ID: {aid}
                </span>
              </div>
            </div>

            {/* LLM Instruction */}
            {llmInfo && (
              <div className="mb-2 p-2 rounded-lg bg-[#6EE7B7]/5 border border-[#6EE7B7]/10">
                <p className="text-[8px] text-[#6EE7B7] font-medium mb-1">🧠 DIRECTOR INSTRUCTION</p>
                <p className="text-[9px] text-white/70 mb-1"><span className="text-[#A78BFA]">Work:</span> {llmInfo.work}</p>
                <p className="text-[9px] text-white/70 mb-1"><span className="text-[#F472B6]">Learn:</span> {llmInfo.learn}</p>
                <p className="text-[9px] text-white/70"><span className="text-[#22D3EE]">Perform:</span> {llmInfo.perform}</p>
                {llmInfo.action && (
                  <p className="text-[8px] text-[#6EE7B7] mt-1">→ {llmInfo.action}</p>
                )}
              </div>
            )}

            {/* Agent Work */}
            <div className="mb-2">
              <p className="text-[8px] text-[#A78BFA] font-medium mb-1">📋 WORK</p>
              <ul className="space-y-0.5">
                {def.work.responsibilities.slice(0, 3).map((r, i) => (
                  <li key={i} className="text-[8px] text-white/50 flex items-start gap-1">
                    <span className="text-[#6B7280] mt-0.5">›</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Agent Learn */}
            <div className="mb-2">
              <p className="text-[8px] text-[#F472B6] font-medium mb-1">📚 LEARN</p>
              <p className="text-[8px] text-white/50 mb-0.5">Method: {def.learn.method}</p>
              <p className="text-[8px] text-white/50">Feedback: {def.learn.feedbackLoop}</p>
            </div>

            {/* Agent Perform */}
            <div>
              <p className="text-[8px] text-[#22D3EE] font-medium mb-1">📊 PERFORM</p>
              <div className="flex flex-wrap gap-1">
                {def.perform.successMetrics.slice(0, 2).map((m, i) => (
                  <span key={i} className="px-1 py-0.5 rounded text-[7px] bg-white/5 text-[#6B7280]">
                    {m}
                  </span>
                ))}
              </div>
              <p className="text-[7px] text-[#6B7280] mt-1">Latency: {def.perform.latencyExpectation}</p>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
