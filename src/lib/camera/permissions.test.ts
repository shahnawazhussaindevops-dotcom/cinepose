import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkCameraPermission,
  requestCameraAccess,
  getCameraPermissionGuidance,
} from './permissions';
import type { CameraErrorInfo } from './types';

// Access the mock helpers from the setup
declare global {
  var __setPermissionState: (state: PermissionState) => void;
  var __setShouldSucceed: (success: boolean) => void;
  var __setError: (name: string, message: string) => void;
  var __clearError: () => void;
}

describe('checkCameraPermission', () => {
  beforeEach(() => {
    globalThis.__clearError();
    globalThis.__setShouldSucceed(true);
  });

  it('returns granted when permission is granted', async () => {
    globalThis.__setPermissionState('granted');
    const result = await checkCameraPermission();
    expect(result.state).toBe('granted');
    expect(result.error).toBeNull();
  });

  it('returns prompt when permission is prompt', async () => {
    globalThis.__setPermissionState('prompt');
    const result = await checkCameraPermission();
    expect(result.state).toBe('prompt');
    expect(result.error).toBeNull();
  });

  it('returns denied with error when permission is denied', async () => {
    globalThis.__setPermissionState('denied');
    const result = await checkCameraPermission();
    expect(result.state).toBe('denied');
    expect(result.error).not.toBeNull();
    expect(result.error?.type).toBe('PermissionDenied');
  });

  it('handles permissions API not available', async () => {
    const originalQuery = navigator.permissions?.query;
    (navigator as any).permissions = undefined;
    const result = await checkCameraPermission();
    expect(result.state).toBe('unknown');
    expect(result.error).toBeNull();
    (navigator as any).permissions = { query: originalQuery };
  });
});

describe('requestCameraAccess', () => {
  beforeEach(() => {
    globalThis.__clearError();
    globalThis.__setShouldSucceed(true);
  });

  it('returns stream on successful access', async () => {
    const result = await requestCameraAccess();
    expect(result.stream).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it('returns error on permission denied', async () => {
    globalThis.__setShouldSucceed(false);
    const result = await requestCameraAccess();
    expect(result.stream).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error?.type).toBe('PermissionDenied');
  });

  it('returns specific error for NotReadableError', async () => {
    globalThis.__setError('NotReadableError', 'Camera is in use');
    const result = await requestCameraAccess();
    expect(result.stream).toBeNull();
    expect(result.error?.type).toBe('CameraInUse');
  });

  it('returns specific error for NotFoundError', async () => {
    globalThis.__setError('NotFoundError', 'No camera found');
    const result = await requestCameraAccess();
    expect(result.stream).toBeNull();
    expect(result.error?.type).toBe('CameraUnavailable');
  });
});

describe('getCameraPermissionGuidance', () => {
  const baseError: CameraErrorInfo = {
    type: 'PermissionDenied',
    message: 'Camera access denied',
    originalError: null,
    actionable: true,
    suggestion: 'Enable camera access',
    retryable: false,
  };

  it('returns iOS guidance for PermissionDenied', () => {
    const guidance = getCameraPermissionGuidance(baseError);
    expect(guidance.title).toContain('Enable Camera');
    expect(guidance.steps.length).toBeGreaterThan(0);
  });

  it('returns security guidance for SecurityError', async () => {
    const secError: CameraErrorInfo = {
      type: 'SecurityError',
      message: 'HTTPS required',
      originalError: null,
      actionable: true,
      suggestion: 'Use HTTPS',
      retryable: false,
    };
    const guidance = getCameraPermissionGuidance(secError);
    expect(guidance.title).toContain('Secure Connection');
  });

  it('returns browser guidance for NotSupported', () => {
    const nsError: CameraErrorInfo = {
      type: 'NotSupported',
      message: 'API not supported',
      originalError: null,
      actionable: false,
      suggestion: 'Update browser',
      retryable: false,
    };
    const guidance = getCameraPermissionGuidance(nsError);
    expect(guidance.title).toContain('Update Your Browser');
  });
});
