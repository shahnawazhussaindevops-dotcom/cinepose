import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { PunkAIProvider } from '../../lib/llm/punkAIContext';
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

const panelVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
};

const sidebarItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.08, type: 'spring', damping: 20 } }),
};

const POSE_CATEGORIES = ['Aesthetic', 'Cinematic', 'Natural', 'Lovely', 'Modular', 'Travel', 'Street', 'Luxury'];

function UltraAppInner() {
  const { videoRef, loading, error, startCamera, takePhoto } = useCameraContext();
  const { lighting, startAnalysis } = useLighting();
  const { detectCameraAngle } = useGyroscope();
  const { isFlashOn, setFlashOn } = useCameraStore();
  const { recommendedPoses, currentPoseIndex, setRecommendedPoses, selectedGender, setGender } = usePoseStore();
  const { currentLUT } = useLUTStore();
  const { showPoseMode, setShowPoseMode, showDroneMode, setShowDroneMode, showLUTPicker, setShowLUTPicker, settings } = useAppStore();
  const {
    setActiveMode, setSceneAnalysis,
    sceneLuminance, sceneTemperature, isGoldenHour, isBacklit, tiltAngle,
  } = useUltraStore();

  const [showGenderSelect, setShowGenderSelect] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [showPUNK, setShowPUNK] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const lastAnalysisRef = useRef(0);
  const onScanCompleteRef = useRef(() => setIsScanning(false));
  onScanCompleteRef.current = () => setIsScanning(false);
  const handleScanComplete = useCallback(() => onScanCompleteRef.current(), []);
  const [modeOpen, setModeOpen] = useState<'photographer'|'cinematographer'|'outfit'|'location'|'director'|'hollywood'|'master'|'reel'|'cinegpt'|'trends'|'ar'|'clone'|null>(null);
  const [activeCategory, setActiveCategory] = useState(0);
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

  useEffect(() => {
    if (appReady && videoRef.current && !loading && !error) {
      const t = setTimeout(() => startAnalysis(videoRef.current!), 800);
      return () => clearTimeout(t);
    }
  }, [appReady, videoRef, loading, error, startAnalysis]);

  useEffect(() => {
    if (!lighting || !appReady) return;
    const now = Date.now();
    if (now - lastAnalysisRef.current < 1000) return;
    lastAnalysisRef.current = now;
    const angle = detectCameraAngle();
    const isBacklitVal = lighting.condition === 'backlit';
    const isGoldenVal = lighting.condition === 'golden_hour';
    const tilt = angle === 'low_angle' ? 10 : angle === 'high_angle' ? 30 : angle === 'bird_eye' ? 45 : angle === 'overhead' ? 75 : 20;

    const mood = moodDetection.detect(lighting.averageLuminance, lighting.colorTemperature, isGoldenVal, isBacklitVal, tilt);
    const location = aiLocationIntel.analyze(lighting.averageLuminance, lighting.colorTemperature, isGoldenVal, tilt);
    const photo = aiPhotographer.analyzeScene(lighting.averageLuminance, lighting.colorTemperature, true, true);
    const master = masterSceneAnalyzer.analyze(lighting.averageLuminance, lighting.colorTemperature, isGoldenVal, isBacklitVal, tilt);

    setSceneAnalysis(lighting.averageLuminance, lighting.colorTemperature, isGoldenVal, isBacklitVal, tilt, mood, location, photo, master);
    setRecommendedPoses(lighting.condition === 'golden_hour' ? 'nature' : 'urban', angle, selectedGender);
  }, [lighting, selectedGender, appReady, detectCameraAngle, setSceneAnalysis, setRecommendedPoses]);

  const handleStartCamera = useCallback(async (): Promise<boolean> => {
    return await startCamera();
  }, [startCamera]);

  const handlePermissionsComplete = useCallback((gender: 'male' | 'female' | 'neutral') => {
    setGender(gender);
    useAppStore.getState().updateSettings({ gender });
    useAppStore.getState().setOnboarding({ genderSelected: true, permissionsGranted: true, completed: true });
    setAppReady(true);
  }, [setGender]);

  const handleCapture = useCallback(async () => {
    const photo = await takePhoto();
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

  const toggleMode = useCallback((mode: typeof modeOpen) => {
    setModeOpen(prev => prev === mode ? null : mode);
  }, []);

  return (
    <div className="fixed inset-0 bg-black" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Ambient grid overlay - always rendered */}
      <div className="absolute inset-0 bg-grid-dense z-[1] pointer-events-none opacity-30" />

      {/* Camera Feed - always mounted, never unmounts */}
      <CameraFeed>
        {!appReady && (
          <PermissionsGate onStartCamera={handleStartCamera} onComplete={handlePermissionsComplete} contextError={error} />
        )}
      </CameraFeed>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-[#A78BFA]/30 border-t-[#A78BFA] rounded-full animate-spin" />
                <div className="absolute inset-1 w-14 h-14 border-2 border-[#6EE7B7]/20 border-b-[#6EE7B7] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
              </div>
              <motion.p
                className="text-sm text-[#A78BFA] font-mono tracking-widest"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                INITIALIZING CAMERA...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Punk Scanning Phase */}
      <AnimatePresence>
        {isScanning && !loading && (
          <PunkScanningUI onScanComplete={handleScanComplete} />
        )}
      </AnimatePresence>

      {/* Pose Mode Overlay */}
      <AnimatePresence>
        {showPoseMode && currentPose && !loading && !isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 w-48 h-72 pointer-events-auto"
            >
              <div className="relative w-full h-full">
                <div className="absolute inset-0 rounded-full bg-[#06B6D4]/5 blur-3xl" />
                <HumanoidRobot pose={currentPose} gender={selectedGender} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drone Mode */}
      <DroneGuide active={showDroneMode} onClose={() => setShowDroneMode(false)} />

      {/* PUNK AI Overlay */}
      <PUNKOverlay active={showPUNK && !isScanning} onClose={() => setShowPUNK(false)} />

      {/* AI Mode Panels */}
      <Suspense fallback={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
            <div className="w-4 h-4 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#A78BFA] font-mono">LOADING AI AGENT...</span>
          </div>
        </motion.div>
      }>
        <AnimatePresence mode="wait">
          {modeOpen === 'photographer' && (
            <motion.div key="photographer" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <AIPhotographerPanel luminance={sceneLuminance} temperature={sceneTemperature} />
            </motion.div>
          )}
          {modeOpen === 'cinematographer' && (
            <motion.div key="cinematographer" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <AICinematographerPanel />
            </motion.div>
          )}
          {modeOpen === 'outfit' && (
            <motion.div key="outfit" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <AIOutfitPanel />
            </motion.div>
          )}
          {modeOpen === 'location' && (
            <motion.div key="location" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <AILocationPanel luminance={sceneLuminance} temperature={sceneTemperature} isGoldenHour={isGoldenHour} tiltAngle={tiltAngle} />
            </motion.div>
          )}
          {modeOpen === 'director' && (
            <motion.div key="director" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <DirectorVisionPanel isGoldenHour={isGoldenHour} />
            </motion.div>
          )}
          {modeOpen === 'hollywood' && (
            <motion.div key="hollywood" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <HollywoodDirectorPanel />
            </motion.div>
          )}
          {modeOpen === 'cinegpt' && (
            <motion.div key="cinegpt" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <CineGPTPanel />
            </motion.div>
          )}
          {modeOpen === 'reel' && (
            <motion.div key="reel" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <AIReelGeneratorPanel isGoldenHour={isGoldenHour} />
            </motion.div>
          )}
          {modeOpen === 'master' && (
            <motion.div key="master" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <MasterScenePanel luminance={sceneLuminance} temperature={sceneTemperature} isGoldenHour={isGoldenHour} isBacklit={isBacklit} tiltAngle={tiltAngle} />
            </motion.div>
          )}
          {modeOpen === 'trends' && (
            <motion.div key="trends" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <TrendPanel />
            </motion.div>
          )}
          {modeOpen === 'ar' && (
            <motion.div key="ar" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <ARPoseProjection visible />
            </motion.div>
          )}
          {modeOpen === 'clone' && (
            <motion.div key="clone" variants={panelVariants} initial="hidden" animate="visible" exit="exit">
              <AIHumanClonePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>

      {/* Mood + Lighting Badges */}
      <AnimatePresence>
        {!modeOpen && !showPoseMode && !showPUNK && !loading && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-10"
          >
            <MoodDetectionBadge luminance={sceneLuminance} temperature={sceneTemperature} isGoldenHour={isGoldenHour} isBacklit={isBacklit} tiltAngle={tiltAngle} />
          </motion.div>
        )}
      </AnimatePresence>

      {lighting && !showPoseMode && !modeOpen && !showPUNK && !loading && !isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-32 left-1/2 -translate-x-1/2 z-10"
        >
          <LightingBadge condition={lighting.condition} timeRemaining={lighting.timeRemaining} suggestion={lighting.suggestion} />
        </motion.div>
      )}

      {/* Camera Controls */}
      {!loading && !isScanning && (
        <>
          {/* Top Bar */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-0 left-0 right-0 z-20 pointer-events-auto"
          >
            <div className="flex items-center justify-between px-6 pt-12 pb-6 bg-gradient-to-b from-black/70 via-black/30 to-transparent">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setFlashOn(!isFlashOn)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${isFlashOn ? 'bg-[#A78BFA]/30 text-yellow-300 border border-[#A78BFA]/30' : 'bg-black/30 text-white/60 border border-white/10'}`}
                aria-label="Toggle flash"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </motion.button>

              <motion.div
                className="flex flex-col items-center"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="text-base font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#6EE7B7] to-[#22D3EE]">
                  CINEPOSE
                </div>
                <div className="text-[8px] text-[#6B7280] tracking-[0.5em] font-mono">ULTRA AI</div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleCamera}
                className="p-2.5 rounded-full bg-black/30 text-white/60 border border-white/10 hover:bg-white/10 backdrop-blur-md transition-colors"
                aria-label="Switch camera"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Right Sidebar Icons */}
          {!modeOpen && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20 pointer-events-auto">
              {[
                { icon: 'PUNK', label: 'PUNK AI', action: () => setShowPUNK(!showPUNK), active: showPUNK, color: '#22D3EE' },
                { icon: 'POSE', label: 'Pose Guide', action: handleTogglePose, active: showPoseMode, color: '#06B6D4' },
                { icon: 'DRONE', label: 'Drone View', action: () => setShowDroneMode(!showDroneMode), active: showDroneMode, color: '#6EE7B7' },
              ].map((item, i) => (
                <motion.button
                  key={item.label}
                  custom={i}
                  variants={sidebarItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={item.action}
                  className={`p-3 rounded-full backdrop-blur-md transition-all ${
                    item.active
                      ? `shadow-[0_0_20px_${item.color}33] border border-white/20`
                      : 'bg-black/40 text-white/50 border border-white/10 hover:bg-white/10'
                  }`}
                  style={item.active ? { backgroundColor: `${item.color}20`, color: item.color, borderColor: `${item.color}40` } : {}}
                  aria-label={item.label}
                >
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    {item.icon === 'PUNK' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v12M6 12h12" /><circle cx="12" cy="12" r="3" fill="currentColor" />
                      </svg>
                    )}
                    {item.icon === 'POSE' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="5" r="3" /><path d="M12 8v4" /><path d="M8 14l-3 6" /><path d="M16 14l3 6" /><path d="M12 12l-4 6" /><path d="M12 12l4 6" /><path d="M9 18l3-2 3 2" />
                      </svg>
                    )}
                    {item.icon === 'DRONE' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2L2 9l10 7 10-7-10-7z" /><path d="M2 9v5l10 7 10-7V9" />
                      </svg>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Bottom Controls */}
          {!modeOpen && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, type: 'spring', damping: 25 }}
              className="absolute bottom-0 left-0 right-0 z-10"
            >
              <div className="px-4 pb-8 pt-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                {/* Horizontal Category Navigation Menu */}
                {showPoseMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mb-6 overflow-x-auto scrollbar-hide"
                  >
                    <div className="flex gap-2 min-w-max px-2">
                      {POSE_CATEGORIES.map((cat, idx) => (
                        <motion.button
                          key={cat}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveCategory(idx)}
                          className={`px-4 py-1.5 rounded-full backdrop-blur-md border text-xs font-medium transition-all ${
                            idx === activeCategory
                              ? 'bg-white/15 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                              : 'bg-black/40 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
                          }`}
                        >
                          {cat}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Shutter & LUT */}
                <div className="flex items-center justify-center relative w-full">
                  <motion.div
                    className="absolute left-6"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button
                      onClick={() => setShowLUTPicker(true)}
                      className="px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-[#A78BFA]/30 transition-all flex items-center gap-2 group"
                    >
                      <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[#A78BFA] to-[#6EE7B7]" />
                      <span className="text-[10px] text-white/60 group-hover:text-white/90 font-medium tracking-widest transition-colors">LUT</span>
                    </button>
                  </motion.div>
                  <ShutterButton onCapture={handleCapture} />
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Mode Grid */}
          {!modeOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', damping: 20 }}
              className="absolute bottom-28 left-0 right-0 z-10 px-4"
            >
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide justify-center">
                {[
                  { id: 'photographer' as const, label: 'Photo', icon: '📸' },
                  { id: 'cinematographer' as const, label: 'Cine', icon: '🎬' },
                  { id: 'outfit' as const, label: 'Style', icon: '👔' },
                  { id: 'location' as const, label: 'Loc', icon: '📍' },
                  { id: 'director' as const, label: 'Vision', icon: '🎯' },
                  { id: 'hollywood' as const, label: 'Holly', icon: '🌟' },
                  { id: 'cinegpt' as const, label: 'Chat', icon: '💬' },
                  { id: 'reel' as const, label: 'Reel', icon: '🎞️' },
                  { id: 'master' as const, label: 'Scene', icon: '🔬' },
                  { id: 'trends' as const, label: 'Trend', icon: '📈' },
                  { id: 'ar' as const, label: 'AR', icon: '👻' },
                  { id: 'clone' as const, label: 'Clone', icon: '🧬' },
                ].map((agent) => (
                  <motion.button
                    key={agent.id}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleMode(agent.id)}
                    className="flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-[#A78BFA]/30 transition-all min-w-[52px]"
                  >
                    <span className="text-sm">{agent.icon}</span>
                    <span className="text-[8px] text-white/50 font-mono tracking-wider">{agent.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Pose Controls */}
      <AnimatePresence>
        {showPoseMode && !loading && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-44 left-0 right-0 z-20 pointer-events-auto"
          >
            <PoseControls currentPose={currentPose} genderSet={!!settings.gender} onRequestGender={() => setShowGenderSelect(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LUT Picker Bottom Sheet */}
      <BottomSheet open={showLUTPicker} onClose={() => setShowLUTPicker(false)} title="LUT Picker" height="55%">
        <LUTPicker />
      </BottomSheet>

      {/* Gender Select Bottom Sheet */}
      <BottomSheet open={showGenderSelect} onClose={() => setShowGenderSelect(false)} height="60%" showHandle={false}>
        <GenderSelector selected={selectedGender} onSelect={(g) => { setGender(g); useAppStore.getState().updateSettings({ gender: g }); setShowGenderSelect(false); }} onContinue={() => setShowGenderSelect(false)} />
      </BottomSheet>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UltraApp() {
  return (
    <CameraProvider>
      <ErrorBoundary>
        <PunkAIProvider>
          <UltraAppInner />
        </PunkAIProvider>
      </ErrorBoundary>
    </CameraProvider>
  );
}
