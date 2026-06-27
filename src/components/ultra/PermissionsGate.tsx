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

function GateIcon({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'error' }) {
  const bg = variant === 'error'
    ? 'bg-gradient-to-br from-[#EF4444]/20 to-[#EF4444]/5 border-red-500/20'
    : 'bg-gradient-to-br from-[#A78BFA]/20 via-[#6EE7B7]/10 to-[#22D3EE]/20 border-white/10';
  return (
    <div className={`w-20 h-20 rounded-[1.25rem] ${bg} flex items-center justify-center border mb-8`}>
      {children}
    </div>
  );
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl backdrop-blur-xl bg-black/40 border border-white/10 ${className}`}>
      {children}
    </div>
  );
}

export function PermissionsGate({ onStartCamera, onComplete, contextError }: PermissionsGateProps) {
  const [step, setStep] = useState<GateStep>('welcome');
  const [errorMsg, setErrorMsg] = useState<string>('');
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

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      console.log('[PermissionsGate] Mobile detected, starting camera directly');
      setStep('starting');
      const success = await onStartCamera();
      if (success) {
        console.log('[PermissionsGate] Camera started successfully');
        if (typeof screen !== 'undefined' && 'orientation' in screen && typeof (screen.orientation as any).lock === 'function') {
          try { (screen.orientation as any).lock('portrait-primary').catch(() => {}); } catch {}
        }
        onComplete('neutral');
      } else {
        console.error('[PermissionsGate] Camera start failed');
        setStep('error');
        const diag = cameraManager.diagnostics;
        const msg = diag.error?.message || 'Could not access camera. Please check permissions and try again.';
        setErrorMsg(msg);
        if (diag.error) {
          const g = getCameraPermissionGuidance(diag.error);
          setGuidance(g);
        }
      }
      return;
    }

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
        try { (screen.orientation as any).lock('portrait-primary').catch(() => {}); } catch {}
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
      <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center p-6">
        <GlassCard className="w-full max-w-sm p-8 flex flex-col items-center text-center">
          <GateIcon>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#cam-gradient)" strokeWidth="1.2">
              <defs>
                <linearGradient id="cam-gradient" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#6EE7B7" />
                </linearGradient>
              </defs>
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </GateIcon>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Cinepose</h1>
          <p className="text-sm text-zinc-400 leading-relaxed mb-1">
            AI-powered cinematic camera with 12 AI agents working in real-time.
          </p>
          <p className="text-xs text-zinc-500 mb-8">
            All processing stays on your device. Zero uploads.
          </p>

          <button
            onClick={handleOpenCamera}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] shadow-[0_0_24px_rgba(167,139,250,0.25)]"
          >
            Open Camera
          </button>

          <p className="text-[10px] text-zinc-500 mt-4 tracking-wide">
            Camera access required to start
          </p>
        </GlassCard>
      </div>
    );
  }

  if (step === 'checking-permission' || step === 'starting' || step === 'gender') {
    const label = step === 'checking-permission'
      ? 'Checking camera permissions'
      : step === 'starting'
      ? 'Starting camera'
      : 'Ready';
    return (
      <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center p-6">
        <GlassCard className="w-full max-w-sm p-8 flex flex-col items-center text-center">
          <div className="relative w-14 h-14 mb-6">
            <div className="absolute inset-0 border-2 border-[#A78BFA]/30 border-t-[#A78BFA] rounded-full animate-spin" />
            <div className="absolute inset-1 border-2 border-[#6EE7B7]/20 border-b-[#6EE7B7] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <p className="text-sm font-medium text-white">{label}...</p>
          {step === 'starting' && (
            <>
              <p className="text-xs text-zinc-500 mt-2">Please allow camera access when prompted</p>
              <button
                onClick={() => {
                  setStep('welcome');
                  setTimeout(() => handleOpenCamera(), 100);
                }}
                className="mt-6 px-5 py-2 rounded-lg bg-white/5 text-zinc-400 text-xs font-medium hover:bg-white/10 transition-colors"
              >
                Taking too long? Tap to retry
              </button>
            </>
          )}
        </GlassCard>
      </div>
    );
  }

  if (step === 'unsupported') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center p-6">
        <GlassCard className="w-full max-w-sm p-8 flex flex-col items-center text-center">
          <GateIcon variant="error">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </GateIcon>
          <h2 className="text-lg font-semibold text-white mb-2">Browser Not Supported</h2>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">{errorMsg}</p>
          <p className="text-xs text-zinc-500">Please use Chrome, Safari, or Firefox with HTTPS.</p>
        </GlassCard>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D0D1A] flex flex-col items-center justify-center p-6">
        <GlassCard className="w-full max-w-sm p-8 flex flex-col items-center text-center">
          <GateIcon variant="error">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </GateIcon>
          <h2 className="text-lg font-semibold text-white mb-2">Camera Access Required</h2>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">{errorMsg}</p>

          {guidance && (
            <div className="w-full rounded-xl bg-white/5 p-4 mb-6 text-left">
              <h3 className="text-xs font-semibold text-zinc-300 mb-2 tracking-wide">{guidance.icon} {guidance.title}</h3>
              <ol className="space-y-1">
                {guidance.steps.map((s, i) => (
                  <li key={i} className="flex gap-2 text-xs text-zinc-500">
                    <span className="text-[#A78BFA] shrink-0 w-3.5 text-right">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="w-full space-y-2">
            <button
              onClick={handleOpenCamera}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(167,139,250,0.2)]"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded-xl bg-white/5 text-zinc-400 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Reload Page
            </button>
          </div>

          <p className="text-[10px] text-zinc-500 mt-4 max-w-xs leading-relaxed">
            Still not working? Try: Settings → Apps → Chrome → Permissions → Camera → Allow
          </p>
        </GlassCard>
      </div>
    );
  }

  return null;
}
