import { useState, useCallback } from 'react';
import type { CameraErrorInfo } from '../lib/camera/types';
import { classifyCameraError } from '../lib/camera/mediaUtils';

interface ErrorHandlerState {
  currentError: CameraErrorInfo | null;
  errorHistory: CameraErrorInfo[];
  permissionBlocked: boolean;
  cameraUnavailable: boolean;
  browserSupported: boolean;
}

export function useCameraErrorHandler() {
  const [state, setState] = useState<ErrorHandlerState>({
    currentError: null,
    errorHistory: [],
    permissionBlocked: false,
    cameraUnavailable: false,
    browserSupported: true,
  });

  const handleError = useCallback((err: unknown) => {
    const errorInfo = classifyCameraError(err);
    setState(prev => ({
      ...prev,
      currentError: errorInfo,
      errorHistory: [...prev.errorHistory, errorInfo],
      permissionBlocked: errorInfo.type === 'PermissionDenied' || errorInfo.type === 'PermissionBlocked',
      cameraUnavailable: errorInfo.type === 'CameraUnavailable',
      browserSupported: errorInfo.type !== 'NotSupported',
    }));
    return errorInfo;
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, currentError: null }));
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, currentError: null, errorHistory: [] }));
  }, []);

  const canRetry = state.currentError?.retryable !== false;

  return {
    ...state,
    handleError,
    clearError,
    clearHistory,
    canRetry,
  };
}
