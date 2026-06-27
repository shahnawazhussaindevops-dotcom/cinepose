import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CameraManager } from './CameraManager';

// Access the mock helpers
declare global {
  var __setPermissionState: (state: PermissionState) => void;
  var __setShouldSucceed: (success: boolean) => void;
  var __setError: (name: string, message: string) => void;
  var __clearError: () => void;
}

function createMockVideoElement(): HTMLVideoElement {
  const video = document.createElement('video');
  video.play = vi.fn().mockResolvedValue(undefined);
  video.pause = vi.fn();
  video.load = vi.fn();
  Object.defineProperties(video, {
    videoWidth: { value: 1280, writable: true },
    videoHeight: { value: 720, writable: true },
    readyState: { value: 4, writable: true },
  });
  return video;
}

describe('CameraManager', () => {
  let manager: CameraManager;

  beforeEach(() => {
    globalThis.__clearError();
    globalThis.__setShouldSucceed(true);
    globalThis.__setPermissionState('granted');
    manager = new CameraManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('initial state', () => {
    it('starts in idle state', () => {
      expect(manager.diagnostics.status).toBe('idle');
      expect(manager.diagnostics.streamActive).toBe(false);
    });
  });

  describe('startCamera', () => {
    it('starts camera successfully with default config', async () => {
      const success = await manager.startCamera();
      expect(success).toBe(true);
      expect(manager.diagnostics.status).toBe('active');
      expect(manager.diagnostics.streamActive).toBe(true);
    });

    it('starts camera with front facing mode', async () => {
      const success = await manager.startCamera({ preferredFacingMode: 'user' });
      expect(success).toBe(true);
      expect(manager.diagnostics.status).toBe('active');
    });

    it('starts camera with environment facing mode', async () => {
      const success = await manager.startCamera({ preferredFacingMode: 'environment' });
      expect(success).toBe(true);
    });

    it('handles camera failure gracefully', async () => {
      globalThis.__setShouldSucceed(false);
      const success = await manager.startCamera();
      expect(success).toBe(false);
      expect(manager.diagnostics.status).toBe('error');
      expect(manager.diagnostics.error).not.toBeNull();
    });

    it('reports denied permission state', async () => {
      globalThis.__setPermissionState('denied');
      const success = await manager.startCamera();
      expect(success).toBe(false);
      expect(manager.diagnostics.permissionState).toBe('denied');
    });
  });

  describe('stopCamera', () => {
    it('stops active camera', async () => {
      await manager.startCamera();
      expect(manager.diagnostics.status).toBe('active');
      manager.stopCamera();
      expect(manager.diagnostics.status).toBe('stopped');
      expect(manager.diagnostics.streamActive).toBe(false);
    });
  });

  describe('switchCamera', () => {
    it('switches from environment to user', async () => {
      await manager.startCamera({ preferredFacingMode: 'environment' });
      const result = await manager.switchCamera('user');
      expect(result).toBe(true);
    });

    it('switches from user to environment', async () => {
      await manager.startCamera({ preferredFacingMode: 'user' });
      const result = await manager.switchCamera('environment');
      expect(result).toBe(true);
    });
  });

  describe('reconnectCamera', () => {
    it('reconnects successfully', async () => {
      await manager.startCamera({ preferredFacingMode: 'user' });
      manager.stopCamera();
      const result = await manager.reconnectCamera();
      expect(result).toBe(true);
    });
  });

  describe('attachVideoElement', () => {
    it('attaches video element after camera start', async () => {
      const video = createMockVideoElement();
      await manager.startCamera();
      manager.attachVideoElement(video);
      expect(video.srcObject).not.toBeNull();
    });
  });

  describe('getStream', () => {
    it('returns null when camera not started', () => {
      expect(manager.getStream()).toBeNull();
    });

    it('returns stream when camera is active', async () => {
      await manager.startCamera();
      expect(manager.getStream()).not.toBeNull();
    });
  });

  describe('diagnostics callback', () => {
    it('fires callback on state changes', async () => {
      const callback = vi.fn();
      manager.setDiagnosticsCallback(callback);
      await manager.startCamera();
      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[callback.mock.calls.length - 1][0].status).toBe('active');
    });
  });
});
