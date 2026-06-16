export type CameraStatus = 'idle' | 'checking-permission' | 'permission-prompt' | 'starting' | 'active' | 'error' | 'stopped';

export type CameraFacingMode = 'user' | 'environment' | 'unknown';

export type CameraErrorType =
  | 'PermissionDenied'
  | 'PermissionBlocked'
  | 'CameraUnavailable'
  | 'CameraInUse'
  | 'NotSupported'
  | 'NotAllowedError'
  | 'NotFoundError'
  | 'NotReadableError'
  | 'OverconstrainedError'
  | 'AbortError'
  | 'SecurityError'
  | 'TypeError'
  | 'Unknown';

export interface CameraErrorInfo {
  type: CameraErrorType;
  message: string;
  originalError?: unknown;
  actionable: boolean;
  suggestion: string;
  retryable: boolean;
}

export interface CameraDeviceInfo {
  deviceId: string;
  groupId: string;
  label: string;
  kind: MediaDeviceKind;
  facingMode: CameraFacingMode;
  capabilities?: MediaTrackCapabilities;
  isUltraWide?: boolean;
}

export interface CameraResolution {
  width: number;
  height: number;
}

export interface CameraDiagnostics {
  status: CameraStatus;
  error: CameraErrorInfo | null;
  currentDevice: CameraDeviceInfo | null;
  facingMode: CameraFacingMode;
  resolution: CameraResolution | null;
  fps: number | null;
  devicesAvailable: number;
  streamActive: boolean;
  permissionState: PermissionState | 'unsupported' | 'unknown';
}

export interface CameraConfig {
  preferredFacingMode: CameraFacingMode;
  preferredDeviceId?: string;
  resolution?: { width: number; height: number };
  preferLowLatency?: boolean;
}

export interface PlatformInfo {
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isTablet: boolean;
  isChrome: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  isSamsung: boolean;
  isEdge: boolean;
  osVersion: string;
  browserVersion: string;
  userAgent: string;
}

export type CameraEventCallback = (diagnostics: CameraDiagnostics) => void;
