import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraProvider, useCameraContext } from '../../lib/CameraContext';
import { CameraFeed } from '../camera/CameraFeed';
import { ShutterButton } from '../camera/ShutterButton';
import { LUTPicker } from '../lut/LUTPicker';
import { LightingBadge } from '../lighting/LightingBadge';
import { HumanoidRobot } from '../pose/HumanoidRobot';
import { PoseControls } from '../pose/PoseControls';
import { DroneGuide } from '../drone/DroneGuide';
import { BottomSheet } from '../ui/BottomSheet';
import { Toast } from '../ui/Toast';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { MoodDetectionBadge } from './MoodDetectionBadge';
import { useCameraStore } from '../../stores/cameraStore';
import { usePoseStore } from '../../stores/poseStore';
import { useLUTStore } from '../../stores/lutStore';
import { useAppStore } from '../../stores/appStore';
import { useUltraStore } from '../../stores/ultraStore';
import { useMemoryStore } from '../../stores/memoryStore';
import { useLighting } from '../../hooks/useLighting';
import { useGyroscope } from '../../hooks/useGyroscope';
import { useVisionPipeline } from '../../hooks/useVisionPipeline';
import { moodDetection } from '../../lib/ultra-ai/moodDetection';
import { aiPhotographer } from '../../lib/ultra-ai/photographer';
import { aiLocationIntel } from '../../lib/ultra-ai/locationIntel';
import { masterSceneAnalyzer } from '../../lib/ultra-ai/masterSceneAnalyzer';
import { PermissionsGate } from './PermissionsGate';

const AIPhotographerPanel = lazy(() => import('./AIPhotographerPanel').then(m => ({ default: m.AIPhotographerPanel })));
const AICinematographerPanel = lazy(() => import('./AICinematographerPanel').then(m => ({ default: m.AICinematographerPanel })));
const AIOutfitPanel = lazy(() => import('./AIOutfitPanel').then(m => ({ default: m.AIOutfitPanel })));
const AILocationPanel = lazy(() => import('./AILocationPanel').then(m => ({ default: m.AILocationPanel })));
const HollywoodDirectorPanel = lazy(() => import('./HollywoodDirectorPanel').then(m => ({ default: m.HollywoodDirectorPanel })));
const CineGPTPanel = lazy(() => import('./CineGPTPanel').then(m => ({ default: m.CineGPTPanel })));
const MasterScenePanel = lazy(() => import('./MasterScenePanel').then(m => ({ default: m.MasterScenePanel })));
const DirectorVisionPanel = lazy(() => import('./DirectorVisionPanel').then(m => ({ default: m.DirectorVisionPanel })));
const ARPoseProjection = lazy(() => import('./ARPoseProjection').then(m => ({ default: m.ARPoseProjection })));

type AgentId = 'scene' | 'photo' | 'cine' | 'style' | 'loc' | 'vision' | 'holly' | 'chat' | 'ar' | 'poses' | 'lut' | 'memory';

interface AgentTab {
  id: AgentId;
  label: string;
  icon: React.ReactNode;
}

