import { useState, useEffect, useRef } from 'react';

interface OrientationData {
  alpha: number;
  beta: number;
  gamma: number;
  tiltAngle: number;
  isLandscape: boolean;
}

export function useGyroscope() {
  const [orientation, setOrientation] = useState<OrientationData>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    tiltAngle: 0,
    isLandscape: false,
  });

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [supported, setSupported] = useState(false);
  const lastData = useRef<OrientationData>({ alpha: 0, beta: 0, gamma: 0, tiltAngle: 0, isLandscape: false });

  useEffect(() => {
    if (!window.DeviceOrientationEvent) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha || 0;
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;

      const tiltAngle = Math.abs(beta - 90);
      const isLandscape = Math.abs(gamma) > 20;

      const data = { alpha, beta, gamma, tiltAngle, isLandscape };
      lastData.current = data;
      setOrientation(data);
    };

    const requestPermission = async () => {
      if (
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            setPermissionGranted(true);
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch {
          setPermissionGranted(false);
        }
      } else {
        setPermissionGranted(true);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const detectCameraAngle = (): 'eye_level' | 'low_angle' | 'high_angle' | 'bird_eye' | 'overhead' => {
    const tilt = lastData.current.tiltAngle;

    if (tilt > 60) return 'overhead';
    if (tilt > 30) return 'bird_eye';
    if (tilt < 15) return 'low_angle';
    if (tilt > 15 && tilt < 30) return 'high_angle';
    return 'eye_level';
  };

  return {
    orientation,
    supported,
    permissionGranted,
    detectCameraAngle,
  };
}
