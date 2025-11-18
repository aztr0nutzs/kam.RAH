const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:5000/api';
const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://127.0.0.1:5000/ws/events';
const REQUIRE_AUTH = (import.meta.env.VITE_REQUIRE_AUTH ?? 'true') !== 'false';

export const appConfig = {
  API_BASE_URL,
  WS_URL,
  REQUIRE_AUTH,
};
