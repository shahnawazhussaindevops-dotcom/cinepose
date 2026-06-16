import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPlatformInfo,
  isSecureContext,
  supportsMediaDevices,
  supportsEnumerateDevices,
  getOrientation,
  classifyCameraError,
  getDisplayAspectRatio,
} from './mediaUtils';

describe('getPlatformInfo', () => {
  it('detects Android platform from user agent', () => {
    const info = getPlatformInfo();
    expect(info.isAndroid).toBe(true);
    expect(info.isMobile).toBe(true);
    expect(info.isIOS).toBe(false);
  });

  it('extracts Android OS version', () => {
    const info = getPlatformInfo();
    expect(info.osVersion).toBe('14');
  });

  it('detects Chrome browser', () => {
    const info = getPlatformInfo();
    expect(info.isChrome).toBe(true);
  });
});

describe('isSecureContext', () => {
  it('returns true for HTTPS', () => {
    expect(isSecureContext()).toBe(true);
  });
});

describe('supportsMediaDevices', () => {
  it('returns true when mediaDevices exists', () => {
    expect(supportsMediaDevices()).toBe(true);
  });
});

describe('supportsEnumerateDevices', () => {
  it('returns true when enumerateDevices exists', () => {
    expect(supportsEnumerateDevices()).toBe(true);
  });
});

describe('getOrientation', () => {
  it('returns portrait when height > width', () => {
    const orientation = getOrientation();
    expect(['portrait', 'landscape']).toContain(orientation);
  });
});

describe('getDisplayAspectRatio', () => {
  it('returns a positive number', () => {
    const ratio = getDisplayAspectRatio();
    expect(ratio).toBeGreaterThan(0);
  });
});

describe('classifyCameraError', () => {
  it('classifies NotAllowedError as PermissionDenied', () => {
    const err = { name: 'NotAllowedError', message: 'Permission denied' };
    const info = classifyCameraError(err);
    expect(info.type).toBe('PermissionDenied');
    expect(info.retryable).toBe(false);
  });

  it('classifies NotFoundError as CameraUnavailable', () => {
    const err = { name: 'NotFoundError', message: 'Camera not found' };
    const info = classifyCameraError(err);
    expect(info.type).toBe('CameraUnavailable');
    expect(info.retryable).toBe(true);
  });

  it('classifies NotReadableError as CameraInUse', () => {
    const err = { name: 'NotReadableError', message: 'Camera in use' };
    const info = classifyCameraError(err);
    expect(info.type).toBe('CameraInUse');
    expect(info.retryable).toBe(true);
  });

  it('classifies SecurityError in secure context as NotSupported', () => {
    const err = { name: 'SecurityError', message: 'API not supported' };
    const info = classifyCameraError(err);
    expect(info.type).toBe('NotSupported');
  });

  it('classifies NotSupportedError as NotSupported', () => {
    const err = { name: 'NotSupportedError', message: 'Not supported' };
    const info = classifyCameraError(err);
    expect(info.type).toBe('NotSupported');
  });

  it('classifies OverconstrainedError', () => {
    const err = { name: 'OverconstrainedError', message: 'Cannot satisfy constraints', constraint: 'facingMode' };
    const info = classifyCameraError(err);
    expect(info.type).toBe('OverconstrainedError');
  });

  it('classifies AbortError', () => {
    const err = { name: 'AbortError', message: 'Request aborted' };
    const info = classifyCameraError(err);
    expect(info.type).toBe('AbortError');
  });

  it('classifies unknown errors', () => {
    const err = { name: 'SomeRandomError', message: 'Something went wrong' };
    const info = classifyCameraError(err);
    expect(info.type).toBe('Unknown');
    expect(info.retryable).toBe(true);
  });
});
