import type { CameraDiagnostics, CameraErrorInfo, CameraConfig, CameraFacingMode, CameraDeviceInfo, CameraStatus } from './types';
import type { CameraEventCallback } from './types';
import { log, isSecureContext, getPlatformInfo } from './mediaUtils';
import { checkCameraPermission } from './permissions';
import {
  createCameraStreamWithDeviceDiscovery,
  stopMediaStream,
  attachStreamToVideo,
  detachStreamFromVideo,
  getTrackInfo,
} from './streamManager';
import { enumerateCamerasWithFallback } from './cameraDevice';

const PREFERRED_CAMERA_KEY = 'cinepose_preferred_camera';
const MAX_RECONNECT_ATTEMPTS = 3;

export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private onDiagnosticsChange: CameraEventCallback | null = null;
  private isPausedByBackground = false;
  private currentConfig: CameraConfig | null = null;
  private currentDevice: CameraDeviceInfo | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = MAX_RECONNECT_ATTEMPTS;
  private userInitiated = false;

  public diagnostics: CameraDiagnostics = {
    status: 'idle',
    error: null,
    currentDevice: null,
    facingMode: 'unknown',
    resolution: null,
    fps: null,
    devicesAvailable: 0,
    streamActive: false,
    permissionState: 'unknown',
  };

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handlePageHide = this.handlePageHide.bind(this);
    this.handleOrientationChange = this.handleOrientationChange.bind(this);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', this.handlePageHide);
      window.addEventListener('orientationchange', this.handleOrientationChange);
      window.addEventListener('resize', this.handleOrientationChange);
    }
  }

  public destroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('pagehide', this.handlePageHide);
      window.removeEventListener('orientationchange', this.handleOrientationChange);
      window.removeEventListener('resize', this.handleOrientationChange);
    }
    this.stopCamera();
  }

  public setDiagnosticsCallback(callback: CameraEventCallback) {
    this.onDiagnosticsChange = callback;
    this.emitDiagnostics();
  }

  private updateDiagnostics(updates: Partial<CameraDiagnostics>) {
    this.diagnostics = { ...this.diagnostics, ...updates };
    this.emitDiagnostics();
  }

  private emitDiagnostics() {
    if (this.onDiagnosticsChange) {
      this.onDiagnosticsChange(this.diagnostics);
    }
  }

  public attachVideoElement(video: HTMLVideoElement) {
    this.videoElement = video;
    if (this.stream && this.videoElement.srcObject !== this.stream) {
      attachStreamToVideo(this.videoElement, this.stream);
    }
  }

  public async checkPermissionState() {
    this.updateDiagnostics({ status: 'checking-permission' });
    const result = await checkCameraPermission();
    this.updateDiagnostics({ permissionState: result.state });
    return result;
  }

  public async getDevices(): Promise<CameraDeviceInfo[]> {
    return await enumerateCamerasWithFallback();
  }

  public stopCamera() {
    if (this.stream) {
      stopMediaStream(this.stream);
      this.stream = null;
    }
    if (this.videoElement) {
      detachStreamFromVideo(this.videoElement);
    }
    this.currentConfig = null;
    this.currentDevice = null;
    this.isPausedByBackground = false;
    this.reconnectAttempts = 0;
    this.updateDiagnostics({
      status: 'stopped',
      currentDevice: null,
      facingMode: 'unknown',
      resolution: null,
      fps: null,
      streamActive: false,
      error: null,
    });
  }

  public async startCamera(config?: CameraConfig): Promise<boolean> {
    this.userInitiated = true;

    if (!isSecureContext()) {
      this.updateDiagnostics({
        status: 'error',
        error: {
          type: 'SecurityError',
          message: 'Camera access requires a secure connection (HTTPS).',
          originalError: null,
          actionable: true,
          suggestion: 'Access this site via HTTPS.',
          retryable: false,
        },
      });
      return false;
    }

    const finalConfig: CameraConfig = config || {
      preferredFacingMode: this.loadPreferredCamera() || 'environment',
    };
    this.currentConfig = finalConfig;

    this.stopCamera();
    this.updateDiagnostics({
      status: 'starting',
      error: null,
      permissionState: this.diagnostics.permissionState,
    });

    const permCheck = await checkCameraPermission();
    this.updateDiagnostics({ permissionState: permCheck.state });

    const result = await createCameraStreamWithDeviceDiscovery(finalConfig);

    if (result.stream && result.device) {
      this.stream = result.stream;
      this.currentDevice = result.device;

      if (this.videoElement) {
        attachStreamToVideo(this.videoElement, result.stream);
        this.playVideo(this.videoElement);
      }

      const track = result.stream.getVideoTracks()[0];
      const trackInfo = getTrackInfo(track);

      this.savePreferredCamera(trackInfo.facingMode);

      const devices = await enumerateCamerasWithFallback();

      this.updateDiagnostics({
        status: 'active',
        currentDevice: result.device,
        facingMode: trackInfo.facingMode,
        resolution: trackInfo.resolution,
        fps: trackInfo.frameRate,
        streamActive: true,
        devicesAvailable: devices.length,
        error: null,
      });

      log.info('Camera started successfully', {
        facingMode: trackInfo.facingMode,
        resolution: trackInfo.resolution,
        device: result.device.label,
      });

      return true;
    }

    if (result.error) {
      this.updateDiagnostics({
        status: 'error',
        error: result.error,
      });
      return false;
    }

    this.updateDiagnostics({
      status: 'error',
      error: {
        type: 'Unknown',
        message: 'Failed to start camera for an unknown reason.',
        originalError: null,
        actionable: true,
        suggestion: 'Please try again.',
        retryable: true,
      },
    });
    return false;
  }

  public async switchCamera(facingMode?: CameraFacingMode): Promise<boolean> {
    const nextMode = facingMode ||
      (this.diagnostics.facingMode === 'environment' ? 'user' : 'environment');

    log.info(`Switching camera to: ${nextMode}`);
    return await this.startCamera({
      preferredFacingMode: nextMode,
    });
  }

  public async reconnectCamera(): Promise<boolean> {
    if (!this.currentConfig) {
      return this.startCamera();
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      log.warn('Max reconnection attempts reached');
      this.reconnectAttempts = 0;
      this.updateDiagnostics({
        status: 'error',
        error: {
          type: 'CameraUnavailable',
          message: 'Could not reconnect camera after multiple attempts.',
          originalError: null,
          actionable: true,
          suggestion: 'Please try restarting the camera manually.',
          retryable: true,
        },
      });
      return false;
    }

    this.reconnectAttempts++;
    log.info(`Reconnecting camera (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    this.updateDiagnostics({ status: 'starting', error: null });

    const delay = 300 * Math.pow(2, this.reconnectAttempts - 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    const success = await this.startCamera(this.currentConfig);
    if (success) {
      this.reconnectAttempts = 0;
    }
    return success;
  }

  public getStream() {
    return this.stream;
  }

  public getCurrentDevice() {
    return this.currentDevice;
  }

  public isActive(): boolean {
    return this.diagnostics.status === 'active';
  }

  private playVideo(video: HTMLVideoElement) {
    const attemptPlay = () => {
      video.play().catch((err) => {
        log.warn('Video play() failed, will retry on next interaction:', err);
        const resumeOnInteraction = () => {
          video.play().catch(e => log.warn('Retry play() failed:', e));
          document.removeEventListener('touchstart', resumeOnInteraction);
          document.removeEventListener('click', resumeOnInteraction);
        };
        document.addEventListener('touchstart', resumeOnInteraction, { once: true });
        document.addEventListener('click', resumeOnInteraction, { once: true });
      });
    };

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.addEventListener('loadedmetadata', attemptPlay, { once: true });
    }
  }

  private async reconnectFromBackground() {
    if (!this.currentConfig) {
      this.isPausedByBackground = false;
      return;
    }

    log.info('Reconnecting camera after background (preserving video element)');
    const result = await createCameraStreamWithDeviceDiscovery(this.currentConfig);

    if (result.stream && result.device) {
      this.stream = result.stream;
      this.currentDevice = result.device;

      if (this.videoElement) {
        this.videoElement.srcObject = result.stream;
        this.playVideo(this.videoElement);
      }

      const track = result.stream.getVideoTracks()[0];
      const trackInfo = getTrackInfo(track);
      this.savePreferredCamera(trackInfo.facingMode);

      const devices = await enumerateCamerasWithFallback();
      this.updateDiagnostics({
        status: 'active',
        currentDevice: result.device,
        facingMode: trackInfo.facingMode,
        resolution: trackInfo.resolution,
        fps: trackInfo.frameRate,
        streamActive: true,
        devicesAvailable: devices.length,
        error: null,
      });

      log.info('Camera reconnected successfully after background');
    } else {
      const errMsg = result.error?.message || 'Reconnection failed';
      log.warn('Camera reconnection failed:', errMsg);
      this.updateDiagnostics({
        status: 'error',
        error: result.error || {
          type: 'Unknown',
          message: errMsg,
          originalError: null,
          actionable: true,
          suggestion: 'Please tap Try Again to restart the camera.',
          retryable: true,
        },
      });
    }
  }

  private handleVisibilityChange() {
    if (typeof document === 'undefined') return;

    if (document.visibilityState === 'hidden') {
      if (this.diagnostics.status === 'active' && this.stream) {
        log.info('App went to background, stopping camera tracks');
        stopMediaStream(this.stream);
        this.stream = null;
        this.isPausedByBackground = true;
        this.updateDiagnostics({
          status: 'stopped',
          streamActive: false,
        });
      }
    } else if (document.visibilityState === 'visible') {
      if (this.isPausedByBackground) {
        this.isPausedByBackground = false;
        log.info('App returned to foreground, reconnecting camera');
        this.reconnectFromBackground();
      }
    }
  }

  private handlePageHide() {
    if (this.stream) {
      log.info('Page hiding, stopping camera tracks');
      stopMediaStream(this.stream);
      this.stream = null;
      this.updateDiagnostics({ status: 'stopped', streamActive: false });
    }
  }

  private handleOrientationChange() {
    if (this.videoElement && this.stream) {
      const platform = getPlatformInfo();
      if (platform.isMobile) {
        setTimeout(() => {
          if (this.videoElement) this.playVideo(this.videoElement);
        }, 300);
      }
    }
  }

  private loadPreferredCamera(): CameraFacingMode | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const saved = localStorage.getItem(PREFERRED_CAMERA_KEY);
      if (saved === 'user' || saved === 'environment') return saved;
    } catch {
      // localStorage unavailable
    }
    return null;
  }

  private savePreferredCamera(facingMode: CameraFacingMode) {
    if (typeof localStorage === 'undefined') return;
    if (facingMode === 'unknown') return;
    try {
      localStorage.setItem(PREFERRED_CAMERA_KEY, facingMode);
    } catch {
      // localStorage unavailable
    }
  }
}

export const cameraManager = new CameraManager();
