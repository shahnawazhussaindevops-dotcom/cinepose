import React, { useState, useEffect } from 'react';
import { checkCameraPermission, getCameraPermissionGuidance } from '../../lib/camera/permissions';
import { supportsMediaDevices, isSecureContext } from '../../lib/camera/mediaUtils';
import { cameraManager } from '../../lib/camera/CameraManager';

interface PermissionsGateProps {
  onStartCamera: () => Promise<boolean>;
  onComplete: (gender: 'male' | 'female' | 'neutral') => void;
  contextError?: string | null;
}

type GateStep = 'welcome' | 'checking-permission' | 'starting' | 'gender' | 'error' | 'unsupported';

export function PermissionsGate({ onStartCamera, onComplete, contextError }: PermissionsGateProps) {
  const [step, setStep] = useState<GateStep>('welcome');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'neutral' | null>(null);
  const [guidance, setGuidance] = useState<{ title: string; steps: string[]; icon: string } | null>(null);

  useEffect(() => {
    if (contextError) {
      setStep('error');
      setErrorMsg(contextError);
    }
  }, [contextError]);

  const checkSupport = (): string | null => {
    if (!isSecureContext()) {
      return 'Camera access requires a secure connection (HTTPS). Please access this site via HTTPS or localhost.';
    }
    if (!supportsMediaDevices()) {
      return 'Your browser does not support camera access. Please try using Chrome, Safari, or Firefox.';
    }
    return null;
  };

  const handleOpenCamera = async () => {
    const supportError = checkSupport();
    if (supportError) {
      setStep('unsupported');
      setErrorMsg(supportError);
      return;
    }

    setStep('checking-permission');
    const permCheck = await checkCameraPermission();

    if (permCheck.state === 'denied') {
      setStep('error');
      setErrorMsg(permCheck.error?.message || 'Camera access was denied.');
      const g = getCameraPermissionGuidance(permCheck.error!);
      setGuidance(g);
      return;
    }

    setStep('starting');
    const success = await onStartCamera();
    if (success) {
      if (typeof screen !== 'undefined' && 'orientation' in screen && typeof (screen.orientation as any).lock === 'function') {
        try { (screen.orientation as any).lock('portrait-primary'); } catch {}
      }
      if (typeof document !== 'undefined' && 'fullscreenElement' in document) {
        try { document.documentElement.requestFullscreen(); } catch {}
      }
      onComplete('neutral');
    } else {
      setStep('error');
      const diag = cameraManager.diagnostics;
      const msg = diag.error?.message || 'Camera access was denied or unavailable. Please enable camera permissions in your browser settings and try again.';
      setErrorMsg(msg);
      if (diag.error) {
        const g = getCameraPermissionGuidance(diag.error);
        setGuidance(g);
      }
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

  if (step === 'checking-permission') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin mb-8" />
        <p className="text-[#F9FAFB] font-medium">Checking camera permissions...</p>
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

  if (step === 'unsupported') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#F9FAFB] mb-2">Browser Not Supported</h2>
        <p className="text-sm text-[#6B7280] text-center mb-8 max-w-sm">{errorMsg}</p>
        <p className="text-xs text-[#4B5563] text-center">Please use a modern browser like Chrome, Safari, or Firefox with HTTPS.</p>
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
        <p className="text-sm text-[#6B7280] text-center mb-4 max-w-sm">{errorMsg}</p>

        {guidance && (
          <div className="bg-white/5 rounded-xl p-4 mb-6 max-w-sm w-full">
            <h3 className="text-sm font-medium text-[#F9FAFB] mb-2">{guidance.icon} {guidance.title}</h3>
            <ol className="text-xs text-[#6B7280] space-y-1">
              {guidance.steps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#A78BFA] shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <button
          onClick={handleOpenCamera}
          className="w-full max-w-sm px-8 py-3.5 rounded-full bg-[#A78BFA] text-white font-semibold hover:bg-[#9678E8] transition-all glow-violet"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin mb-8" />
      <p className="text-[#F9FAFB] font-medium">Ready!</p>
    </div>
  );
}
