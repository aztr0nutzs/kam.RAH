import * as SecureStore from 'expo-secure-store';
import { captureError } from './logger';

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainService: 'kamrah-auth',
};

export const writeSecureJson = async <T>(key: string, value: T) => {
  await SecureStore.setItemAsync(key, JSON.stringify(value), secureOptions);
};

export const readSecureJson = async <T>(key: string): Promise<T | null> => {
  const storedValue = await SecureStore.getItemAsync(key, secureOptions);
  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch (error) {
    captureError(error, 'Failed to parse secure storage payload');
    await SecureStore.deleteItemAsync(key, secureOptions);
    return null;
  }
};

export const deleteSecureItem = async (key: string) => {
  await SecureStore.deleteItemAsync(key, secureOptions);
};
