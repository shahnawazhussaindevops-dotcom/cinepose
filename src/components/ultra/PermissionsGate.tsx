import React, { useState } from 'react';

interface PermissionsGateProps {
  onStartCamera: () => Promise<boolean>;
  onComplete: (gender: 'male' | 'female' | 'neutral') => void;
}

export function PermissionsGate({ onStartCamera, onComplete }: PermissionsGateProps) {
  const [step, setStep] = useState<'welcome' | 'starting' | 'gender' | 'error'>('welcome');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'neutral' | null>(null);

  const handleOpenCamera = async () => {
    setStep('starting');
    const success = await onStartCamera();
    if (success) {
      setStep('gender');
    } else {
      setStep('error');
      setErrorMsg('Camera access was denied or unavailable. Please enable camera permissions in your browser settings and try again.');
    }
  };

  if (step === 'welcome') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#6EE7B7] flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(167,139,250,0.3)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-[#F9FAFB] mb-3">CinePose</h1>
        <p className="text-[#6B7280] text-center mb-2 max-w-xs leading-relaxed">AI-powered cinematic camera with 12 AI agents working in real-time.</p>
        <p className="text-[#4B5563] text-xs text-center mb-10 max-w-xs">All processing happens on your device. Zero uploads.</p>

        <button
          onClick={handleOpenCamera}
          className="w-full max-w-sm px-8 py-4 rounded-full bg-[#A78BFA] text-white font-semibold text-lg hover:bg-[#9678E8] transition-all glow-violet active:scale-[0.98]"
        >
          Open Camera
        </button>
        <p className="text-[10px] text-[#4B5563] mt-4">Requires camera access. Your privacy is protected.</p>
      </div>
    );
  }

  if (step === 'starting') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin mb-8" />
        <p className="text-[#F9FAFB] font-medium">Starting camera...</p>
        <p className="text-xs text-[#6B7280] mt-2">Please allow camera access when prompted</p>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#F9FAFB] mb-2">Camera Access Required</h2>
        <p className="text-sm text-[#6B7280] text-center mb-8 max-w-sm">{errorMsg}</p>
        <button
          onClick={handleOpenCamera}
          className="w-full max-w-sm px-8 py-3.5 rounded-full bg-[#A78BFA] text-white font-semibold hover:bg-[#9678E8] transition-all glow-violet"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Gender step
  return (
    <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center px-6">
      <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">You're live!</h2>
      <p className="text-[#6B7280] mb-8 text-center">Select your preference for pose recommendations</p>

      <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-10">
        {[
          { id: 'male' as const, icon: '♂', label: 'Male', desc: 'Masculine silhouettes' },
          { id: 'female' as const, icon: '♀', label: 'Female', desc: 'Feminine silhouettes' },
          { id: 'neutral' as const, icon: '⊹', label: 'Neutral', desc: 'Androgynous styles' },
        ].map((g) => (
          <button
            key={g.id}
            onClick={() => setGender(g.id)}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all ${
              gender === g.id
                ? 'bg-[#A78BFA]/20 border-[#A78BFA] shadow-[0_0_20px_rgba(167,139,250,0.2)]'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-3xl" style={{ color: gender === g.id ? '#A78BFA' : '#6B7280' }}>{g.icon}</span>
            <span className="text-sm font-medium text-[#F9FAFB]">{g.label}</span>
            <span className="text-[10px] text-[#6B7280]">{g.desc}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => gender && onComplete(gender)}
        disabled={!gender}
        className="w-full max-w-sm px-8 py-3.5 rounded-full bg-[#A78BFA] text-white font-semibold hover:bg-[#9678E8] transition-all glow-violet disabled:opacity-50"
      >
        Start Shooting
      </button>
    </div>
  );
}
