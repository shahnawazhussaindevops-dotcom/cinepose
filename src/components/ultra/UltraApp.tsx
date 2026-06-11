import React, { useState, useCallback, useEffect } from 'react';
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
import { PermissionsGate } from './PermissionsGate';
import { AIPhotographerPanel } from './AIPhotographerPanel';
import { AICinematographerPanel } from './AICinematographerPanel';
import { AIOutfitPanel } from './AIOutfitPanel';
import { AILocationPanel } from './AILocationPanel';
import { DirectorVisionPanel } from './DirectorVisionPanel';
import { HollywoodDirectorPanel } from './HollywoodDirectorPanel';
import { MoodDetectionBadge } from './MoodDetectionBadge';
import { CineGPTPanel } from './CineGPTPanel';
import { AIReelGeneratorPanel } from './AIReelGeneratorPanel';
import { MasterScenePanel } from './MasterScenePanel';
import { TrendPanel } from './TrendPanel';
import { ARPoseProjection } from './ARPoseProjection';
import { AIHumanClonePanel } from './AIHumanClonePanel';
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
  const { videoRef, loading, error, startCamera, takePhoto, toggleCamera } = useCameraContext();
  const { lighting, startAnalysis } = useLighting();
  const { detectCameraAngle } = useGyroscope();
  const { setCurrentLighting, isFlashOn, setFlashOn, facingFront } = useCameraStore();
  const { recommendedPoses, currentPoseIndex, setRecommendedPoses, selectedGender } = usePoseStore();
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
  const [permissionsDone, setPermissionsDone] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [modeOpen, setModeOpen] = useState<'photographer'|'cinematographer'|'outfit'|'location'|'director'|'hollywood'|'master'|'reel'|'cinegpt'|'trends'|'ar'|'clone'|null>(null);

  const currentPose = recommendedPoses[currentPoseIndex] || recommendedPoses[0];

  // Start camera when permissions are granted
  useEffect(() => {
    if (permissionsDone && !cameraStarted) {
      setCameraStarted(true);
      // Small delay to ensure DOM is ready
      const t = setTimeout(() => startCamera(), 100);
      return () => clearTimeout(t);
    }
  }, [permissionsDone, cameraStarted, startCamera]);

  // Start lighting analysis when camera is ready
  useEffect(() => {
    if (permissionsDone && videoRef.current && !loading) {
      const t = setTimeout(() => startAnalysis(videoRef.current!), 500);
      return () => clearTimeout(t);
    }
  }, [permissionsDone, videoRef, loading, startAnalysis]);

  // Run AI engines when lighting data arrives
  useEffect(() => {
    if (!lighting || !permissionsDone) return;
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
  }, [lighting, selectedGender, permissionsDone, detectCameraAngle, setSceneParams, setMoodResult, setLocationAnalysis, setPhotographerAnalysis, setMasterResult, setRecommendedPoses]);

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

  const handleGenderSelect = useCallback((gender: any) => {
    useAppStore.getState().updateSettings({ gender });
    setShowGenderSelect(false);
    useAppStore.getState().setOnboarding({ genderSelected: true });
  }, []);

  const handleToggleCamera = useCallback(() => {
    useCameraStore.getState().toggleCamera();
    // Restart camera with new facing mode
    setTimeout(() => startCamera(), 200);
  }, [startCamera]);

  if (!permissionsDone) {
    return <PermissionsGate onComplete={() => setPermissionsDone(true)} />;
  }

  const MODE_BUTTONS = [
    { id: 'photographer' as const, label: '📸', sub: 'Photographer' },
    { id: 'cinematographer' as const, label: '🎬', sub: 'Cinematographer' },
    { id: 'outfit' as const, label: '👔', sub: 'Outfit' },
    { id: 'location' as const, label: '📍', sub: 'Location' },
    { id: 'director' as const, label: '🎯', sub: 'Vision' },
    { id: 'hollywood' as const, label: '🌟', sub: 'Hollywood' },
    { id: 'cinegpt' as const, label: '💬', sub: 'CineGPT' },
    { id: 'reel' as const, label: '🎞️', sub: 'Reel' },
    { id: 'master' as const, label: '🔬', sub: 'Analyzer' },
    { id: 'trends' as const, label: '📈', sub: 'Trends' },
    { id: 'ar' as const, label: '👻', sub: 'AR Pose' },
    { id: 'clone' as const, label: '🧬', sub: 'Clone' },
  ];

  return (
    <div className="fixed inset-0 bg-black">
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

      {/* Pose Mode Overlay */}
      {showPoseMode && currentPose && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-48 h-72 pointer-events-auto">
            <HumanoidRobot pose={currentPose} gender={selectedGender} />
          </div>
        </div>
      )}

      {/* Drone Mode */}
      <DroneGuide active={showDroneMode} onClose={() => setShowDroneMode(false)} />

      {/* PUNK AI */}
      <PUNKOverlay active={showPUNK} onClose={() => setShowPUNK(false)} />

      {/* AI Mode Panels */}
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

      {/* Mood + Lighting Badges */}
      {!modeOpen && !showPoseMode && !showPUNK && !loading && (
        <MoodDetectionBadge luminance={sceneLuminance} temperature={sceneTemperature} isGoldenHour={isGoldenHour} isBacklit={isBacklit} tiltAngle={tiltAngle} />
      )}
      {lighting && !showPoseMode && !modeOpen && !showPUNK && !loading && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10">
          <LightingBadge condition={lighting.condition} timeRemaining={lighting.timeRemaining} suggestion={lighting.suggestion} />
        </div>
      )}

      {/* Camera Controls */}
      {!showPoseMode && !modeOpen && !loading && (
        <>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-10">
            <div className="flex items-center justify-between px-4 pt-12 pb-4 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-2">
                <button onClick={() => setFlashOn(!isFlashOn)} className={`p-2 rounded-full backdrop-blur-md transition-colors ${isFlashOn ? 'bg-[#A78BFA]/30 text-[#A78BFA]' : 'bg-white/10 text-white/70'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </button>
                <button onClick={handleTogglePose} className={`p-2 rounded-full backdrop-blur-md transition-colors ${showPoseMode ? 'bg-[#A78BFA]/30 text-[#A78BFA]' : 'bg-white/10 text-white/70'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="5" r="3" /><path d="M12 8v4" /><path d="M8 14l-3 6" /><path d="M16 14l3 6" /><path d="M12 12l-4 6" /><path d="M12 12l4 6" /><path d="M9 18l3-2 3 2" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowPUNK(!showPUNK)} className={`p-2 rounded-full backdrop-blur-md transition-colors ${showPUNK ? 'bg-[#A78BFA]/30 text-[#A78BFA]' : 'bg-white/10 text-white/70'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v12M6 12h12" /><circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                </button>
                <button onClick={handleToggleCamera} className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="px-6 pb-8 pt-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex flex-col items-center">
                {/* AI Mode Buttons */}
                <div className="w-full mb-4 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-1.5 pb-1 min-w-max px-1">
                    {MODE_BUTTONS.map(btn => (
                      <button key={btn.id} onClick={() => setModeOpen(modeOpen === btn.id ? null : btn.id)}
                        className={`shrink-0 flex flex-col items-center px-2.5 py-1.5 rounded-xl transition-all ${modeOpen === btn.id ? 'bg-[#A78BFA]/20 border border-[#A78BFA]/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                        <span className="text-sm">{btn.label}</span>
                        <span className="text-[7px] text-[#6B7280] mt-0.5">{btn.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shutter + Extra */}
                <div className="flex items-end justify-between w-full">
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={() => setShowLUTPicker(true)} className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                      <span className="text-[10px] text-[#F9FAFB] font-medium">LUT</span>
                    </button>
                  </div>
                  <ShutterButton onCapture={handleCapture} />
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={() => setShowDroneMode(!showDroneMode)} className={`p-3 rounded-full backdrop-blur-md border transition-all ${showDroneMode ? 'bg-[#6EE7B7]/30 border-[#6EE7B7]' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={showDroneMode ? 'text-[#6EE7B7]' : 'text-white/70'}>
                        <path d="M12 2L2 9l10 7 10-7-10-7z" /><path d="M2 9v5l10 7 10-7V9" />
                      </svg>
                    </button>
                    {showDroneMode && <div className="w-5 h-0.5 rounded-full bg-[#6EE7B7]" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pose Mode Controls */}
      {showPoseMode && (
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto">
          <PoseControls currentPose={currentPose} genderSet={!!settings.gender} onRequestGender={() => setShowGenderSelect(true)} />
        </div>
      )}

      {/* LUT Picker */}
      <BottomSheet open={showLUTPicker} onClose={() => setShowLUTPicker(false)} title="LUT Picker" height="55%">
        <LUTPicker />
      </BottomSheet>

      {/* Gender Select */}
      <BottomSheet open={showGenderSelect} onClose={() => setShowGenderSelect(false)} height="60%" showHandle={false}>
        <GenderSelector selected={selectedGender} onSelect={handleGenderSelect} onContinue={() => setShowGenderSelect(false)} />
      </BottomSheet>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}

export function UltraApp() {
  return (
    <CameraProvider>
      <UltraAppInner />
    </CameraProvider>
  );
}
