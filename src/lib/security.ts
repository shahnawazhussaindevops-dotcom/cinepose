const STORAGE_KEYS = {
  GENDER: 'cinepose_gender',
  THEME: 'cinepose_theme',
  LANGUAGE: 'cinepose_language',
  ONBOARDING: 'cinepose_onboarding',
  SETTINGS: 'cinepose_settings',
  POSE_PREFS: 'cinepose_pose_prefs',
  AUTH_TOKEN: 'cinepose_auth_token',
  REFRESH_TOKEN: 'cinepose_refresh_token',
} as const;

export class SecureStore {
  static set(key: string, value: string): void {
    try {
      const encoded = btoa(encodeURIComponent(value));
      localStorage.setItem(key, encoded);
    } catch {
      localStorage.setItem(key, value);
    }
  }

  static get(key: string): string | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return decodeURIComponent(atob(item));
    } catch {
      return localStorage.getItem(key);
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
}

export function sanitizeHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, char => map[char] ?? char);
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const magicBytes: Record<string, string> = {
    'image/jpeg': 'ffd8ffe0',
    'image/png': '89504e47',
    'image/webp': '52494646',
    'image/heic': '00000018',
  };

  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxBytes: number = 50 * 1024 * 1024): boolean {
  return file.size <= maxBytes;
}

export const API_RATE_LIMITS = {
  AI_REQUESTS_PER_HOUR: 20,
  LUT_EXPORTS_PER_HOUR: 50,
  PHOTO_UPLOADS_PER_HOUR: 100,
};

export const CONTENT_SECURITY_POLICY = {
  'default-src': ["'self'"],
  'connect-src': ["'self'", 'https://api.anthropic.com', 'https://*.supabase.co'],
  'img-src': ["'self'", 'blob:', 'data:', 'https://*.supabase.co'],
  'media-src': ["'self'", 'blob:'],
  'worker-src': ["'self'", 'blob:'],
  'script-src': ["'self'", "'wasm-unsafe-eval'"],
};

export function generateCSP(): string {
  return Object.entries(CONTENT_SECURITY_POLICY)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

export { STORAGE_KEYS };
