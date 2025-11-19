import type { Camera, CameraSettings, Task, AuthResponse } from '../types/domain';
import { appConfig } from '../config/appConfig';
import { captureError } from '../utils/logger';

let apiBaseUrl = appConfig.API_BASE_URL;
let websocketUrl = appConfig.WS_URL;
let authToken: string | null = null;

export class ApiClientError extends Error {
  status: number;
  requestId?: string | null;
  details?: unknown;

  constructor(message: string, status: number, requestId?: string | null, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.requestId = requestId;
    this.details = details;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRoute<TBody, TResponse> {
  path: string;
  method: HttpMethod;
  transformRequest?: (body: TBody) => unknown;
  transformResponse?: (payload: unknown) => TResponse;
}

const routes = {
  login: { path: '/users/login', method: 'POST' } satisfies ApiRoute<{ email: string; password: string }, AuthResponse>,
  register: {
    path: '/users/register',
    method: 'POST',
  } satisfies ApiRoute<{ name: string; email: string; password: string }, AuthResponse>,
  getCameras: { path: '/cameras', method: 'GET' } satisfies ApiRoute<void, Camera[]>,
  createCamera: { path: '/cameras', method: 'POST' } satisfies ApiRoute<Partial<Camera>, Camera>,
  updateCameraSettings: {
    path: '/cameras/:id/control',
    method: 'POST',
    transformRequest: (body: Partial<CameraSettings>) => ({ settings: body }),
  } satisfies ApiRoute<Partial<CameraSettings>, Camera>,
  toggleRecording: {
    path: '/cameras/:id/record',
    method: 'POST',
    transformRequest: (body: { record: boolean }) => body,
  } satisfies ApiRoute<{ record: boolean }, Camera>,
  toggleFavorite: {
    path: '/cameras/:id/favorite',
    method: 'POST',
    transformRequest: (body: { isFavorite: boolean }) => body,
  } satisfies ApiRoute<{ isFavorite: boolean }, Camera>,
  getTasks: { path: '/tasks', method: 'GET' } satisfies ApiRoute<void, Task[]>,
  updateTask: { path: '/tasks/:id', method: 'PUT' } satisfies ApiRoute<Partial<Task>, Task>,
};

export const configureClient = (config: { apiBaseUrl?: string; wsUrl?: string }) => {
  if (config.apiBaseUrl) {
    apiBaseUrl = config.apiBaseUrl;
  }
  if (config.wsUrl) {
    websocketUrl = config.wsUrl;
  }
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const buildHeaders = (headers?: Record<string, string>) => {
  const result: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers || {}),
  };
  if (authToken) {
    result.Authorization = `Bearer ${authToken}`;
  }
  return result;
};

const resolvePath = (routePath: string, params?: Record<string, string>) => {
  if (!params) return routePath;
  return Object.entries(params).reduce((path, [key, value]) => path.replace(`:${key}`, value), routePath);
};

const request = async <TBody, TResponse>(
  route: ApiRoute<TBody, TResponse>,
  options: {
    body?: TBody;
    params?: Record<string, string>;
  } = {}
) => {
  const url = `${apiBaseUrl}${resolvePath(route.path, options.params)}`;
  const transformedBody = route.transformRequest && options.body ? route.transformRequest(options.body) : options.body;
  const response = await fetch(url, {
    method: route.method,
    body: transformedBody ? JSON.stringify(transformedBody) : undefined,
    headers: buildHeaders(),
  });

  const requestId = response.headers.get('x-request-id');

  if (!response.ok) {
    const details = await response.json().catch(() => undefined);
    const message = (details && (details.message as string)) || response.statusText || 'Request failed';
    const error = new ApiClientError(message, response.status, requestId, details);
    captureError(error, 'API request failed', { path: route.path, status: response.status });
    throw error;
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const payload = await response.json();
    return (route.transformResponse ? route.transformResponse(payload) : (payload as TResponse)) as TResponse;
  }

  return undefined as TResponse;
};

export const login = (email: string, password: string) =>
  request(routes.login, { body: { email, password } });

export const register = (name: string, email: string, password: string) =>
  request(routes.register, { body: { name, email, password } });

export const getCameras = () => request(routes.getCameras);

export const createCamera = (payload: { name: string; url: string; type?: Camera['type'] }) =>
  request(routes.createCamera, { body: payload });

export const updateCameraSettings = (cameraId: string, settings: Partial<CameraSettings>) =>
  request(routes.updateCameraSettings, { body: settings, params: { id: cameraId } });

export const toggleRecording = (cameraId: string, record: boolean) =>
  request(routes.toggleRecording, { body: { record }, params: { id: cameraId } });

export const toggleFavorite = (cameraId: string, currentFavorite: boolean, override?: boolean) => {
  const nextValue = typeof override === 'boolean' ? override : !currentFavorite;
  return request(routes.toggleFavorite, { body: { isFavorite: nextValue }, params: { id: cameraId } });
};

export const getTasks = () => request(routes.getTasks);

export const updateTask = (taskId: string, payload: Partial<Task>) =>
  request(routes.updateTask, { body: payload, params: { id: taskId } });

export const getWebsocketUrl = (token?: string | null) => {
  const url = new URL(websocketUrl);
  if (token) {
    url.searchParams.set('token', token);
  }
  return url.toString();
};
