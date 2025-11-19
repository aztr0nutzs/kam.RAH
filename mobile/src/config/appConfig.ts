export const appConfig = {
  API_BASE_URL: 'http://10.0.2.2:5000/api',
  WS_URL: 'ws://10.0.2.2:5000/ws/events',
};

export type ConnectionSettings = {
  apiBaseUrl: string;
  wsUrl: string;
};

export const defaultConnectionSettings: ConnectionSettings = {
  apiBaseUrl: appConfig.API_BASE_URL,
  wsUrl: appConfig.WS_URL,
};

export const STORAGE_KEYS = {
  CONNECTION: 'kamrah-mobile:connection',
  AUTH_LEGACY: 'kamrah-mobile:auth',
};

export const SECURE_STORAGE_KEYS = {
  AUTH: 'kamrah-mobile:auth-secure',
};
