import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { CameraProvider, useCameraContext } from '../../lib/CameraContext';
import { CameraFeed } from '../camera/CameraFeed';
import { ShutterButton } from '../camera/ShutterButton';
import { LUTPicker } from '../lut/LUTPicker';
import { LightingBadge } from '../lighting/LightingBadge';
import { HumanoidRobot } from '../pose/HumanoidRobot';
import { PoseControls } from '../pose/PoseControls';
import { GenderSelector } from '../pose/GenderSelector';
import { DroneGuide } from '../drone/DroneGuide';
import { PUNKOverlay } from '../punk/PUNKOverlay';
import { BottomSheet } from '../ui/BottomSheet';
import { Toast } from '../ui/Toast';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { PermissionsGate } from './PermissionsGate';
import { MoodDetectionBadge } from './MoodDetectionBadge';
import { PunkScanningUI } from '../punk/PunkScanningUI';

const AIPhotographerPanel = lazy(() => import('./AIPhotographerPanel').then(m => ({ default: m.AIPhotographerPanel })));
const AICinematographerPanel = lazy(() => import('./AICinematographerPanel').then(m => ({ default: m.AICinematographerPanel })));
const AIOutfitPanel = lazy(() => import('./AIOutfitPanel').then(m => ({ default: m.AIOutfitPanel })));
const AILocationPanel = lazy(() => import('./AILocationPanel').then(m => ({ default: m.AILocationPanel })));
const DirectorVisionPanel = lazy(() => import('./DirectorVisionPanel').then(m => ({ default: m.DirectorVisionPanel })));
const HollywoodDirectorPanel = lazy(() => import('./HollywoodDirectorPanel').then(m => ({ default: m.HollywoodDirectorPanel })));
const CineGPTPanel = lazy(() => import('./CineGPTPanel').then(m => ({ default: m.CineGPTPanel })));
const AIReelGeneratorPanel = lazy(() => import('./AIReelGeneratorPanel').then(m => ({ default: m.AIReelGeneratorPanel })));
const MasterScenePanel = lazy(() => import('./MasterScenePanel').then(m => ({ default: m.MasterScenePanel })));
const TrendPanel = lazy(() => import('./TrendPanel').then(m => ({ default: m.TrendPanel })));
const ARPoseProjection = lazy(() => import('./ARPoseProjection').then(m => ({ default: m.ARPoseProjection })));
const AIHumanClonePanel = lazy(() => import('./AIHumanClonePanel').then(m => ({ default: m.AIHumanClonePanel })));
import { useCameraStore } from '../../stores/cameraStore';
import { usePoseStore } from '../../stores/poseStore';
import { useLUTStore } from '../../stores/lutStore';
import { useAppStore } from '../../stores/appStore';
import { useUltraStore } from '../../stores/ultraStore';
import { getRecommendedPoses } from '../pose/PoseLibrary';
import { useLighting } from '../../hooks/useLighting';
import { useGyroscope } from '../../hooks/useGyroscope';
import { moodDetection } from '../../lib/ultra-ai/moodDetection';
import { aiPhotographer } from '../../lib/ultra-ai/photographer';
import { aiLocationIntel } from '../../lib/ultra-ai/locationIntel';
import { masterSceneAnalyzer } from '../../lib/ultra-ai/masterSceneAnalyzer';

