import type { Camera, CameraSettings, Task, AuthResponse } from '../types';
import { sanitizeInput } from '../utils/sanitize';
import { appConfig } from '../config/appConfig';

let authToken: string | null = null;

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${appConfig.API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'API request failed', response.status, errorData);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return undefined as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error: Failed to connect to the server.', 503, { originalError: error });
    }
    throw new ApiError('Unexpected error during request', 500, { originalError: error });
  }
}

// Auth endpoints
export const login = (email: string, password: string): Promise<AuthResponse> =>
  request<AuthResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (name: string, email: string, password: string): Promise<AuthResponse> =>
  request<AuthResponse>('/users/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const getProfile = () => request<{ user: AuthResponse['user'] }>('/users/me');

// Camera endpoints
export const getCameras = (): Promise<Camera[]> => request<Camera[]>('/cameras');

export const getCamera = (cameraId: string): Promise<Camera> => request<Camera>(`/cameras/${cameraId}`);

export const createCamera = (
  name: string,
  url: string,
  type: Camera['type'] = 'IP'
): Promise<Camera> => {
  const sanitizedName = sanitizeInput(name);
  return request<Camera>('/cameras', {
    method: 'POST',
    body: JSON.stringify({ name: sanitizedName, url, type }),
  });
};

export const updateCamera = (cameraId: string, payload: Partial<Camera>): Promise<Camera> =>
  request<Camera>(`/cameras/${cameraId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const updateCameraSettings = (
  cameraId: string,
  settings: Partial<CameraSettings>
): Promise<Camera> =>
  request<Camera>(`/cameras/${cameraId}/control`, {
    method: 'POST',
    body: JSON.stringify({ settings }),
  });

export const toggleRecording = (cameraId: string, record: boolean): Promise<Camera> =>
  request<Camera>(`/cameras/${cameraId}/record`, {
    method: 'POST',
    body: JSON.stringify({ record }),
  });

export const toggleFavorite = (cameraId: string, currentFavorite: boolean): Promise<Camera> =>
  request<Camera>(`/cameras/${cameraId}/favorite`, {
    method: 'POST',
    body: JSON.stringify({ isFavorite: !currentFavorite }),
  });

export const deleteCamera = (cameraId: string): Promise<void> =>
  request<void>(`/cameras/${cameraId}`, { method: 'DELETE' });

// Task endpoints
export const getTasks = (): Promise<Task[]> => request<Task[]>('/tasks');

export const createTask = (payload: Partial<Task>): Promise<Task> =>
  request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateTask = (taskId: string, payload: Partial<Task>): Promise<Task> =>
  request<Task>(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteTask = (taskId: string): Promise<void> =>
  request<void>(`/tasks/${taskId}`, { method: 'DELETE' });

export const runTaskNow = (taskId: string): Promise<Task> =>
  request<Task>(`/tasks/${taskId}/run`, { method: 'POST' });

// Legacy helper name maintained for existing components
export const addCamera = createCamera;
