export interface CameraDiagnostics {
  status: 'idle' | 'starting' | 'active' | 'error';
  errorName: string | null;
  errorMessage: string | null;
  currentDeviceLabel: string | null;
  facingMode: 'user' | 'environment' | 'unknown';
  resolution: { width: number; height: number } | null;
  fps: number | null;
}

export type CameraEventCallback = (diagnostics: CameraDiagnostics) => void;

export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private onDiagnosticsChange: CameraEventCallback | null = null;
  private isPausedByBackground = false;

  public diagnostics: CameraDiagnostics = {
    status: 'idle',
    errorName: null,
    errorMessage: null,
    currentDeviceLabel: null,
    facingMode: 'unknown',
    resolution: null,
    fps: null,
  };

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  public destroy() {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
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
      this.videoElement.srcObject = this.stream;
    }
  }

  public async getDevices(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      return await navigator.mediaDevices.enumerateDevices();
    } catch (e) {
      console.warn('Failed to enumerate devices:', e);
      return [];
    }
  }

  public stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.updateDiagnostics({
      status: 'idle',
      currentDeviceLabel: null,
      facingMode: 'unknown',
      resolution: null,
      fps: null,
    });
  }

  public async startCamera(preferredFacingMode: 'user' | 'environment'): Promise<boolean> {
    this.stopCamera();
    this.updateDiagnostics({ status: 'starting', errorName: null, errorMessage: null });

    // 1. HTTPS / Secure Context Check
    if (typeof window !== 'undefined') {
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        this.updateDiagnostics({
          status: 'error',
          errorName: 'SecurityError',
          errorMessage: 'Camera access requires HTTPS.',
        });
        return false;
      }
    }

    // 2. MediaDevices API Check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.updateDiagnostics({
        status: 'error',
        errorName: 'NotSupportedError',
        errorMessage: 'Camera API not supported on this browser.',
      });
      return false;
    }

    const fallbackSequence = [
      { video: { facingMode: { ideal: preferredFacingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
      { video: { facingMode: { ideal: preferredFacingMode === 'user' ? 'environment' : 'user' } }, audio: false },
      { video: true, audio: false }
    ];

    for (const constraints of fallbackSequence) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints as any);
        this.stream = stream;
        
        if (this.videoElement) {
          this.videoElement.srcObject = stream;
          try {
            await this.videoElement.play();
          } catch (playErr) {
            console.warn('Video play() interrupted:', playErr);
          }
        }

        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();

        this.updateDiagnostics({
          status: 'active',
          currentDeviceLabel: videoTrack.label || 'Unknown Camera',
          facingMode: (settings.facingMode as any) || preferredFacingMode,
          resolution: settings.width && settings.height ? { width: settings.width, height: settings.height } : null,
          fps: settings.frameRate || null,
        });

        return true;
      } catch (err: any) {
        console.warn('Camera fallback attempt failed:', err.name, err.message);
        // Continue to next fallback
      }
    }

    // If all fallbacks fail, throw the last error gracefully
    this.updateDiagnostics({
      status: 'error',
      errorName: 'NotFoundError',
      errorMessage: 'Could not start any camera on this device. Please check permissions.',
    });
    return false;
  }

  public async switchCamera(): Promise<boolean> {
    const nextMode = this.diagnostics.facingMode === 'environment' ? 'user' : 'environment';
    return await this.startCamera(nextMode);
  }

  private handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      if (this.diagnostics.status === 'active' && this.stream) {
        this.stream.getVideoTracks().forEach(track => { track.enabled = false; });
        this.isPausedByBackground = true;
      }
    } else if (document.visibilityState === 'visible') {
      if (this.isPausedByBackground && this.stream) {
        this.stream.getVideoTracks().forEach(track => { track.enabled = true; });
        if (this.videoElement) {
          this.videoElement.play().catch(e => console.warn('Resume play failed', e));
        }
        this.isPausedByBackground = false;
      }
    }
  }

  public getStream() {
    return this.stream;
  }
}

// Singleton instance
export const cameraManager = new CameraManager();
