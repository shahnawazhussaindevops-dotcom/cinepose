import React, { useEffect, useState } from 'react';
import { cameraManager, type CameraDiagnostics } from '../../lib/camera/CameraManager';
import { getPlatformInfo, setDebugMode, isDebugMode } from '../../lib/camera/mediaUtils';

export function CameraDebugPanel() {
  const [diagnostics, setDiagnostics] = useState<CameraDiagnostics>(cameraManager.diagnostics);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onDiagnostics = (d: CameraDiagnostics) => setDiagnostics({ ...d });
    cameraManager.setDiagnosticsCallback(onDiagnostics);
    return () => {
      cameraManager.removeDiagnosticsCallback(onDiagnostics);
    };
  }, []);

  if (!visible) {
    return (
      <button 
        onClick={() => setVisible(true)}
        className="fixed top-24 right-4 z-50 bg-black/50 text-white/50 text-[10px] px-2 py-1 rounded backdrop-blur border border-white/10 font-mono hover:bg-black/70 transition-colors"
      >
        DEV
      </button>
    );
  }

  const platform = getPlatformInfo();
  const debugMode = isDebugMode();

  return (
    <div className="fixed top-24 right-4 z-50 bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-xl w-72 font-mono text-[10px] text-[#22D3EE] shadow-[0_0_20px_rgba(0,0,0,0.5)] max-h-[70vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1">
        <strong className="text-white">CAMERA DIAGNOSTICS</strong>
        <button onClick={() => setVisible(false)} className="text-white/50 hover:text-white">✕</button>
      </div>
      <div className="flex flex-col gap-1 opacity-90">
        {/* Status */}
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={
            diagnostics.status === 'error' ? 'text-red-400' :
            diagnostics.status === 'active' ? 'text-green-400' :
            diagnostics.status === 'starting' ? 'text-yellow-400' :
            'text-gray-400'
          }>
            {diagnostics.status}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Stream:</span>
          <span className={diagnostics.streamActive ? 'text-green-400' : 'text-gray-400'}>
            {diagnostics.streamActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Facing:</span>
          <span className="text-white">{diagnostics.facingMode}</span>
        </div>

        <div className="flex justify-between">
          <span>Resolution:</span>
          <span className="text-white">
            {diagnostics.resolution ? `${diagnostics.resolution.width}x${diagnostics.resolution.height}` : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>FPS:</span>
          <span className="text-white">{diagnostics.fps || 'N/A'}</span>
        </div>

        <div className="flex justify-between">
          <span>Devices:</span>
          <span className="text-white">{diagnostics.devicesAvailable}</span>
        </div>

        <div className="flex justify-between">
          <span>Permission:</span>
          <span className={
            diagnostics.permissionState === 'granted' ? 'text-green-400' :
            diagnostics.permissionState === 'denied' ? 'text-red-400' :
            diagnostics.permissionState === 'prompt' ? 'text-yellow-400' :
            'text-gray-400'
          }>
            {diagnostics.permissionState}
          </span>
        </div>

        {/* Platform */}
        <div className="mt-2 pt-2 border-t border-white/10">
          <span className="text-white/50 block mb-1">Platform:</span>
          <div className="flex flex-wrap gap-1">
            {platform.isMobile && <span className="px-1 bg-blue-500/20 text-blue-300 rounded">Mobile</span>}
            {platform.isAndroid && <span className="px-1 bg-green-500/20 text-green-300 rounded">Android</span>}
            {platform.isIOS && <span className="px-1 bg-gray-500/20 text-gray-300 rounded">iOS</span>}
            {platform.isChrome && <span className="px-1 bg-yellow-500/20 text-yellow-300 rounded">Chrome</span>}
            {platform.isSafari && <span className="px-1 bg-blue-500/20 text-blue-300 rounded">Safari</span>}
            {platform.isFirefox && <span className="px-1 bg-orange-500/20 text-orange-300 rounded">Firefox</span>}
            {platform.isSamsung && <span className="px-1 bg-purple-500/20 text-purple-300 rounded">Samsung</span>}
            {platform.isEdge && <span className="px-1 bg-cyan-500/20 text-cyan-300 rounded">Edge</span>}
          </div>
          {(platform.osVersion || platform.browserVersion) && (
            <div className="mt-1 text-white/50">
              OS: {platform.osVersion || 'N/A'} | Browser: {platform.browserVersion || 'N/A'}
            </div>
          )}
        </div>

        {/* Device */}
        <div className="mt-2 pt-2 border-t border-white/10 break-words">
          <span className="text-white/50 block mb-1">Device:</span>
          {diagnostics.currentDevice?.label || 'None'}
        </div>

        {/* Error */}
        {diagnostics.status === 'error' && diagnostics.error && (
          <div className="mt-2 pt-2 border-t border-red-500/30 text-red-400 break-words">
            <strong className="text-red-300">{diagnostics.error.type}</strong><br/>
            <span>{diagnostics.error.message}</span>
            <div className="mt-1 text-white/50">
              Retryable: {diagnostics.error.retryable ? 'Yes' : 'No'}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-2 pt-2 border-t border-white/10 flex gap-2">
          <button
            onClick={() => {
              setDebugMode(!debugMode);
            }}
            className={`px-2 py-1 rounded text-[10px] transition-colors ${
              debugMode ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/50'
            }`}
          >
            {debugMode ? 'DEBUG ON' : 'DEBUG OFF'}
          </button>
          <button
            onClick={() => {
              cameraManager.reconnectCamera();
            }}
            className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-[10px] hover:bg-blue-500/30"
          >
            RECONNECT
          </button>
          <button
            onClick={() => {
              cameraManager.switchCamera();
            }}
            className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-[10px] hover:bg-purple-500/30"
          >
            FLIP
          </button>
        </div>
      </div>
    </div>
  );
}
