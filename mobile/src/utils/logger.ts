import type { LogEntry } from '../types/domain';

export type LogLevel = LogEntry['level'];
export type LoggerMetadata = Record<string, unknown> | undefined;

export interface LoggerEvent extends LogEntry {
  metadata?: LoggerMetadata;
}

type Listener = (event: LoggerEvent) => void;

const listeners = new Set<Listener>();

const notifyListeners = (event: LoggerEvent) => {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
      console.error('Logger listener failed', error);
    }
  });
};

export const registerLogListener = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const writeToConsole = (level: LogLevel, message: string, metadata?: LoggerMetadata) => {
  const payload = metadata ? `${message} ${JSON.stringify(metadata)}` : message;
  switch (level) {
    case 'warn':
      console.warn(payload);
      break;
    case 'error':
      console.error(payload);
      break;
    default:
      console.log(payload);
      break;
  }
};

const createEvent = (level: LogLevel, message: string, metadata?: LoggerMetadata): LoggerEvent => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  level,
  message,
  metadata,
  timestamp: new Date().toISOString(),
});

export const logEvent = (level: LogLevel, message: string, metadata?: LoggerMetadata) => {
  const event = createEvent(level, message, metadata);
  writeToConsole(level, message, metadata);
  notifyListeners(event);
  return event;
};

export const logInfo = (message: string, metadata?: LoggerMetadata) => logEvent('info', message, metadata);
export const logWarn = (message: string, metadata?: LoggerMetadata) => logEvent('warn', message, metadata);
export const logError = (message: string, metadata?: LoggerMetadata) => logEvent('error', message, metadata);

export const captureError = (error: unknown, context?: string, metadata?: LoggerMetadata) => {
  const normalized = error instanceof Error ? error : new Error(String(error));
  const combinedMetadata: LoggerMetadata = {
    ...metadata,
    name: normalized.name,
    stack: normalized.stack,
  };
  const message = context ? `${context}: ${normalized.message}` : normalized.message;
  logError(message, combinedMetadata);
};
