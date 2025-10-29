import type { Camera, CameraSettings } from '../types';
import { sanitizeInput } from '../utils/sanitize';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

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
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
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
    return request<Camera>(`/cameras/${cameraId}/favorite`, {
        method: 'POST',
        body: JSON.stringify({ isFavorite: !isFavorite }),
    });
};