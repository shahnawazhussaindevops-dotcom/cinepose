import React, { useState, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';

interface PermissionsGateProps {
  onComplete: () => void;
}

export function PermissionsGate({ onComplete }: PermissionsGateProps) {
  const { permissions, setPermission, completeOnboarding } = useAppStore();
  const [step, setStep] = useState<'permissions' | 'gender' | 'tutorial'>('permissions');
  const [gender, setGender] = useState<'male' | 'female' | 'neutral' | null>(null);
  const [loading, setLoading] = useState(false);

  const requestCamera = useCallback(async () => {
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      stream.getTracks().forEach(t => t.stop());
      setPermission('camera', true);
      setPermission('microphone', true);
    } catch {
      setPermission('camera', false);
      setPermission('microphone', false);
    }
    setLoading(false);
  }, [setPermission]);

  const requestLocation = useCallback(async () => {
    try {
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => { setPermission('location', true); resolve(); },
          () => { setPermission('location', false); resolve(); },
          { timeout: 3000 }
        );
      });
    } catch {
      setPermission('location', false);
    }
  }, [setPermission]);

  const handleContinue = useCallback(async () => {
    if (step === 'permissions') {
      await requestCamera();
      await requestLocation();
      setPermission('storage', true);
      setStep('gender');
    } else if (step === 'gender') {
      completeOnboarding();
      onComplete();
    }
  }, [step, requestCamera, requestLocation, setPermission, completeOnboarding, onComplete]);

  if (step === 'permissions') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#6EE7B7] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(167,139,250,0.3)]">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#F9FAFB] mb-3">CinePose</h1>
        <p className="text-[#6B7280] text-center mb-10 max-w-xs">I need a few permissions to turn your phone into a pro cinema camera.</p>

        <div className="w-full max-w-sm space-y-3 mb-10">
          <div className="flex items-center gap-4 glass rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.5">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#F9FAFB]">Camera & Microphone</p>
              <p className="text-xs text-[#6B7280]">Capture photos and video</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${permissions.camera ? 'border-[#6EE7B7] bg-[#6EE7B7]/20' : 'border-white/20'}`}>
              {permissions.camera && <div className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />}
            </div>
          </div>

          <div className="flex items-center gap-4 glass rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-[#6EE7B7]/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#F9FAFB]">Location</p>
              <p className="text-xs text-[#6B7280]">Scene-aware AI suggestions</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${permissions.location ? 'border-[#6EE7B7] bg-[#6EE7B7]/20' : 'border-white/20'}`}>
              {permissions.location && <div className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />}
            </div>
          </div>

          <div className="flex items-center gap-4 glass rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-[#FB923C]/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#F9FAFB]">Storage</p>
              <p className="text-xs text-[#6B7280]">Save your photos locally</p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-[#6EE7B7] bg-[#6EE7B7]/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />
            </div>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full max-w-sm px-8 py-3.5 rounded-full bg-[#A78BFA] text-white font-semibold hover:bg-[#9678E8] transition-all glow-violet disabled:opacity-50"
        >
          {loading ? 'Requesting Permissions...' : 'Enable & Continue'}
        </button>
        <p className="text-xs text-[#4B5563] mt-4 text-center max-w-xs">Your privacy matters. All AI runs on-device. No data leaves your phone without your permission.</p>
      </div>
    );
  }

  if (step === 'gender') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">Tell me about you</h2>
        <p className="text-[#6B7280] mb-10 text-center">This helps me recommend the perfect poses</p>

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
                  : 'glass border-white/5 hover:border-white/20'
              }`}
            >
              <span className="text-3xl" style={{ color: gender === g.id ? '#A78BFA' : '#6B7280' }}>{g.icon}</span>
              <span className="text-sm font-medium text-[#F9FAFB]">{g.label}</span>
              <span className="text-[10px] text-[#6B7280]">{g.desc}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!gender}
          className="w-full max-w-sm px-8 py-3.5 rounded-full bg-[#A78BFA] text-white font-semibold hover:bg-[#9678E8] transition-all glow-violet disabled:opacity-50"
        >
          Get Started
        </button>
      </div>
    );
  }

  return null;
}
