import type { Camera, CameraSettings, Task } from '../types';
import { sanitizeInput } from '../utils/sanitize';

// P0-2: Parameterize API base URL
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://127.0.0.1:5000/api';

// A standardized error for the API client
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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token from local storage
  const token = localStorage.getItem('authToken');

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      // Add Authorization header if token exists
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `Server returned an error: ${response.statusText}` };
      }
       // Handle 401 Unauthorized - e.g., redirect to login
      if (response.status === 401) {
        // Example: localStorage.removeItem('authToken');
        // Example: window.location.href = '/login';
        console.error('Authentication error: Token is invalid or expired.');
      }
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
        throw error; // Re-throw api errors that we've already processed
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // This catches network errors like the server being down
      throw new ApiError('Network error: Failed to connect to the server. Please ensure it is running and accessible.', 503, { originalError: error });
    }
    // For any other unexpected errors
    throw new ApiError('An unexpected error occurred during the request.', 500, { originalError: error });
  }
}

// --- Camera API ---

export const getCameras = (): Promise<Camera[]> => {
  return request<Camera[]>('/cameras');
};

export const updateCameraSettings = (cameraId: string, settings: Partial<CameraSettings>): Promise<Camera> => {
    return request<Camera>(`/cameras/${cameraId}/control`, {
        method: 'POST',
        body: JSON.stringify({ settings }),
    });
};

export const toggleRecording = (cameraId: string, record: boolean): Promise<Camera> => {
  return request<Camera>(`/cameras/${cameraId}/record`, {
    method: 'POST',
    body: JSON.stringify({ record }),
  });
};

export const addCamera = (name: string, url: string, type: 'IP' | 'USB' | 'Android' = 'IP'): Promise<Camera> => {
  const sanitizedName = sanitizeInput(name);
  return request<Camera>('/cameras', {
    method: 'POST',
    body: JSON.stringify({ name: sanitizedName, url, type }),
  });
};

export const toggleFavorite = (cameraId: string, isFavorite: boolean): Promise<Camera> => {
    // Note: The endpoint seems to expect the *new* state, not the old one.
    // The hook implementation `!cam.isFavorite` was wrong.
    // This function should receive the *new* desired state.
    return request<Camera>(`/cameras/${cameraId}/favorite`, {
        method: 'POST',
        body: JSON.stringify({ isFavorite }),
    });
};

// --- Task API ---

export const getTasks = (params: { status?: string; ownerId?: string; limit?: number; offset?: number } = {}): Promise<{ data: Task[], total: number }> => {
  const query = new URLSearchParams(Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  )).toString();
  return request<{ data: Task[], total: number }>(`/tasks?${query}`);
};

export const createTask = (title: string, description: string, meta?: Record<string, any>): Promise<Task> => {
  return request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify({ 
      title: sanitizeInput(title), 
      description: sanitizeInput(description),
      meta 
    }),
  });
};

export const updateTask = (taskId: string, updates: Partial<Omit<Task, '_id' | 'ownerId' | 'createdAt' | 'updatedAt'>>): Promise<Task> => {
  return request<Task>(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

export const deleteTask = (taskId: string): Promise<{ message: string }> => {
  return request<{ message: string }>(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
};