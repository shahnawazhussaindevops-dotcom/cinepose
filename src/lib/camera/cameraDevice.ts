import type { CameraDeviceInfo, CameraFacingMode, CameraErrorInfo } from './types';
import { log, supportsEnumerateDevices } from './mediaUtils';
import { requestCameraAccess } from './permissions';

let cachedDevices: CameraDeviceInfo[] | null = null;
let deviceDiscoveryPromise: Promise<CameraDeviceInfo[]> | null = null;

export async function enumerateCameras(forceRefresh = false): Promise<CameraDeviceInfo[]> {
  if (cachedDevices && !forceRefresh) {
    return cachedDevices;
  }

  if (deviceDiscoveryPromise && !forceRefresh) {
    return deviceDiscoveryPromise;
  }

  if (!supportsEnumerateDevices()) {
    log.warn('enumerateDevices not supported');
    cachedDevices = [];
    return [];
  }

  deviceDiscoveryPromise = (async () => {
    try {
      const rawDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = rawDevices.filter(d => d.kind === 'videoinput');

      const cameras: CameraDeviceInfo[] = await Promise.all(
        videoDevices.map(async (device) => {
          const info: CameraDeviceInfo = {
            deviceId: device.deviceId,
            groupId: device.groupId,
            label: device.label || `Camera ${videoDevices.indexOf(device) + 1}`,
            kind: device.kind,
            facingMode: inferFacingMode(device.label, device.deviceId),
          };

          try {
            const tempStream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: device.deviceId } },
              audio: false,
            });
            const track = tempStream.getVideoTracks()[0];
            if (track) {
              info.capabilities = track.getCapabilities?.() || track.getSettings?.();
              track.stop();
            }
            tempStream.getTracks().forEach(t => t.stop());
          } catch {
            // Cannot get capabilities without permission
          }

          return info;
        })
      );

      log.info(`Found ${cameras.length} camera(s):`, cameras.map(c => c.label).join(', '));
      cachedDevices = cameras;
      return cameras;
    } catch (err) {
      log.error('Failed to enumerate devices:', err);
      cachedDevices = [];
      return [];
    } finally {
      deviceDiscoveryPromise = null;
    }
  })();

  return deviceDiscoveryPromise;
}

export async function enumerateCamerasWithFallback(): Promise<CameraDeviceInfo[]> {
  try {
    const devices = await enumerateCameras(true);
    if (devices.length > 0) {
      return devices;
    }
  } catch {
    // Fall through to fallback
  }

  log.warn('enumerateDevices returned no cameras, attempting getUserMedia to trigger permission...');
  const { stream, error } = await requestCameraAccess({ video: true, audio: false });
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    try {
      return await enumerateCameras(true);
    } catch {
      return [];
    }
  }
  return [];
}

export function getCamerasByFacing(cameras: CameraDeviceInfo[], facing: CameraFacingMode): CameraDeviceInfo[] {
  if (facing === 'unknown') return cameras;
  return cameras.filter(c => c.facingMode === facing);
}

export function selectBestCamera(
  cameras: CameraDeviceInfo[],
  preferredFacing: CameraFacingMode,
  preferredDeviceId?: string
): CameraDeviceInfo | null {
  if (cameras.length === 0) return null;

  if (preferredDeviceId) {
    const exact = cameras.find(c => c.deviceId === preferredDeviceId);
    if (exact) return exact;
  }

  const facingCameras = getCamerasByFacing(cameras, preferredFacing);

  if (facingCameras.length > 0) {
    const ultraWide = facingCameras.find(c => c.isUltraWide);
    if (ultraWide) return ultraWide;
    return facingCameras[0];
  }

  return cameras[0];
}

export function inferFacingMode(label: string, deviceId: string): CameraFacingMode {
  const lower = label.toLowerCase();
  if (lower.includes('front') || lower.includes('face') || lower.includes('user') || lower.includes('selfie')) {
    return 'user';
  }
  if (lower.includes('back') || lower.includes('rear') || lower.includes('environment') || lower.includes('world')) {
    return 'environment';
  }
  if (lower.includes('wide') || lower.includes('ultra')) {
    const isFront = lower.includes('front');
    return isFront ? 'user' : 'environment';
  }

  return 'environment';
}

export function isUltraWideCamera(label: string, capabilities?: MediaTrackCapabilities): boolean {
  const lower = label.toLowerCase();
  if (lower.includes('ultra') || lower.includes('wide') || lower.includes('0.5')) {
    return true;
  }
  if (capabilities) {
    const { width } = capabilities;
    if (width && typeof width === 'object' && 'min' in width && 'max' in width) {
      if ((width as any).max <= 1280) {
        return true;
      }
    }
  }
  return false;
}

export function clearDeviceCache() {
  cachedDevices = null;
}
