import type { CameraDeviceInfo, CameraErrorInfo, CameraConfig, CameraFacingMode } from './types';
import { log, classifyCameraError, getPlatformInfo, supportsMediaDevices, isSecureContext } from './mediaUtils';
import { checkCameraPermission, requestCameraAccess } from './permissions';
import { enumerateCamerasWithFallback, selectBestCamera } from './cameraDevice';

export interface StreamResult {
  stream: MediaStream | null;
  device: CameraDeviceInfo | null;
  error: CameraErrorInfo | null;
}

export interface TrackInfo {
  label: string;
  facingMode: CameraFacingMode;
  resolution: { width: number; height: number } | null;
  frameRate: number | null;
}

export function getTrackInfo(track: MediaStreamVideoTrack): TrackInfo {
  const settings = track.getSettings();
  return {
    label: track.label || 'Unknown Camera',
    facingMode: (settings.facingMode as CameraFacingMode) || 'unknown',
    resolution: settings.width && settings.height ? { width: settings.width, height: settings.height } : null,
    frameRate: settings.frameRate || null,
  };
}

export async function createCameraStream(config: CameraConfig): Promise<StreamResult> {
  log.info('Creating camera stream...', config);

  if (!isSecureContext()) {
    return {
      stream: null,
      device: null,
      error: {
        type: 'SecurityError',
        message: 'Camera access requires a secure connection (HTTPS).',
        originalError: null,
        actionable: true,
        suggestion: 'Access this site via HTTPS.',
        retryable: false,
      },
    };
  }

  if (!supportsMediaDevices()) {
    return {
      stream: null,
      device: null,
      error: {
        type: 'NotSupported',
        message: 'Camera API not supported in this browser.',
        originalError: null,
        actionable: false,
        suggestion: 'Use Chrome, Firefox, or Safari.',
        retryable: false,
      },
    };
  }

  const permCheck = await checkCameraPermission();
  if (permCheck.error) {
    if (permCheck.state === 'denied') {
      return { stream: null, device: null, error: permCheck.error };
    }
  }

  const fallbackConstraints = buildFallbackConstraints(config);
  let lastError: CameraErrorInfo | null = null;

  for (let i = 0; i < fallbackConstraints.length; i++) {
    const constraints = fallbackConstraints[i];
    log.debug(`Trying constraint set ${i + 1}/${fallbackConstraints.length}`, constraints);

    const { stream, error } = await requestCameraAccess(constraints);
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const trackInfo = getTrackInfo(track);

      const device: CameraDeviceInfo = {
        deviceId: trackInfo.label,
        groupId: '',
        label: trackInfo.label,
        kind: 'videoinput',
        facingMode: trackInfo.facingMode,
      };

      log.info('Camera stream created successfully', trackInfo);
      return { stream, device, error: null };
    }

    lastError = error;
    if (error && !error.retryable) {
      log.warn('Non-retryable error, stopping fallback sequence', error);
      break;
    }
  }

  return { stream: null, device: null, error: lastError };
}

const SAFE_RESOLUTIONS = [
  { width: 1280, height: 720 },
  { width: 640, height: 480 },
  { width: 1920, height: 1080 },
] as const;

function normalizeResolution(resolution?: { width: number; height: number }): { width: { ideal: number }; height: { ideal: number } } | undefined {
  if (!resolution) return undefined;
  const safe = SAFE_RESOLUTIONS.find(r => r.width === resolution.width && r.height === resolution.height);
  if (safe) return { width: { ideal: safe.width }, height: { ideal: safe.height } };
  if (resolution.width >= 1920 || resolution.height >= 1080) {
    return { width: { ideal: 1920 }, height: { ideal: 1080 } };
  }
  if (resolution.width >= 1280 || resolution.height >= 720) {
    return { width: { ideal: 1280 }, height: { ideal: 720 } };
  }
  return { width: { ideal: 640 }, height: { ideal: 480 } };
}