function UltraAppInner() {
  const { videoRef, loading, error, startCamera, takePhoto, isCameraReady } = useCameraContext();
  const { lighting, startAnalysis } = useLighting();
  const { detectCameraAngle } = useGyroscope();
  const { isFlashOn, setFlashOn, facingFront } = useCameraStore();
  const { recommendedPoses, currentPoseIndex, setRecommendedPoses, selectedGender } = usePoseStore();
  const { showLUTPicker, setShowLUTPicker, settings } = useAppStore();
  const { setSceneAnalysis, sceneLuminance, sceneTemperature, isGoldenHour, isBacklit, tiltAngle, moodResult, locationAnalysis } = useUltraStore();
  const { loadFromLocal, userGender } = useMemoryStore();
  const { sceneAnalysis } = useVisionPipeline();

  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentId | null>(null);
  const [showPoseOverlay, setShowPoseOverlay] = useState(false);
  const [showDroneMode, setShowDroneMode] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const lastAnalysisRef = useRef(0);

  useEffect(() => { loadFromLocal(); }, [loadFromLocal]);

  useEffect(() => {
    if (isCameraReady && videoRef.current) {
      const t = setTimeout(() => startAnalysis(videoRef.current!), 600);
      return () => clearTimeout(t);
    }
  }, [isCameraReady, videoRef, startAnalysis]);

  useEffect(() => {
    if (!isCameraReady) return;
    const now = Date.now();
    if (now - lastAnalysisRef.current < 1800) return;
    lastAnalysisRef.current = now;

    const angle = detectCameraAngle();
    const tilt = angle === 'low_angle' ? 10 : angle === 'high_angle' ? 30 : angle === 'bird_eye' ? 45 : angle === 'overhead' ? 75 : 20;

    let luminance = 0.5;
    let temperature = 5500;
    let isGoldenVal = false;
    let isBacklitVal = false;
    let hasFace = true;
    let colors: string[] = [];
    let sharpness = 0.5;
    let contrast = 0.5;
    let depth = 0.5;
    let motionDetected = false;

    if (lighting) {
      luminance = lighting.averageLuminance;
      temperature = lighting.colorTemperature;
      isGoldenVal = lighting.condition === 'golden_hour';
      isBacklitVal = lighting.condition === 'backlit';
    }

    if (sceneAnalysis) {
      luminance = sceneAnalysis.averageLuminance;
      temperature = sceneAnalysis.colorTemperature;
      isBacklitVal = sceneAnalysis.isBacklit;
      hasFace = sceneAnalysis.hasFace;
      colors = sceneAnalysis.colorPalette;
      sharpness = sceneAnalysis.sharpness;
      contrast = sceneAnalysis.contrast;
      depth = sceneAnalysis.estimatedDepth === 'deep' ? 0.8 : sceneAnalysis.estimatedDepth === 'medium' ? 0.5 : 0.2;
      motionDetected = sceneAnalysis.motionDetected;
    }

    const mood = moodDetection.detect(luminance, temperature, isGoldenVal, isBacklitVal, tilt, hasFace, colors);
    const location = aiLocationIntel.analyze(luminance, temperature, isGoldenVal, tilt);
    const photo = aiPhotographer.analyzeScene(luminance, temperature, hasFace, true, sharpness, contrast, colors.map(c => ({ name: c })), depth > 0.6 ? 'deep' : depth > 0.3 ? 'medium' : 'shallow', motionDetected);
    const master = masterSceneAnalyzer.analyze(luminance, temperature, isGoldenVal, isBacklitVal, tilt);
    setSceneAnalysis(luminance, temperature, isGoldenVal, isBacklitVal, tilt, mood, location, photo, master);
    setRecommendedPoses(sceneAnalysis?.sceneType === 'outdoor_bright' || isGoldenVal ? 'beach' : sceneAnalysis?.sceneType === 'night' ? 'urban' : 'indoor', angle, selectedGender);
  }, [lighting, sceneAnalysis, selectedGender, isCameraReady, detectCameraAngle, setSceneAnalysis, setRecommendedPoses]);

  const handleCapture = useCallback(async () => {
    const photo = await takePhoto();
    if (photo) {
      setToast({ message: 'Frame captured', type: 'success' });
      setTimeout(() => setToast(null), 2000);
    }
  }, [takePhoto]);

  const handleFlipCamera = useCallback(async () => {
    setFlashOn(!facingFront);
    useCameraStore.getState().toggleCamera();
    setTimeout(() => startCamera(), 200);
  }, [startCamera, facingFront, setFlashOn]);

  const toggleAgent = useCallback((id: AgentId) => {
    if (id === 'lut') {
      setShowLUTPicker(!showLUTPicker);
      return;
    }
    setActiveAgent(prev => prev === id ? null : id);
  }, [setShowLUTPicker, showLUTPicker]);

  const currentPose = recommendedPoses[currentPoseIndex] || recommendedPoses[0];

  const isAnalysisActive = isCameraReady && !loading;

  const agents: AgentTab[] = [
    { id: 'scene', label: 'Scene', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: 'photo', label: 'Photo', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg> },
    { id: 'cine', label: 'Cine', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg> },
    { id: 'style', label: 'Style', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h12l4 6-10 13L2 9z"/></svg> },
    { id: 'loc', label: 'Location', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> },
    { id: 'vision', label: 'Director', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
    { id: 'holly', label: 'Hollywood', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
    { id: 'chat', label: 'CineGPT', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
    { id: 'ar', label: 'AR Guide', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h7v7H4z"/><path d="M4 13h7v7H4z"/><path d="M13 4h7v7h-7z"/><path d="M13 13h7v7h-7z"/></svg> },
    { id: 'poses', label: 'Poses', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="5" r="3"/><path d="M12 8v4"/><path d="M8 14l-3 6"/><path d="M16 14l3 6"/><path d="M12 12l-4 6"/><path d="M12 12l4 6"/><path d="M9 18l3-2 3 2"/></svg> },
    { id: 'lut', label: 'LUT', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
    { id: 'memory', label: 'Memory', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
  ];

  return (
    <div className="fixed inset-0 bg-black select-none">
      <div className="absolute inset-0 bg-grid-dense z-[1] pointer-events-none opacity-20" />

      <CameraFeed onFrame={() => {}}>
        {/* Camera error overlay - shown when camera fails */}
        {error && !loading && !isCameraReady && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0D0D1A]/95 p-6">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#A78BFA]/20 to-[#EF4444]/20 flex items-center justify-center border border-white/10">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </div>
              <p className="text-[#F9FAFB] font-semibold text-lg mb-2">Camera unavailable</p>
              <p className="text-sm text-[#9CA3AF] mb-6 leading-relaxed">{error}</p>
              <button onClick={() => { startCamera(); }} className="px-8 py-3 rounded-full bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(167,139,250,0.3)]">
                Try Again
              </button>
            </div>
          </div>
        )}
      </CameraFeed>

      {/* Loading state */}
      {loading && !isCameraReady && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0D0D1A] gap-4">
          <div className="relative">
            <div className="w-14 h-14 border-2 border-[#A78BFA]/30 border-t-[#A78BFA] rounded-full animate-spin" />
            <div className="absolute inset-1 w-12 h-12 border-2 border-[#6EE7B7]/20 border-b-[#6EE7B7] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs text-[#A78BFA] tracking-[0.15em] font-semibold">INITIALIZING CAMERA</p>
            <p className="text-[10px] text-zinc-500 tracking-wider">Please allow camera access when prompted</p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <AnimatePresence>
        {isCameraReady && (
          <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute top-0 left-0 right-0 z-20"
          >
            <div
              className="flex items-center justify-between px-4 bg-gradient-to-b from-black/60 to-transparent"
              style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)', paddingBottom: '1rem' }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isAnalysisActive ? 'bg-[#6EE7B7] shadow-[0_0_8px_rgba(110,231,183,0.6)]' : 'bg-zinc-500'} transition-colors`} />
                <span className="text-[10px] font-medium text-white/40 tracking-wider">
                  {isAnalysisActive ? 'LIVE' : 'STANDBY'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#6EE7B7] to-[#22D3EE]">
                  CINEPOSE
                </span>
                <span className="text-[7px] text-white/25 tracking-[0.4em]">ULTRA AI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <QuickActionButton icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                } active={isFlashOn} onClick={() => setFlashOn(!isFlashOn)} />
                <QuickActionButton icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
                  </svg>
                } onClick={handleFlipCamera} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene intelligence badge */}
      <AnimatePresence>
        {isCameraReady && moodResult && !activeAgent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          >
            <MoodDetectionBadge luminance={sceneLuminance} temperature={sceneTemperature} isGoldenHour={isGoldenHour} isBacklit={isBacklit} tiltAngle={tiltAngle} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCameraReady && lighting && !activeAgent && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-32 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          >
            <LightingBadge condition={lighting.condition} timeRemaining={lighting.timeRemaining} suggestion={lighting.suggestion} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pose overlay */}
      <AnimatePresence>
        {showPoseOverlay && currentPose && isCameraReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="absolute bottom-36 left-1/2 -translate-x-1/2 w-44 h-64 pointer-events-auto"
            >
              <div className="relative w-full h-full">
                <div className="absolute inset-0 rounded-full bg-[#06B6D4]/5 blur-3xl" />
                <HumanoidRobot pose={currentPose} gender={userGender} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DroneGuide active={showDroneMode} onClose={() => setShowDroneMode(false)} />

      {/* Active agent panel */}
      <Suspense fallback={<AgentSkeleton />}>
        <AnimatePresence mode="wait">
          {activeAgent === 'scene' && (
            <AgentPanel key="scene" onClose={() => setActiveAgent(null)} title="Scene Analysis">
              <MasterScenePanel luminance={sceneLuminance} temperature={sceneTemperature} isGoldenHour={isGoldenHour} isBacklit={isBacklit} tiltAngle={tiltAngle} />
            </AgentPanel>
          )}
          {activeAgent === 'photo' && (
            <AgentPanel key="photo" onClose={() => setActiveAgent(null)} title="AI Photographer">
              <AIPhotographerPanel luminance={sceneLuminance} temperature={sceneTemperature} />
            </AgentPanel>
          )}
          {activeAgent === 'cine' && (
            <AgentPanel key="cine" onClose={() => setActiveAgent(null)} title="AI Cinematographer">
              <AICinematographerPanel />
            </AgentPanel>
          )}
          {activeAgent === 'style' && (
            <AgentPanel key="style" onClose={() => setActiveAgent(null)} title="Outfit & Style">
              <AIOutfitPanel />
            </AgentPanel>
          )}
          {activeAgent === 'loc' && (
            <AgentPanel key="loc" onClose={() => setActiveAgent(null)} title="Location Intelligence">
              <AILocationPanel luminance={sceneLuminance} temperature={sceneTemperature} isGoldenHour={isGoldenHour} tiltAngle={tiltAngle} />
            </AgentPanel>
          )}
          {activeAgent === 'vision' && (
            <AgentPanel key="vision" onClose={() => setActiveAgent(null)} title="Director Vision">
              <DirectorVisionPanel isGoldenHour={isGoldenHour} />
            </AgentPanel>
          )}
          {activeAgent === 'holly' && (
            <AgentPanel key="holly" onClose={() => setActiveAgent(null)} title="Hollywood Director">
              <HollywoodDirectorPanel />
            </AgentPanel>
          )}
          {activeAgent === 'chat' && (
            <AgentPanel key="chat" onClose={() => setActiveAgent(null)} title="CineGPT">
              <CineGPTPanel />
            </AgentPanel>
          )}
          {activeAgent === 'ar' && (
            <AgentPanel key="ar" onClose={() => setActiveAgent(null)} title="AR Pose Guide">
              <ARPoseProjection visible />
            </AgentPanel>
          )}
          {activeAgent === 'poses' && (
            <AgentPanel key="poses" onClose={() => setActiveAgent(null)} title="Pose Guide">
              <div className="p-4">
                <PoseControls currentPose={currentPose} genderSet={!!settings.gender} onRequestGender={() => {}} />
              </div>
            </AgentPanel>
          )}
          {activeAgent === 'memory' && (
            <AgentPanel key="memory" onClose={() => setActiveAgent(null)} title="AI Memory">
              <MemoryPanel />
            </AgentPanel>
          )}
        </AnimatePresence>
      </Suspense>

      {/* Bottom controls */}
      <AnimatePresence>
        {isCameraReady && !activeAgent && (
          <motion.div
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ delay: 0.15, type: 'spring', damping: 24, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-20"
          >
            <div
              className="px-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              style={{ paddingTop: '3rem', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
            >
              {/* Agent tabs */}
              {!showPoseOverlay && (
                <div className="mb-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-2">
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => toggleAgent(agent.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md border text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer
                          bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 active:scale-95"
                      >
                        <span className="w-3.5 h-3.5 shrink-0">{agent.icon}</span>
                        <span>{agent.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shutter + actions */}
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={() => setShowPoseOverlay(!showPoseOverlay)}
                  className={`p-3 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                    showPoseOverlay ? 'bg-[#06B6D4]/20 border-[#06B6D4]/40 text-[#06B6D4]' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="5" r="3" /><path d="M12 8v4" /><path d="M8 14l-3 6" /><path d="M16 14l3 6" /><path d="M12 12l-4 6" /><path d="M12 12l4 6" /><path d="M9 18l3-2 3 2" />
                  </svg>
                </button>
                <ShutterButton onCapture={handleCapture} />
                <button
                  onClick={() => setShowDroneMode(!showDroneMode)}
                  className={`p-3 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                    showDroneMode ? 'bg-[#6EE7B7]/20 border-[#6EE7B7]/40 text-[#6EE7B7]' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 9l10 7 10-7-10-7z" /><path d="M2 9v5l10 7 10-7V9" />
                  </svg>
                </button>
              </div>

              {/* Scene info strip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center mt-3 h-4"
              >
                {moodResult && (
                  <span className="text-[9px] text-zinc-500 font-medium tracking-wider uppercase">
                    {moodResult.primary} &middot; {locationAnalysis?.locationType || 'analyzing'}
                  </span>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LUT picker */}
      <BottomSheet open={showLUTPicker} onClose={() => setShowLUTPicker(false)} title="Color Grading" height="50%">
        <LUTPicker />
      </BottomSheet>

      {/* Memory panel */}
      <BottomSheet open={showMemory} onClose={() => setShowMemory(false)} title="AI Memory" height="50%">
        <MemoryPanel />
      </BottomSheet>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}

function QuickActionButton({ icon, active, onClick }: { icon: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
        active
          ? 'bg-[#A78BFA]/20 border-[#A78BFA]/40 text-[#A78BFA] shadow-[0_0_12px_rgba(167,139,250,0.2)]'
          : 'bg-black/40 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
      }`}
    >
      {icon}
    </motion.button>
  );
}

function AgentPanel({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="absolute bottom-30 left-4 right-4 z-20 max-h-[45vh] overflow-y-auto rounded-xl backdrop-blur-2xl bg-black/70 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    >
      <div className="sticky top-0 flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-black/40 backdrop-blur-md rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] shadow-[0_0_6px_rgba(110,231,183,0.5)]" />
          <span className="text-xs font-semibold text-zinc-200 tracking-wide">{title}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/10 transition-colors text-zinc-500 hover:text-zinc-300 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  );
}

function AgentSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute bottom-30 left-4 right-4 z-20 rounded-xl backdrop-blur-2xl bg-black/70 border border-white/10 p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
        <div className="h-3 w-24 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-2.5">
        <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
        <div className="h-2 w-3/4 bg-white/5 rounded animate-pulse" />
        <div className="h-2 w-1/2 bg-white/5 rounded animate-pulse" />
      </div>
    </motion.div>
  );
}

function MemoryPanel() {
  const { longTerm, shortTerm, pastSuccessfulScenes } = useMemoryStore();
  const topPoses = useMemoryStore(s => s.getTopPreferences('pose'));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/5 p-3">
          <div className="text-[10px] text-white/40 font-mono mb-1">PREFERENCES</div>
          <div className="text-lg text-white font-semibold">{longTerm.length}</div>
          <div className="text-[9px] text-white/30">learned patterns</div>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <div className="text-[10px] text-white/40 font-mono mb-1">SESSION</div>
          <div className="text-lg text-white font-semibold">{shortTerm.length}</div>
          <div className="text-[9px] text-white/30">recent interactions</div>
        </div>
      </div>

      {topPoses.length > 0 && (
        <div>
          <div className="text-[10px] text-white/40 font-mono mb-2 tracking-wider">FAVORITE POSES</div>
          <div className="flex gap-1.5 flex-wrap">
            {topPoses.map((p, i) => (
              <span key={i} className="px-2 py-1 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[10px] text-[#A78BFA]">
                {p.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {pastSuccessfulScenes.length > 0 && (
        <div>
          <div className="text-[10px] text-white/40 font-mono mb-2 tracking-wider">RECENT SCENES</div>
          <div className="space-y-1">
            {pastSuccessfulScenes.slice(-3).reverse().map((s, i) => (
              <div key={i} className="text-[11px] text-white/50">&#8226; {s}</div>
            ))}
          </div>
        </div>
      )}

      <div className="text-[9px] text-white/20 font-mono text-center pt-2 border-t border-white/5">
        Memory persists locally across sessions
      </div>
    </div>
  );
}

function UltraAppCameraGate() {
  const { startCamera } = useCameraContext();
  const [gatePassed, setGatePassed] = useState(false);
  const storeSetGender = usePoseStore(s => s.setGender);

  if (!gatePassed) {
    return (
      <PermissionsGate
        onStartCamera={startCamera}
        onComplete={(g: 'male' | 'female' | 'neutral') => {
          storeSetGender(g);
          setGatePassed(true);
        }}
      />
    );
  }

  return <UltraAppInner />;
}

export default function UltraApp() {
  return (
    <CameraProvider>
      <ErrorBoundary>
        <UltraAppCameraGate />
      </ErrorBoundary>
    </CameraProvider>
  );
}
