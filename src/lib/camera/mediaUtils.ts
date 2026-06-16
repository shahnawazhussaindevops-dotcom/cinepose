import type { PlatformInfo, CameraErrorType, CameraErrorInfo, CameraErrorType as CET } from './types';

const LOG_PREFIX = '[CineposeCamera]';

export const log = {
  info: (msg: string, data?: unknown) => {
    console.info(`${LOG_PREFIX} ${msg}`, data ?? '');
  },
  warn: (msg: string, data?: unknown) => {
    console.warn(`${LOG_PREFIX} ${msg}`, data ?? '');
  },
  error: (msg: string, data?: unknown) => {
    console.error(`${LOG_PREFIX} ${msg}`, data ?? '');
  },
  debug: (msg: string, data?: unknown) => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('cinepose_camera_debug') === 'true') {
      console.debug(`${LOG_PREFIX} [DEBUG] ${msg}`, data ?? '');
    }
  },
};

export function getPlatformInfo(): PlatformInfo {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platform = typeof navigator !== 'undefined' ? (navigator as any).platform || '' : '';

  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isMobile = isAndroid || isIOS || /mobi/i.test(ua);
  const isTablet = isIOS && /ipad/i.test(ua) || (isAndroid && !/mobi/i.test(ua)) || /tablet/i.test(ua);
  const isChrome = /chrome/i.test(ua) && !/edge|opr/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/chrome|edge|opr/i.test(ua);
  const isFirefox = /firefox/i.test(ua);
  const isSamsung = /samsung/i.test(ua) || /samsungbrowser/i.test(ua);
  const isEdge = /edge/i.test(ua) || /edg/i.test(ua);

  let osVersion = '';
  if (isAndroid) {
    const match = ua.match(/android\s([\d.]+)/i);
    if (match) osVersion = match[1];
  } else if (isIOS) {
    const match = ua.match(/os\s([\d_]+)\s/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  }

  let browserVersion = '';
  if (isChrome) {
    const match = ua.match(/chrome\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (isSafari) {
    const match = ua.match(/version\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (isFirefox) {
    const match = ua.match(/firefox\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (isEdge) {
    const match = ua.match(/edge?\/([\d.]+)/i) || ua.match(/edg\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  } else if (isSamsung) {
    const match = ua.match(/samsungbrowser\/([\d.]+)/i);
    if (match) browserVersion = match[1];
  }

  return {
    isMobile, isAndroid, isIOS, isTablet,
    isChrome, isSafari, isFirefox, isSamsung, isEdge,
    osVersion, browserVersion, userAgent: ua,
  };
}

export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return true;
  return window.isSecureContext ||
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
}

export function supportsMediaDevices(): boolean {
  return !!(typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
}

export function supportsEnumerateDevices(): boolean {
  return !!(typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.enumerateDevices === 'function');
}

export function supportsWebGL2(): boolean {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
}

export function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';
  if (window.screen && typeof window.screen.orientation?.type === 'string') {
    return window.screen.orientation.type.startsWith('portrait') ? 'portrait' : 'landscape';
  }
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

export function getDisplayAspectRatio(): number {
  if (typeof window === 'undefined') return 16 / 9;
  return window.innerWidth / window.innerHeight;
}

export function classifyCameraError(err: unknown): CameraErrorInfo {
  const name = (err as any)?.name || '';
  const message = (err as any)?.message || '';
  const constraint = (err as any)?.constraint || '';
  const platform = getPlatformInfo();

  const base: Omit<CameraErrorInfo, 'type'> = {
    message: message || 'An unknown camera error occurred.',
    originalError: err,
    actionable: true,
    suggestion: 'Please try again or check your camera settings.',
    retryable: true,
  };

  if (name === 'SecurityError' || name === 'NotSupportedError') {
    if (!isSecureContext()) {
      return { ...base, type: 'SecurityError', message: 'Camera access requires a secure connection (HTTPS). This page is not secure.', suggestion: 'Access this site via HTTPS (https://) to use the camera.', retryable: false };
    }
    return { ...base, type: 'NotSupported', message: 'Camera API is not supported in this browser. Please try Chrome, Safari, or Firefox.', suggestion: 'Update your browser or try a different browser like Chrome or Safari.', retryable: false };
  }

  if (name === 'NotAllowedError') {
    if (platform.isIOS || platform.isSafari) {
      return { ...base, type: 'PermissionDenied', message: 'Camera access denied. Go to Settings > Safari > Camera and enable camera access, then reload.', suggestion: 'Open iOS Settings > Safari > Camera, select "Allow", then reload this page.', retryable: false };
    }
    if (platform.isAndroid && platform.isChrome) {
      return { ...base, type: 'PermissionDenied', message: 'Camera access denied. Tap the lock icon 🔒 in the address bar, enable Camera permission, then reload.', suggestion: 'Tap the lock/info icon in Chrome address bar, enable Camera, then reload the page.', retryable: false };
    }
    if (platform.isSamsung) {
      return { ...base, type: 'PermissionDenied', message: 'Camera access denied. Open Samsung Internet settings > Site permissions > Camera, and allow access.', suggestion: 'Go to Samsung Internet settings > Sites and downloads > Site permissions > Camera, then reload.', retryable: false };
    }
    return { ...base, type: 'PermissionDenied', message: 'Camera access denied. Please enable camera permissions in your browser settings and reload.', suggestion: 'Check your browser settings to allow camera access for this site.', retryable: false };
  }

  if (name === 'NotFoundError' || message.includes('NotFoundError') || message.includes('not found')) {
    return { ...base, type: 'CameraUnavailable', message: 'No camera found on this device. Please ensure a camera is connected and not being used by another app.', suggestion: 'Connect a camera or close other apps using the camera.', retryable: true };
  }

  if (name === 'NotReadableError' || message.includes('NotReadable') || message.includes('in use') || message.includes('already in use')) {
    return { ...base, type: 'CameraInUse', message: 'Camera is already in use by another application. Please close other apps or tabs using the camera.', suggestion: 'Close other applications or browser tabs that may be using the camera.', retryable: true };
  }

  if (name === 'OverconstrainedError' || message.includes('Overconstrained') || constraint) {
    return { ...base, type: 'OverconstrainedError', message: 'Camera does not support the requested settings. Trying default configuration...', suggestion: 'Using default camera settings.', retryable: true };
  }

  if (name === 'AbortError' || message.includes('AbortError')) {
    return { ...base, type: 'AbortError', message: 'Camera request was aborted. Please try again.', suggestion: 'Click the retry button to try again.', retryable: true };
  }

  if (name === 'TypeError' || message.includes('TypeError')) {
    return { ...base, type: 'TypeError', message: 'Invalid camera configuration. Using default settings.', suggestion: 'Using default camera settings.', retryable: true };
  }

  if (message.includes('permission') || message.includes('Permission')) {
    return { ...base, type: 'PermissionDenied', message: message || 'Camera access was denied.', suggestion: 'Check your browser settings to allow camera access for this site.', retryable: false };
  }

  if (message.includes('SecurityError') || message.includes('NotSupportedError')) {
    return { ...base, type: 'NotSupported', message: message || 'Camera not supported in this browser.', suggestion: 'Update your browser or try a different browser.', retryable: false };
  }

  return { ...base, type: 'Unknown', message: `Camera error: ${message || name || 'Unknown error'}`, suggestion: 'Please try again. If the problem persists, restart your device.', retryable: true };
}

export const CAMERA_ERROR_MESSAGES: Record<CET, { title: string; icon: string }> = {
  PermissionDenied: { title: 'Camera Access Denied', icon: '🔒' },
  PermissionBlocked: { title: 'Camera Permission Blocked', icon: '🚫' },
  CameraUnavailable: { title: 'No Camera Found', icon: '📷' },
  CameraInUse: { title: 'Camera Busy', icon: '🔄' },
  NotSupported: { title: 'Browser Not Supported', icon: '🌐' },
  NotAllowedError: { title: 'Camera Access Denied', icon: '🔒' },
  NotFoundError: { title: 'No Camera Found', icon: '📷' },
  NotReadableError: { title: 'Camera Busy', icon: '🔄' },
  OverconstrainedError: { title: 'Camera Configuration Issue', icon: '⚙️' },
  AbortError: { title: 'Camera Request Aborted', icon: '⏹️' },
  SecurityError: { title: 'Secure Connection Required', icon: '🔐' },
  TypeError: { title: 'Camera Configuration Error', icon: '⚙️' },
  Unknown: { title: 'Camera Error', icon: '❌' },
};

let debugMode = false;

export function setDebugMode(enabled: boolean) {
  debugMode = enabled;
  if (enabled && typeof localStorage !== 'undefined') {
    localStorage.setItem('cinepose_camera_debug', 'true');
  } else if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('cinepose_camera_debug');
  }
}

export function isDebugMode(): boolean {
  return debugMode || (typeof localStorage !== 'undefined' && localStorage.getItem('cinepose_camera_debug') === 'true');
}
