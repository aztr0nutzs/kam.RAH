import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { captureError, logInfo } from '../utils/logger';

export interface WorkRequest {
  id: string;
  intervalMs: number;
  action: () => Promise<void> | void;
  requiresNetwork?: boolean;
}

interface UseSyncSchedulerOptions {
  isOnline: boolean;
}

export const useSyncScheduler = (jobs: WorkRequest[], options: UseSyncSchedulerOptions) => {
  const timersRef = useRef<Record<string, ReturnType<typeof setInterval> | null>>({});
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const runJob = async (job: WorkRequest) => {
    if (job.requiresNetwork && !options.isOnline) {
      return;
    }
    try {
      await job.action();
    } catch (error) {
      captureError(error, 'Scheduled work failed', { jobId: job.id });
    }
  };

  const scheduleJob = (job: WorkRequest) => {
    stopJob(job.id);
    timersRef.current[job.id] = setInterval(() => {
      if (appStateRef.current === 'active') {
        runJob(job);
      }
    }, job.intervalMs);
    logInfo('Scheduled background work', { jobId: job.id, intervalMs: job.intervalMs });
  };

  const stopJob = (jobId: string) => {
    const timer = timersRef.current[jobId];
    if (timer) {
      clearInterval(timer);
      timersRef.current[jobId] = null;
    }
  };

  const startAllJobs = () => {
    jobs.forEach((job) => scheduleJob(job));
  };

  const stopAllJobs = () => {
    Object.keys(timersRef.current).forEach(stopJob);
  };

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      appStateRef.current = nextState;
      if (nextState === 'active') {
        startAllJobs();
      } else {
        stopAllJobs();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    startAllJobs();

    return () => {
      stopAllJobs();
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, options.isOnline]);
};
