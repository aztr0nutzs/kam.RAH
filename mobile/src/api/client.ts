import { Camera, CameraSettings } from '../types/domain';
import { API_BASE_URL } from '../config/appConfig';
import * as SecureStore from 'expo-secure-store';

async function getToken() {
  try {
    return await SecureStore.getItemAsync('userToken');
  } catch (e) {
    console.warn('Error getting token', e);
    return null;
  }
}

class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); } catch {}
      throw new ApiError(data['message'] || `Request failed: ${response.status}`, response.status, data);
    }

    if (response.status === 204) return undefined as any;
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
       return response.json();
    }
    return undefined as any;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle React Native network errors (TypeError: Network request failed)
    if (error instanceof TypeError || error.message === 'Network request failed') {
       console.error(`Network request failed for URL: ${url}`);
       throw new ApiError(`Network error: Could not connect to ${url}. Please ensure the server is running on this IP and accessible.`, 503, { originalError: error });
    }
    throw error;
  }
}

export const getCameras = () => request<Camera[]>('/cameras');

export const updateCameraSettings = (id: string, settings: Partial<CameraSettings>) => 
  request<Camera>(`/cameras/${id}/control`, {
    method: 'POST',
    body: JSON.stringify({ settings }),
  });

export const toggleRecording = (id: string, record: boolean) =>
  request<Camera>(`/cameras/${id}/record`, {
    method: 'POST',
    body: JSON.stringify({ record }),
  });

export const toggleFavorite = (id: string, isFavorite: boolean) =>
  request<Camera>(`/cameras/${id}/favorite`, {
    method: 'POST',
    body: JSON.stringify({ isFavorite: !isFavorite }),
  });

export const addCamera = (name: string, url: string, type = 'IP') =>
  request<Camera>('/cameras', {
    method: 'POST',
    body: JSON.stringify({ name, url, type }),
  });
