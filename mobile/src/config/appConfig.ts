
import { Platform } from 'react-native';

// On Android Emulator, localhost is 10.0.2.2
// On physical device, change this to your machine's local IP (e.g., 192.168.1.X)
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';

export const API_BASE_URL = `http://${DEV_HOST}:5000/api`;
export const WS_BASE_URL = `ws://${DEV_HOST}:5000/ws/events`;
