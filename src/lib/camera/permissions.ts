import type { CameraErrorInfo } from './types';
import { log, classifyCameraError, supportsMediaDevices, isSecureContext, getPlatformInfo } from './mediaUtils';

export type PermissionCheckResult = {
  state: PermissionState | 'unsupported' | 'unknown';
  error: CameraErrorInfo | null;
};

export async function checkCameraPermission(): Promise<PermissionCheckResult> {
  log.info('Checking camera permission state...');

  if (!isSecureContext()) {
    log.warn('Insecure context - camera requires HTTPS');
    return {
      state: 'denied',
      error: classifyCameraError({
        name: 'SecurityError',
        message: 'Camera access requires a secure context (HTTPS).'
      }),
    };
  }

  if (!supportsMediaDevices()) {
    log.error('MediaDevices API not supported');
    return {
      state: 'unsupported',
      error: classifyCameraError({
        name: 'NotSupportedError',
        message: 'Camera API is not supported in this browser.'
      }),
    };
  }

  try {
    if (typeof navigator.permissions?.query === 'function') {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      log.info('Permission state:', result.state);

      const handleChange = () => {
        log.info('Camera permission state changed:', result.state);
      };
      result.addEventListener('change', handleChange, { once: true });

      if (result.state === 'denied') {
        return {
          state: 'denied',
          error: classifyCameraError({
            name: 'NotAllowedError',
            message: 'Camera permission was previously denied and blocked by the browser.'
          }),
        };
      }

      return { state: result.state as PermissionState, error: null };
    }
  } catch (err) {
    log.warn('Permissions API query failed (expected on some browsers):', err);
  }

  return { state: 'unknown', error: null };
}

export async function requestCameraAccess(
  constraints?: MediaStreamConstraints
): Promise<{ stream: MediaStream | null; error: CameraErrorInfo | null }> {
  log.info('Requesting camera access...');

  const platform = getPlatformInfo();
  const useConstraints: MediaStreamConstraints = constraints || {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user',
    },
    audio: false,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(useConstraints);
    log.info('Camera access granted');
    return { stream, error: null };
  } catch (err) {
    const errorInfo = classifyCameraError(err);
    log.error('Camera access denied:', { type: errorInfo.type, message: errorInfo.message });
    return { stream: null, error: errorInfo };
  }
}

export function getCameraPermissionGuidance(error: CameraErrorInfo): {
  title: string;
  steps: string[];
  icon: string;
} {
  const platform = getPlatformInfo();

  if (error.type === 'PermissionDenied' || error.type === 'NotAllowedError') {
    if (platform.isIOS) {
      return {
        title: 'Enable Camera Access for Safari',
        steps: [
          'Open the Settings app on your iPhone/iPad',
          'Scroll down and tap Safari',
          'Tap Camera under "Settings for Websites"',
          'Select Allow',
          'Return to Safari and reload this page',
        ],
        icon: '📱',
      };
    }
    if (platform.isAndroid && platform.isChrome) {
      return {
        title: 'Enable Camera Access in Chrome',
        steps: [
          'Tap the lock icon 🔒 in the address bar',
          'Tap Site settings',
          'Tap Camera and select Allow',
          'Reload the page',
        ],
        icon: '🔒',
      };
    }
    if (platform.isSamsung) {
      return {
        title: 'Enable Camera Access in Samsung Internet',
        steps: [
          'Tap the menu icon (☰) at the bottom',
          'Tap Settings',
          'Tap Sites and downloads > Site permissions',
          'Tap Camera and allow for this site',
          'Reload the page',
        ],
        icon: '🌐',
      };
    }
    return {
      title: 'Enable Camera Access',
      steps: [
        'Click the lock/info icon in your browser address bar',
        'Find Camera permission settings',
        'Set Camera to Allow',
        'Reload the page',
      ],
      icon: '🔒',
    };
  }

  if (error.type === 'SecurityError') {
    return {
      title: 'Use a Secure Connection',
      steps: [
        'Access this site using HTTPS (https://)',
        'If using local development, use localhost',
        'Reload the page with the correct URL',
      ],
      icon: '🔐',
    };
  }

  if (error.type === 'NotSupported') {
    return {
      title: 'Update Your Browser',
      steps: [
        'Try using Chrome, Safari, or Firefox',
        'Update your browser to the latest version',
        'Ensure camera access is not restricted by your device settings',
      ],
      icon: '🌐',
    };
  }

  if (error.type === 'CameraUnavailable') {
    return {
      title: 'No Camera Detected',
      steps: [
        'Ensure your device has a camera',
        'Check if the camera is not being used by another app',
        'Connect an external camera if available',
        'Restart your browser and try again',
      ],
      icon: '📷',
    };
  }

  return {
    title: 'Camera Error',
    steps: ['Please try again', 'If the problem persists, restart your browser', 'Check that no other app is using the camera'],
    icon: '❌',
  };
}
