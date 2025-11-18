import { Platform } from 'react-native';

export const optimizeMediaUrl = (url?: string | null) => {
  if (!url) {
    return null;
  }
  try {
    const parsed = new URL(url);
    const preferredFormat = Platform.OS === 'android' ? 'webp' : 'avif';
    if (!parsed.searchParams.has('format')) {
      parsed.searchParams.set('format', preferredFormat);
    }
    if (!parsed.searchParams.has('quality')) {
      parsed.searchParams.set('quality', '75');
    }
    return parsed.toString();
  } catch (error) {
    return url;
  }
};