function UltraAppInner() {
  const { videoRef, loading, error, startCamera, takePhoto } = useCameraContext();
  const { lighting, startAnalysis } = useLighting();
  const { detectCameraAngle } = useGyroscope();
  const { setCurrentLighting, isFlashOn, setFlashOn } = useCameraStore();
  const { recommendedPoses, currentPoseIndex, setRecommendedPoses, selectedGender, setGender } = usePoseStore();
  const { currentLUT } = useLUTStore();
  const { showPoseMode, setShowPoseMode, showDroneMode, setShowDroneMode, showLUTPicker, setShowLUTPicker, settings } = useAppStore();
  const {
    setActiveMode, setSceneParams, setPhotographerAnalysis,
    setLocationAnalysis, setMoodResult, setMasterResult,
    sceneLuminance, sceneTemperature, isGoldenHour, isBacklit, tiltAngle,
  } = useUltraStore();

  const [showGenderSelect, setShowGenderSelect] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [showPUNK, setShowPUNK] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [modeOpen, setModeOpen] = useState<'photographer'|'cinematographer'|'outfit'|'location'|'director'|'hollywood'|'master'|'reel'|'cinegpt'|'trends'|'ar'|'clone'|null>(null);

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 60) {
      if (diff > 0) {
        if (showPoseMode) {
          usePoseStore.getState().nextPose();
        } else {
          const lutStore = useLUTStore.getState();
          const curIndex = lutStore.presets.findIndex(p => p.id === currentLUT.id);
          if (curIndex !== -1) {
            const nextIndex = (curIndex + 1) % lutStore.presets.length;
            lutStore.setCurrentLUT(lutStore.presets[nextIndex]);
            setToast({ message: `LUT: ${lutStore.presets[nextIndex].name}`, type: 'info' });
            setTimeout(() => setToast(null), 1200);
          }
        }
      } else {
        if (showPoseMode) {
          usePoseStore.getState().prevPose();
        } else {
          const lutStore = useLUTStore.getState();
          const curIndex = lutStore.presets.findIndex(p => p.id === currentLUT.id);
          if (curIndex !== -1) {
            const prevIndex = (curIndex - 1 + lutStore.presets.length) % lutStore.presets.length;
            lutStore.setCurrentLUT(lutStore.presets[prevIndex]);
            setToast({ message: `LUT: ${lutStore.presets[prevIndex].name}`, type: 'info' });
            setTimeout(() => setToast(null), 1200);
          }
        }
      }
    }
    setTouchStart(null);
  };

  const currentPose = recommendedPoses[currentPoseIndex] || recommendedPoses[0];

  // Start lighting analysis when camera is ready
  useEffect(() => {
    if (appReady && videoRef.current && !loading && !error) {
      const t = setTimeout(() => startAnalysis(videoRef.current!), 800);
      return () => clearTimeout(t);
    }
  }, [appReady, videoRef, loading, error, startAnalysis]);

  // Run AI engines when lighting data arrives
  useEffect(() => {
    if (!lighting || !appReady) return;
    const angle = detectCameraAngle();
    const isBacklitVal = lighting.condition === 'backlit';
    const isGoldenVal = lighting.condition === 'golden_hour';
    const tilt = angle === 'low_angle' ? 10 : angle === 'high_angle' ? 30 : angle === 'bird_eye' ? 45 : angle === 'overhead' ? 75 : 20;

    setSceneParams(lighting.averageLuminance, lighting.colorTemperature, isGoldenVal, isBacklitVal, tilt);
    setMoodResult(moodDetection.detect(lighting.averageLuminance, lighting.colorTemperature, isGoldenVal, isBacklitVal, tilt));
    setLocationAnalysis(aiLocationIntel.analyze(lighting.averageLuminance, lighting.colorTemperature, isGoldenVal, tilt));
    setPhotographerAnalysis(aiPhotographer.analyzeScene(lighting.averageLuminance, lighting.colorTemperature, true, true));
    setMasterResult(masterSceneAnalyzer.analyze(lighting.averageLuminance, lighting.colorTemperature, isGoldenVal, isBacklitVal, tilt));
    setRecommendedPoses(lighting.condition === 'golden_hour' ? 'nature' : 'urban', angle, selectedGender);
  }, [lighting, selectedGender, appReady, detectCameraAngle, setSceneParams, setMoodResult, setLocationAnalysis, setPhotographerAnalysis, setMasterResult, setRecommendedPoses]);

  const handleStartCamera = useCallback(async (): Promise<boolean> => {
    return await startCamera();
  }, [startCamera]);

  const handlePermissionsComplete = useCallback((gender: 'male' | 'female' | 'neutral') => {
    setGender(gender);
    useAppStore.getState().updateSettings({ gender });
    useAppStore.getState().setOnboarding({ genderSelected: true, permissionsGranted: true, completed: true });
    setAppReady(true);
  }, [setGender]);

  const handleCapture = useCallback(() => {
    const photo = takePhoto();
    if (photo) {
      setToast({ message: 'Photo captured!', type: 'success' });
      setTimeout(() => setToast(null), 2500);
    }
  }, [takePhoto]);

  const handleTogglePose = useCallback(() => {
    setShowPoseMode(!showPoseMode);
  }, [showPoseMode, setShowPoseMode]);

  const handleToggleCamera = useCallback(async () => {
    useCameraStore.getState().toggleCamera();
    setTimeout(async () => {
      await startCamera();
    }, 200);
  }, [startCamera]);

  if (!appReady) {
    return (
      <CameraFeed>
        <PermissionsGate onStartCamera={handleStartCamera} onComplete={handlePermissionsComplete} />
      </CameraFeed>
    );
  }

  const POSE_CATEGORIES = ['Aesthetic', 'Cinematic', 'Natural', 'Lovely', 'Modular', 'Travel', 'Street', 'Luxury'];

  return (
    <div className="fixed inset-0 bg-black" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Camera Feed */}
      <CameraFeed onFrame={(video) => { if (lighting) setCurrentLighting(lighting); }} />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6B7280]">Starting camera...</p>
          </div>
        </div>
      )}

      {/* Punk Scanning Phase */}
      {isScanning && !loading && (
        <PunkScanningUI onScanComplete={() => setIsScanning(false)} />
      )}

      {/* Pose Mode Overlay */}
      {showPoseMode && currentPose && !loading && !isScanning && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-48 h-72 pointer-events-auto">
            <HumanoidRobot pose={currentPose} gender={selectedGender} />
          </div>
        </div>
      )}

      {/* Drone Mode */}
      <DroneGuide active={showDroneMode} onClose={() => setShowDroneMode(false)} />

      {/* PUNK AI Overlay */}
      <PUNKOverlay active={showPUNK && !isScanning} onClose={() => setShowPUNK(false)} />

      {/* AI Mode Panels */}
      <Suspense fallback={<div className="absolute bottom-32 left-1/2 -translate-x-1/2"><div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" /></div>}>
        {modeOpen === 'photographer' && <AIPhotographerPanel luminance={sceneLuminance} temperature={sceneTemperature} />}
        {modeOpen === 'cinematographer' && <AICinematographerPanel />}
        {modeOpen === 'outfit' && <AIOutfitPanel />}
        {modeOpen === 'location' && <AILocationPanel luminance={sceneLuminance} temperature={sceneTemperature} isGoldenHour={isGoldenHour} tiltAngle={tiltAngle} />}
        {modeOpen === 'director' && <DirectorVisionPanel isGoldenHour={isGoldenHour} />}
        {modeOpen === 'hollywood' && <HollywoodDirectorPanel />}
        {modeOpen === 'cinegpt' && <CineGPTPanel />}
        {modeOpen === 'reel' && <AIReelGeneratorPanel isGoldenHour={isGoldenHour} />}
        {modeOpen === 'master' && <MasterScenePanel luminance={sceneLuminance} temperature={sceneTemperature} isGoldenHour={isGoldenHour} isBacklit={isBacklit} tiltAngle={tiltAngle} />}
        {modeOpen === 'trends' && <TrendPanel />}
        {modeOpen === 'ar' && <ARPoseProjection visible />}
        {modeOpen === 'clone' && <AIHumanClonePanel />}
      </Suspense>

      {/* Mood + Lighting Badges */}
      {!modeOpen && !showPoseMode && !showPUNK && !loading && !isScanning && (
        <MoodDetectionBadge luminance={sceneLuminance} temperature={sceneTemperature} isGoldenHour={isGoldenHour} isBacklit={isBacklit} tiltAngle={tiltAngle} />
      )}
      {lighting && !showPoseMode && !modeOpen && !showPUNK && !loading && !isScanning && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10">
          <LightingBadge condition={lighting.condition} timeRemaining={lighting.timeRemaining} suggestion={lighting.suggestion} />
        </div>
      )}

      {/* Camera Controls */}
      {!loading && !isScanning && (
        <>
          {/* Top Bar - Minimalist */}
          <div className="absolute top-0 left-0 right-0 z-20 pointer-events-auto">
            <div className="flex items-center justify-between px-6 pt-12 pb-4 bg-gradient-to-b from-black/50 to-transparent">
              <button onClick={() => setFlashOn(!isFlashOn)} className={`p-2 rounded-full backdrop-blur-md transition-colors ${isFlashOn ? 'bg-white/20 text-yellow-300' : 'bg-black/20 text-white/80'}`} aria-label="Toggle flash">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </button>
              <div className="text-lg font-semibold tracking-widest text-white/90 drop-shadow-md">
                CINEPOSE
              </div>
              <button onClick={handleToggleCamera} className="p-2 rounded-full bg-black/20 text-white/80 hover:bg-white/20 backdrop-blur-md transition-colors" aria-label="Switch camera">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Sidebar Icons */}
          {!modeOpen && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20 pointer-events-auto">
              <button onClick={() => setShowPUNK(!showPUNK)} className={`p-3 rounded-full backdrop-blur-md transition-all ${showPUNK ? 'bg-[#22D3EE]/30 text-[#22D3EE] border border-[#22D3EE]/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-black/30 text-white/80 border border-white/10 hover:bg-white/10'}`} aria-label="PUNK AI">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v12M6 12h12" /><circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </button>
              
              <button onClick={handleTogglePose} className={`p-3 rounded-full backdrop-blur-md transition-all ${showPoseMode ? 'bg-[#06B6D4]/30 text-[#06B6D4] border border-[#06B6D4]/50' : 'bg-black/30 text-white/80 border border-white/10 hover:bg-white/10'}`} aria-label="Humanoid Guide">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="5" r="3" /><path d="M12 8v4" /><path d="M8 14l-3 6" /><path d="M16 14l3 6" /><path d="M12 12l-4 6" /><path d="M12 12l4 6" /><path d="M9 18l3-2 3 2" />
                </svg>
              </button>
              
              <button onClick={() => setShowDroneMode(!showDroneMode)} className={`p-3 rounded-full backdrop-blur-md transition-all ${showDroneMode ? 'bg-[#6EE7B7]/30 text-[#6EE7B7] border border-[#6EE7B7]/50' : 'bg-black/30 text-white/80 border border-white/10 hover:bg-white/10'}`} aria-label="Drone View">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 9l10 7 10-7-10-7z" /><path d="M2 9v5l10 7 10-7V9" />
                </svg>
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          {!modeOpen && (
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <div className="px-4 pb-8 pt-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col">
                
                {/* Horizontal Category Navigation Menu */}
                {showPoseMode && (
                  <div className="w-full mb-6 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 min-w-max px-2">
                      {POSE_CATEGORIES.map((cat, idx) => (
                        <button key={cat} className={`px-4 py-1.5 rounded-full backdrop-blur-md border text-sm transition-colors ${idx === 0 ? 'bg-white/20 border-white/40 text-white' : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/10'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shutter & LUT */}
                <div className="flex items-center justify-center relative w-full">
                  <div className="absolute left-6">
                    <button onClick={() => setShowLUTPicker(true)} className="px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors flex flex-col items-center">
                      <span className="text-[10px] text-white/80 font-medium tracking-widest">LUT</span>
                    </button>
                  </div>
                  <ShutterButton onCapture={handleCapture} />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Pose Mode Controls Overlay */}
      {showPoseMode && !loading && !isScanning && (
        <div className="absolute bottom-32 left-0 right-0 z-20 pointer-events-auto">
          <PoseControls currentPose={currentPose} genderSet={!!settings.gender} onRequestGender={() => setShowGenderSelect(true)} />
        </div>
      )}

      {/* LUT Picker */}
      <BottomSheet open={showLUTPicker} onClose={() => setShowLUTPicker(false)} title="LUT Picker" height="55%">
        <LUTPicker />
      </BottomSheet>

      {/* Gender Select */}
      <BottomSheet open={showGenderSelect} onClose={() => setShowGenderSelect(false)} height="60%" showHandle={false}>
        <GenderSelector selected={selectedGender} onSelect={(g) => { setGender(g); useAppStore.getState().updateSettings({ gender: g }); setShowGenderSelect(false); }} onContinue={() => setShowGenderSelect(false)} />
      </BottomSheet>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

export function UltraApp() {
  return (
    <CameraProvider>
      <ErrorBoundary>
        <UltraAppInner />
      </ErrorBoundary>
    </CameraProvider>
  );
}
