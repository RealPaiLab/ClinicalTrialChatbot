declare global {
  interface Window {
    _env_?: Record<string, string>;
  }
}

const env = window._env_ ?? {};

const DEVELOPMENT = 'development';

interface AppConfig {
  apiBaseUrl: string;
  mapboxToken: string;
  mapboxStyleLight: string;
  mapboxStyleDark: string;
  isDevelopment: boolean;
  turnstileSiteKey: string;
}

const environment = env.ENVIRONMENT || import.meta.env.VITE_ENVIRONMENT || DEVELOPMENT;

export const config: AppConfig = {
  apiBaseUrl: env.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '',
  mapboxToken: env.MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN || '',
  mapboxStyleLight: import.meta.env.VITE_MAPBOX_STYLE_LIGHT || 'mapbox://styles/mapbox/light-v11',
  mapboxStyleDark: import.meta.env.VITE_MAPBOX_STYLE_DARK || 'mapbox://styles/mapbox/dark-v11',
  isDevelopment: environment === DEVELOPMENT,
  turnstileSiteKey: env.TURNSTILE_SITE_KEY || import.meta.env.VITE_TURNSTILE_SITE_KEY || '',
};
