import { create } from 'zustand';
import type { Pose, Gender, SceneType, CameraAngle } from '../lib/types';
import { getRecommendedPoses, POSES } from '../components/pose/PoseLibrary';

interface PoseState {
  currentPoseIndex: number;
  recommendedPoses: Pose[];
  selectedGender: Gender;
  poseFeedback: Record<string, boolean>;

  setGender: (gender: Gender) => void;
  setRecommendedPoses: (scene: SceneType, angle: CameraAngle, gender: Gender) => void;
  nextPose: () => void;
  prevPose: () => void;
  setPoseIndex: (index: number) => void;
  giveFeedback: (poseId: string, helpful: boolean) => void;
  reset: () => void;
}

export const usePoseStore = create<PoseState>((set, get) => ({
  currentPoseIndex: 0,
  recommendedPoses: POSES.slice(0, 5),
  selectedGender: 'neutral',
  poseFeedback: {},

  setGender: (gender) => set({ selectedGender: gender }),

  setRecommendedPoses: (scene, angle, gender) => {
    const poses = getRecommendedPoses(scene, angle, gender);
    set({ recommendedPoses: poses, currentPoseIndex: 0 });
  },

  nextPose: () =>
    set((state) => ({
      currentPoseIndex: Math.min(
        state.currentPoseIndex + 1,
        state.recommendedPoses.length - 1
      ),
    })),

  prevPose: () =>
    set((state) => ({
      currentPoseIndex: Math.max(state.currentPoseIndex - 1, 0),
    })),

  setPoseIndex: (index) => set({ currentPoseIndex: index }),

  giveFeedback: (poseId, helpful) =>
    set((state) => ({
      poseFeedback: { ...state.poseFeedback, [poseId]: helpful },
    })),

  reset: () =>
    set({
      currentPoseIndex: 0,
      recommendedPoses: POSES.slice(0, 5),
      poseFeedback: {},
    }),
}));
