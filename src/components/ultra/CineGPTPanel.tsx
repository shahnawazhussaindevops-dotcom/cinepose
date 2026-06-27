import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { cineGPT } from '../../lib/ultra-ai/cineGPT';
import { useUltraStore } from '../../stores/ultraStore';

export function CineGPTPanel() {
  const { chatHistory, addChatMessage, setActiveMode, setCineGPTResponse, lastLocationType, lastMoodType } = useUltraStore();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleAsk = (question: string) => {
    if (!question.trim()) return;
    addChatMessage({ role: 'user', message: question });
    const response = cineGPT.ask(question, {
      location: lastLocationType,
      mood: lastMoodType,
      goldenHour: false,
    });
    setCineGPTResponse(response);
    addChatMessage({ role: 'ai', message: response.answer });
    setInput('');
    setShowSuggestions(false);
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute top-16 left-4 right-4 bottom-28 pointer-events-auto flex flex-col">
        <GlassCard padding="p-3" className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#6EE7B7]">CineGPT</span>
              <span className="text-[8px] text-[#6B7280]">AI Photography Assistant</span>
            </div>
            <button onClick={() => setActiveMode(null)} className="text-[#6B7280] text-[9px] px-2 py-0.5 rounded-full bg-white/5 hover:text-white">✕</button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0">
            {chatHistory.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-2xl block mb-2">🎬</span>
                <p className="text-[10px] text-[#6B7280]">Ask me anything about photography, posing, outfits, or cinematography!</p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 ${
                    msg.role === 'user' ? 'bg-[#A78BFA]/20 text-white' : 'bg-white/5 text-white/80'
                  }`}>
                    <p className="text-[10px] leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && chatHistory.length === 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 shrink-0">
              {['Best pose for beach sunset?', 'What outfit fits this location?', 'How to use golden hour?', 'Tips for video reels', 'Color grading advice'].map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(s)}
                  className="text-[8px] px-2 py-1 rounded-full bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk(input)}
              placeholder="Ask CineGPT..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-2 text-[10px] text-white placeholder:text-[#4B5563] outline-none focus:border-[#A78BFA]/50"
            />
            <button
              onClick={() => handleAsk(input)}
              disabled={!input.trim()}
              className="px-3 py-2 rounded-full bg-[#A78BFA] text-white text-[9px] font-medium disabled:opacity-50 hover:bg-[#9678E8] shrink-0"
            >
              Ask
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
