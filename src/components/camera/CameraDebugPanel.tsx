import React, { useEffect, useState } from 'react';
import { cameraManager, CameraDiagnostics } from '../../lib/camera/CameraManager';

export function CameraDebugPanel() {
  const [diagnostics, setDiagnostics] = useState<CameraDiagnostics>(cameraManager.diagnostics);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    cameraManager.setDiagnosticsCallback((d) => setDiagnostics({ ...d }));
  }, []);

  if (!visible) {
    return (
      <button 
        onClick={() => setVisible(true)}
        className="fixed top-24 right-4 z-50 bg-black/50 text-white/50 text-[10px] px-2 py-1 rounded backdrop-blur border border-white/10 font-mono"
      >
        DEV
      </button>
    );
  }

  return (
    <div className="fixed top-24 right-4 z-50 bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-xl w-64 font-mono text-[10px] text-[#22D3EE] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1">
        <strong className="text-white">CAMERA DIAGNOSTICS</strong>
        <button onClick={() => setVisible(false)} className="text-white/50 hover:text-white">✕</button>
      </div>
      <div className="flex flex-col gap-1 opacity-90">
        <div className="flex justify-between"><span>Status:</span> <span className={diagnostics.status === 'error' ? 'text-red-400' : 'text-green-400'}>{diagnostics.status}</span></div>
        <div className="flex justify-between"><span>Facing:</span> <span className="text-white">{diagnostics.facingMode}</span></div>
        <div className="flex justify-between"><span>Resolution:</span> <span className="text-white">{diagnostics.resolution ? `${diagnostics.resolution.width}x${diagnostics.resolution.height}` : 'N/A'}</span></div>
        <div className="flex justify-between"><span>FPS:</span> <span className="text-white">{diagnostics.fps || 'N/A'}</span></div>
        
        <div className="mt-2 pt-2 border-t border-white/10 break-words">
          <span className="text-white/50 block mb-1">Device:</span>
          {diagnostics.currentDeviceLabel || 'None'}
        </div>
        
        {diagnostics.status === 'error' && (
          <div className="mt-2 pt-2 border-t border-red-500/30 text-red-400 break-words">
            <strong>{diagnostics.errorName}</strong><br/>
            {diagnostics.errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
