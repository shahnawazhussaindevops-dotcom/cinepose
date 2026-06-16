// Mock navigator.mediaDevices for testing
const mockMediaStream = () => {
  const tracks: MediaStreamTrack[] = [];
  return {
    getTracks: () => tracks,
    getVideoTracks: () => tracks,
    getAudioTracks: () => [],
    addTrack: (track: MediaStreamTrack) => tracks.push(track),
    removeTrack: (track: MediaStreamTrack) => {
      const idx = tracks.indexOf(track);
      if (idx >= 0) tracks.splice(idx, 1);
    },
    clone: () => mockMediaStream() as unknown as MediaStream,
    active: true,
    id: 'mock-stream',
  } as unknown as MediaStream;
};

const mockTrack = (label = 'Mock Camera', facingMode = 'user') => {
  return {
    kind: 'video',
    label,
    enabled: true,
    muted: false,
    readyState: 'live' as MediaStreamTrackState,
    stop: () => {},
    getSettings: () => ({
      width: 1280,
      height: 720,
      frameRate: 30,
      facingMode,
      deviceId: 'mock-device-id',
      groupId: 'mock-group-id',
    }),
    getCapabilities: () => ({
      width: { min: 320, max: 1920, step: 1 },
      height: { min: 240, max: 1080, step: 1 },
      frameRate: { min: 15, max: 60 },
      facingMode: ['user', 'environment'],
      deviceId: 'mock-device-id',
      groupId: 'mock-group-id',
    }),
    applyConstraints: () => Promise.resolve(),
    clone: () => mockTrack(label, facingMode) as unknown as MediaStreamTrack,
  } as unknown as MediaStreamTrack;
};

const mockDevices = [
  {
    deviceId: 'camera-front',
    groupId: 'group-1',
    kind: 'videoinput',
    label: 'Front Camera (FaceTime HD)',
    toJSON: () => ({}),
  },
  {
    deviceId: 'camera-back',
    groupId: 'group-1',
    kind: 'videoinput',
    label: 'Back Camera (Back Camera)',
    toJSON: () => ({}),
  },
  {
    deviceId: 'camera-ultra-wide',
    groupId: 'group-1',
    kind: 'videoinput',
    label: 'Ultra-Wide Camera (0.5x)',
    toJSON: () => ({}),
  },
  {
    deviceId: 'audio-1',
    groupId: 'group-2',
    kind: 'audioinput',
    label: 'Microphone',
    toJSON: () => ({}),
  },
];

let permissionState: PermissionState = 'prompt';
let shouldSucceed = true;
let errorToThrow: { name: string; message: string } | null = null;

const mockWindow = {
  location: { protocol: 'https:', hostname: 'example.com', href: 'https://example.com' },
  innerWidth: 390,
  innerHeight: 844,
  isSecureContext: true,
  screen: { orientation: { type: 'portrait-primary', lock: async () => {}, unlock: () => {} } },
  addEventListener: () => {},
  removeEventListener: () => {},
};

const mockDocument = {
  visibilityState: 'visible',
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: (tag: string) => {
    if (tag === 'canvas') {
      return {
        getContext: () => null,
        toBlob: (cb: (b: Blob | null) => void) => cb(null),
        toDataURL: () => 'data:image/jpeg;base64,mock',
        width: 0,
        height: 0,
      };
    }
    if (tag === 'video') {
      return {
        srcObject: null,
        play: async () => {},
        pause: () => {},
        load: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        videoWidth: 1280,
        videoHeight: 720,
        readyState: 4,
        muted: false,
        paused: true,
        setAttribute: () => {},
        hasAttribute: () => false,
        removeAttribute: () => {},
      };
    }
    return {};
  },
};

const mockLocalStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  mediaDevices: {
    getUserMedia: async (_constraints?: MediaStreamConstraints) => {
      if (errorToThrow) {
        const err = new Error(errorToThrow.message) as any;
        err.name = errorToThrow.name;
        throw err;
      }
      if (!shouldSucceed) {
        const err = new Error('Permission denied') as any;
        err.name = 'NotAllowedError';
        throw err;
      }
      const stream = mockMediaStream();
      const facingMode = (_constraints?.video as any)?.facingMode?.exact || 'user';
      stream.addTrack(mockTrack('Mock Camera', facingMode));
      return stream;
    },
    enumerateDevices: async () => mockDevices,
    getSupportedConstraints: () => ({
      width: true,
      height: true,
      aspectRatio: true,
      frameRate: true,
      facingMode: true,
      deviceId: true,
      groupId: true,
    }),
  },
  permissions: {
    query: async (_desc: PermissionDescriptor) => ({
      state: permissionState,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  },
};

Object.defineProperty(globalThis, 'navigator', {
  value: mockNavigator,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'window', {
  value: mockWindow,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'document', {
  value: mockDocument,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

// Expose mock helpers on globalThis
(globalThis as any).__setPermissionState = (state: PermissionState) => {
  permissionState = state;
};

(globalThis as any).__setShouldSucceed = (success: boolean) => {
  shouldSucceed = success;
};

(globalThis as any).__setError = (name: string, message: string) => {
  errorToThrow = { name, message };
};

(globalThis as any).__clearError = () => {
  errorToThrow = null;
};
