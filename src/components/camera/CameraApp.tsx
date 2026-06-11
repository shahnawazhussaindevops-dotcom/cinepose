import React, { useState, useCallback, useEffect } from 'react';
import { CameraFeed } from './CameraFeed';
import { CameraControls } from './CameraControls';
import { ShutterButton } from './ShutterButton';
import { LUTPicker } from '../lut/LUTPicker';
import { LightingBadge } from '../lighting/LightingBadge';
import { HumanoidRobot } from '../pose/HumanoidRobot';
import { PoseControls } from '../pose/PoseControls';
import { GenderSelector } from '../pose/GenderSelector';
import { DroneGuide } from '../drone/DroneGuide';
import { BottomSheet } from '../ui/BottomSheet';
import { Toast } from '../ui/Toast';
import { useCamera } from '../../hooks/useCamera';
import { useGyroscope } from '../../hooks/useGyroscope';
import { useLighting } from '../../hooks/useLighting';
import { useCameraStore } from '../../stores/cameraStore';
import { usePoseStore } from '../../stores/poseStore';
import { useLUTStore } from '../../stores/lutStore';
import { useAppStore } from '../../stores/appStore';
import { getRecommendedPoses } from '../pose/PoseLibrary';

export function CameraApp() {
  const { videoRef, loading, takePhoto, captureFrame, toggleCamera, setZoom, zoom } = useCamera();
  const { lighting, startAnalysis } = useLighting();
  const { detectCameraAngle } = useGyroscope();
  const { photosTaken, setCurrentLighting } = useCameraStore();
  const { recommendedPoses, currentPoseIndex, setRecommendedPoses, selectedGender } = usePoseStore();
  const { currentLUT } = useLUTStore();
  const { showPoseMode, showDroneMode, setShowPoseMode, setShowDroneMode, showLUTPicker, setShowLUTPicker, settings, setOnboarding } = useAppStore();

  const [showGenderSelect, setShowGenderSelect] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [showPoseControls, setShowPoseControls] = useState(false);

  const currentPose = recommendedPoses[currentPoseIndex] || recommendedPoses[0];

  useEffect(() => {
    if (videoRef.current && !loading) {
      startAnalysis(videoRef.current);
    }
  }, [videoRef, loading, startAnalysis]);

  useEffect(() => {
    if (lighting) {
      const angle = detectCameraAngle();
      setRecommendedPoses(
        lighting.condition === 'golden_hour' ? 'nature' : 'urban',
        angle,
        selectedGender
      );
    }
  }, [lighting, selectedGender, detectCameraAngle, setRecommendedPoses]);

  const handleCapture = useCallback(() => {
    const photo = takePhoto();
    if (photo) {
      setToast({ message: 'Photo captured!', type: 'success' });
      setTimeout(() => setToast(null), 2500);
    }
  }, [takePhoto]);

  const handleTogglePose = useCallback(() => {
    const newVal = !showPoseMode;
    setShowPoseMode(newVal);
    setShowPoseControls(newVal);
    if (newVal && !settings.gender) {
      setShowGenderSelect(true);
    }
  }, [showPoseMode, settings.gender, setShowPoseMode]);

  const handleGenderSelect = useCallback((gender: any) => {
    useAppStore.getState().updateSettings({ gender });
    setShowGenderSelect(false);
    setOnboarding({ genderSelected: true });
  }, [setOnboarding]);

  return (
    <div className="fixed inset-0 bg-black">
      {/* Camera Feed */}
      <CameraFeed
        onFrame={(video) => {
          if (lighting) {
            setCurrentLighting(lighting);
          }
        }}
      />

      {/* Pose Mode Overlay */}
      {showPoseMode && currentPose && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-48 h-72 pointer-events-auto">
            <HumanoidRobot pose={currentPose} gender={selectedGender} />
          </div>
        </div>
      )}

      {/* Drone Mode Overlay */}
      <DroneGuide
        active={showDroneMode}
        onClose={() => setShowDroneMode(false)}
      />

      {/* Lighting Badge */}
      {lighting && !showPoseMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <LightingBadge
            condition={lighting.condition}
            timeRemaining={lighting.timeRemaining}
            suggestion={lighting.suggestion}
          />
        </div>
      )}

      {/* Camera Controls */}
      {!showPoseMode && (
        <CameraControls
          onCapture={handleCapture}
          onTogglePose={handleTogglePose}
          onToggleDrone={() => setShowDroneMode(!showDroneMode)}
          onOpenLUT={() => setShowLUTPicker(true)}
        />
      )}

      {/* Pose Mode Bottom Controls */}
      {showPoseMode && (
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto">
          <PoseControls
            currentPose={currentPose}
            genderSet={!!settings.gender}
            onRequestGender={() => setShowGenderSelect(true)}
          />
        </div>
      )}

      {/* LUT Picker Bottom Sheet */}
      <BottomSheet
        open={showLUTPicker}
        onClose={() => setShowLUTPicker(false)}
        title="LUT Picker"
        height="55%"
      >
        <LUTPicker />
      </BottomSheet>

      {/* Gender Selection Bottom Sheet */}
      <BottomSheet
        open={showGenderSelect}
        onClose={() => setShowGenderSelect(false)}
        height="60%"
        showHandle={false}
      >
        <GenderSelector
          selected={selectedGender}
          onSelect={handleGenderSelect}
          onContinue={() => setShowGenderSelect(false)}
        />
      </BottomSheet>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
