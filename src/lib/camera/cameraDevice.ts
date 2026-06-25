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
  } catch (err) {
    log.warn('Initial enumeration failed:', err);
  }

  // On mobile, often need to request permission first before devices are visible
  log.warn('enumerateDevices returned no cameras, attempting simple getUserMedia to trigger permission...');
  
  // Try with most permissive constraints first
  const { stream, error } = await requestCameraAccess({ video: true, audio: false });
  if (stream) {
    log.info('Got stream, stopping it and re-enumerating devices...');
    stream.getTracks().forEach(t => t.stop());
    
    // Small delay to let browser update device list
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      const devicesAfter = await enumerateCameras(true);
      if (devicesAfter.length > 0) {
        return devicesAfter;
      }
    } catch (err) {
      log.warn('Re-enumeration failed:', err);
    }
    
    // If still no devices but we got a stream, create a synthetic device
    log.warn('Creating synthetic device info from stream');
    return [{
      deviceId: 'default',
      groupId: '',
      label: 'Camera',
      kind: 'videoinput',
      facingMode: 'environment',
    }];
  } else {
    log.error('Failed to get camera stream:', error?.message);
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
