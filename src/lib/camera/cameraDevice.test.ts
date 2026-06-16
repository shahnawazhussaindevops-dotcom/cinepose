import { describe, it, expect, beforeEach } from 'vitest';
import {
  enumerateCameras,
  getCamerasByFacing,
  selectBestCamera,
  inferFacingMode,
  isUltraWideCamera,
  clearDeviceCache,
} from './cameraDevice';
import type { CameraDeviceInfo } from './types';

describe('inferFacingMode', () => {
  it('identifies front camera', () => {
    expect(inferFacingMode('Front Camera', 'id1')).toBe('user');
    expect(inferFacingMode('Selfie Camera', 'id2')).toBe('user');
    expect(inferFacingMode('FaceTime HD', 'id3')).toBe('user');
  });

  it('identifies back camera', () => {
    expect(inferFacingMode('Back Camera', 'id1')).toBe('environment');
    expect(inferFacingMode('Rear Camera', 'id2')).toBe('environment');
    expect(inferFacingMode('World Camera', 'id3')).toBe('environment');
  });

  it('defaults to environment for unknown cameras', () => {
    expect(inferFacingMode('Generic USB Camera', 'id1')).toBe('environment');
  });
});

describe('isUltraWideCamera', () => {
  it('identifies ultra-wide by label', () => {
    expect(isUltraWideCamera('Ultra-Wide Camera', undefined)).toBe(true);
    expect(isUltraWideCamera('0.5x Camera', undefined)).toBe(true);
    expect(isUltraWideCamera('Standard Camera', undefined)).toBe(false);
  });
});

describe('getCamerasByFacing', () => {
  const mockCameras: CameraDeviceInfo[] = [
    { deviceId: '1', groupId: 'g1', label: 'Front', kind: 'videoinput', facingMode: 'user' },
    { deviceId: '2', groupId: 'g1', label: 'Back', kind: 'videoinput', facingMode: 'environment' },
  ];

  it('filters front cameras', () => {
    const fronts = getCamerasByFacing(mockCameras, 'user');
    expect(fronts).toHaveLength(1);
    expect(fronts[0].deviceId).toBe('1');
  });

  it('filters back cameras', () => {
    const backs = getCamerasByFacing(mockCameras, 'environment');
    expect(backs).toHaveLength(1);
    expect(backs[0].deviceId).toBe('2');
  });

  it('returns all for unknown facing', () => {
    const all = getCamerasByFacing(mockCameras, 'unknown');
    expect(all).toHaveLength(2);
  });
});

describe('selectBestCamera', () => {
  const mockCameras: CameraDeviceInfo[] = [
    { deviceId: 'front', groupId: 'g1', label: 'Front', kind: 'videoinput', facingMode: 'user' },
    { deviceId: 'back', groupId: 'g1', label: 'Back', kind: 'videoinput', facingMode: 'environment' },
    { deviceId: 'ultra', groupId: 'g1', label: 'Ultra-Wide Back', kind: 'videoinput', facingMode: 'environment', isUltraWide: true },
  ];

  it('selects specific device by ID', () => {
    const selected = selectBestCamera(mockCameras, 'user', 'front');
    expect(selected?.deviceId).toBe('front');
  });

  it('prefers ultra-wide for environment', () => {
    const selected = selectBestCamera(mockCameras, 'environment');
    expect(selected?.deviceId).toBe('ultra');
  });

  it('selects first front camera for user facing', () => {
    const selected = selectBestCamera(mockCameras, 'user');
    expect(selected?.deviceId).toBe('front');
  });

  it('returns null for empty list', () => {
    const selected = selectBestCamera([], 'user');
    expect(selected).toBeNull();
  });
});

describe('enumerateCameras', () => {
  beforeEach(() => {
    clearDeviceCache();
  });

  it('returns video devices from enumerateDevices', async () => {
    const devices = await enumerateCameras(true);
    expect(devices.length).toBeGreaterThan(0);
    expect(devices.every(d => d.kind === 'videoinput')).toBe(true);
  });

  it('caches results', async () => {
    const first = await enumerateCameras();
    const second = await enumerateCameras();
    expect(first).toEqual(second);
  });
});
