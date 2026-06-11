/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly ANTHROPIC_API_KEY: string;
  readonly UPSTASH_REDIS_URL: string;
  readonly UPSTASH_REDIS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace DeviceOrientationEvent {
  function requestPermission(): Promise<'granted' | 'denied'>;
}
