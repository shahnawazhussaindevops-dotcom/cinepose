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

function buildFallbackConstraints(config: CameraConfig): MediaStreamConstraints[] {
  const platform = getPlatformInfo();
  const baseVideo: MediaTrackConstraints = {
    facingMode: config.preferredFacingMode === 'unknown' ? 'user' : config.preferredFacingMode,
  };

  if (config.preferredDeviceId) {
    baseVideo.deviceId = { exact: config.preferredDeviceId };
  }

  const lowRes = platform.isMobile && !platform.isTablet;
  const constraints: MediaStreamConstraints[] = [];

  constraints.push({
    video: {
      ...baseVideo,
      width: lowRes ? { ideal: 640 } : config.resolution?.width ? { ideal: config.resolution.width } : { ideal: 1280 },
      height: lowRes ? { ideal: 480 } : config.resolution?.height ? { ideal: config.resolution.height } : { ideal: 720 },
    },
    audio: false,
  });

  constraints.push({
    video: {
      ...baseVideo,
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
    audio: false,
  });

  constraints.push({
    video: {
      ...baseVideo,
    },
    audio: false,
  });

  constraints.push({
    video: {
      facingMode: config.preferredFacingMode === 'environment' ? 'user' : 'environment',
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
    audio: false,
  });

  constraints.push({
    video: true,
    audio: false,
  });

  return constraints;
}

export async function createCameraStreamWithDeviceDiscovery(config: CameraConfig): Promise<StreamResult> {
  const cameras = await enumerateCamerasWithFallback();
  const selected = selectBestCamera(cameras, config.preferredFacingMode, config.preferredDeviceId);

  if (selected) {
    log.info(`Selected camera: ${selected.label} (${selected.facingMode})`);
    return createCameraStream({
      ...config,
      preferredDeviceId: selected.deviceId,
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

export function attachStreamToVideo(video: HTMLVideoElement, stream: MediaStream): Promise<void> {
  return new Promise((resolve, reject) => {
    video.srcObject = stream;
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', '');
    video.muted = true;

    const onCanPlay = () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      video.play()
        .then(() => resolve())
        .catch((err) => {
          log.warn('Video play() failed on canplay, retrying...', err);
          retryPlay(video).then(resolve).catch(reject);
        });
    };

    const onError = () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      reject(new Error('Video element error during stream attachment'));
    };

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);

    video.load();

    if (video.readyState >= 2) {
      onCanPlay();
    }
  });
}

async function retryPlay(video: HTMLVideoElement, attempts = 3): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      await video.play();
      return;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise(r => setTimeout(r, 100 * (i + 1)));
    }
  }
}

export function detachStreamFromVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
  video.srcObject = null;
  video.load();
}