function buildFallbackConstraints(config: CameraConfig): MediaStreamConstraints[] {
  const platform = getPlatformInfo();
  const baseVideo: MediaTrackConstraints = {
    facingMode: config.preferredFacingMode === 'unknown' ? 'environment' : config.preferredFacingMode,
  };

  // Don't use exact deviceId on mobile as it can fail
  if (config.preferredDeviceId && !platform.isMobile) {
    baseVideo.deviceId = { exact: config.preferredDeviceId };
  }

  const constraints: MediaStreamConstraints[] = [];

  // First try: Simple facingMode only (most compatible on mobile)
  constraints.push({
    video: {
      facingMode: config.preferredFacingMode === 'unknown' ? 'environment' : config.preferredFacingMode,
    },
    audio: false,
  });

  // Second try: With ideal resolution
  constraints.push({
    video: {
      ...baseVideo,
      width: { ideal: platform.isMobile ? 1280 : 1920 },
      height: { ideal: platform.isMobile ? 720 : 1080 },
    },
    audio: false,
  });

  // Third try: Lower resolution
  constraints.push({
    video: {
      ...baseVideo,
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
    audio: false,
  });

  // Fourth try: Just video true (most permissive)
  constraints.push({
    video: true,
    audio: false,
  });

  // Fifth try: Opposite facing mode with simple constraints
  constraints.push({
    video: {
      facingMode: config.preferredFacingMode === 'environment' ? 'user' : 'environment',
    },
    audio: false,
  });

  return constraints;
}

export async function createCameraStreamWithDeviceDiscovery(config: CameraConfig): Promise<StreamResult> {
  const platform = getPlatformInfo();
  
  // On mobile, skip device enumeration if we have a facing mode - just try to get the stream directly
  if (platform.isMobile && config.preferredFacingMode && config.preferredFacingMode !== 'unknown' && !config.preferredDeviceId) {
    log.info('Mobile device: Skipping enumeration, trying direct stream access with facingMode');
    return createCameraStream(config);
  }
  
  const cameras = await enumerateCamerasWithFallback();
  
  if (cameras.length === 0) {
    log.warn('No cameras found via enumeration, trying direct stream access anyway');
    return createCameraStream(config);
  }
  
  const selected = selectBestCamera(cameras, config.preferredFacingMode, config.preferredDeviceId);

  if (selected) {
    log.info(`Selected camera: ${selected.label} (${selected.facingMode})`);
    return createCameraStream({
      ...config,
      preferredDeviceId: selected.deviceId !== 'default' ? selected.deviceId : undefined,
    });
  }

  return createCameraStream(config);
}

export function stopMediaStream(stream: MediaStream | null) {
  if (!stream) return;
  const tracks = stream.getTracks();
  tracks.forEach(track => {
    try {
      track.stop();
    } catch (err) {
      log.warn('Error stopping track:', err);
    }
  });
  log.info(`Stopped ${tracks.length} media track(s)`);
}

export function pauseMediaStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getVideoTracks().forEach(track => {
    track.enabled = false;
  });
}

export function resumeMediaStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getVideoTracks().forEach(track => {
    track.enabled = true;
  });
}

export function attachStreamToVideo(video: HTMLVideoElement, stream: MediaStream) {
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;

  // Ensure all necessary attributes are set for mobile browsers
  if (!video.hasAttribute('playsinline')) {
    video.setAttribute('playsinline', '');
  }
  if (!video.hasAttribute('webkit-playsinline')) {
    video.setAttribute('webkit-playsinline', 'true');
  }
  if (!video.hasAttribute('x5-playsinline')) {
    video.setAttribute('x5-playsinline', 'true');
  }
  if (!video.hasAttribute('x5-video-player-type')) {
    video.setAttribute('x5-video-player-type', 'h5');
  }
  if (!video.hasAttribute('x5-video-player-fullscreen')) {
    video.setAttribute('x5-video-player-fullscreen', 'false');
  }
  
  // Force video to display
  video.style.display = 'block';
  video.style.objectFit = 'cover';
}

export function detachStreamFromVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
}
