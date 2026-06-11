import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Pose, JointPosition, Gender, HumanoidConfig } from '../../lib/types';
import { BONES } from './PoseLibrary';

const DEFAULT_CONFIG: Record<Gender, HumanoidConfig> = {
  male: { gender: 'male', shoulderWidth: 1.5, hipWidth: 1.0, scale: 1, color: '#A78BFA', emissive: '#6EE7B7', opacity: 0.7 },
  female: { gender: 'female', shoulderWidth: 1.1, hipWidth: 1.0, scale: 1, color: '#A78BFA', emissive: '#6EE7B7', opacity: 0.7 },
  neutral: { gender: 'neutral', shoulderWidth: 1.3, hipWidth: 1.0, scale: 1, color: '#A78BFA', emissive: '#6EE7B7', opacity: 0.7 },
};

interface SkeletonProps {
  pose: Pose;
  gender: Gender;
  animating: boolean;
}

function getJointPosition(pose: Pose, jointName: string): [number, number, number] {
  const joint = pose.joints.find(j => j.name === jointName);
  if (!joint) return [0, 0, 0];

  const config = DEFAULT_CONFIG[pose.genders[0] || 'neutral'];

  let x = joint.x;
  if (jointName.includes('leftShoulder') || jointName.includes('leftHip')) {
    x *= config.shoulderWidth;
  }
  if (jointName.includes('rightShoulder') || jointName.includes('rightHip')) {
    x *= config.shoulderWidth;
  }

  return [x, joint.y - 0.4, joint.z];
}

function JointSphere({ position, color, emissive }: { position: [number, number, number]; color: string; emissive: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 0.7 + 0.3 * Math.sin(state.clock.elapsedTime * 2 + position[1]);
      meshRef.current.material.opacity = pulse;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function BoneCylinder({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);

  const [position, quaternion, scale] = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const length = direction.length();

    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize());

    return [
      [mid.x, mid.y, mid.z] as [number, number, number],
      quat,
      [0.015, length, 0.015] as [number, number, number],
    ];
  }, [start, end]);

  useFrame((state) => {
    if (ref.current) {
      const glow = 0.4 + 0.3 * Math.sin(state.clock.elapsedTime * 1.5 + position[1]);
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;
    }
  });

  return (
    <mesh ref={ref} position={position} quaternion={quaternion}>
      <cylinderGeometry args={[1, 1, 1, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        transparent
        opacity={0.5}
        scale={scale}
      />
    </mesh>
  );
}

function GroundGlow({ gender }: { gender: Gender }) {
  const config = DEFAULT_CONFIG[gender];
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
      <ringGeometry args={[0.05, 0.2, 32]} />
      <meshBasicMaterial color="#A78BFA" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SkeletonInner({ pose, gender, animating }: SkeletonProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPositions = useRef<Map<string, [number, number, number]>>(new Map());
  const currentPositions = useRef<Map<string, [number, number, number]>>(new Map());

  useEffect(() => {
    pose.joints.forEach(joint => {
      const pos = getJointPosition(pose, joint.name);
      targetPositions.current.set(joint.name, pos);
      if (!currentPositions.current.has(joint.name)) {
        currentPositions.current.set(joint.name, pos);
      }
    });
  }, [pose]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach(child => {
      if (child.userData.jointName) {
        const target = targetPositions.current.get(child.userData.jointName);
        if (target) {
          const current = child.position.toArray();
          const speed = animating ? 8 : 4;
          child.position.x += (target[0] - current[0]) * delta * speed;
          child.position.y += (target[1] - current[1]) * delta * speed;
          child.position.z += (target[2] - current[2]) * delta * speed;
        }
      }
    });

    if (animating) {
      groupRef.current.position.y = -0.02 + 0.02 * Math.sin(Date.now() * 0.003);
    }
  });

  const jointPositions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    pose.joints.forEach(joint => {
      map.set(joint.name, getJointPosition(pose, joint.name));
    });
    return map;
  }, [pose]);

  return (
    <group ref={groupRef}>
      <GroundGlow gender={gender} />
      {BONES.map((bone, i) => {
        const start = jointPositions.get(bone.start);
        const end = jointPositions.get(bone.end);
        if (!start || !end) return null;
        return <BoneCylinder key={`bone-${i}`} start={start} end={end} color="#6EE7B7" />;
      })}
      {pose.joints.map((joint, i) => (
        <group key={`joint-${i}`} userData={{ jointName: joint.name }}>
          <JointSphere
            position={getJointPosition(pose, joint.name)}
            color="#A78BFA"
            emissive="#6EE7B7"
          />
        </group>
      ))}
    </group>
  );
}

function SceneSetup({ gender }: { gender: Gender }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.3, 1.2);
    camera.lookAt(0, -0.1, 0);
  }, [camera]);

  return null;
}

interface HumanoidRobotProps {
  pose: Pose;
  gender: Gender;
  animating?: boolean;
  className?: string;
}

export function HumanoidRobot({ pose, gender, animating = true, className = '' }: HumanoidRobotProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <SceneSetup gender={gender} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[1, 2, 1]} intensity={0.5} color="#A78BFA" />
        <directionalLight position={[-1, 1, -1]} intensity={0.2} color="#6EE7B7" />
        <SkeletonInner pose={pose} gender={gender} animating={animating} />
      </Canvas>
    </div>
  );
}
