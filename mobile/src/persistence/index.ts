import { createRealmContext } from '@realm/react';
import Realm from 'realm';
import { schema, schemaVersion, CameraRecord, TaskRecord, PendingMutationRecord, MutationType } from './schema';
import type { Camera, Task } from '../types/domain';

export const RealmContext = createRealmContext({
  schema,
  schemaVersion,
  deleteRealmIfMigrationNeeded: true,
});

export const { RealmProvider, useRealm, useQuery } = RealmContext;
export { CameraRecord, TaskRecord, PendingMutationRecord, MutationType } from './schema';

export const persistCameras = (realm: Realm, cameras: Camera[]) => {
  realm.write(() => {
    cameras.forEach((camera) => {
      const existing = realm.objectForPrimaryKey<CameraRecord>('CameraRecord', camera.id);
      if (existing) {
        existing.name = camera.name;
        existing.status = camera.status;
        existing.payload = JSON.stringify(camera);
        existing.updatedAt = new Date();
      } else {
        realm.create('CameraRecord', {
          _id: camera.id,
          name: camera.name,
          status: camera.status,
          payload: JSON.stringify(camera),
          updatedAt: new Date(),
        });
      }
    });
  });
};

export const persistTasks = (realm: Realm, tasks: Task[]) => {
  realm.write(() => {
    tasks.forEach((task) => {
      const existing = realm.objectForPrimaryKey<TaskRecord>('TaskRecord', task.id);
      if (existing) {
        existing.name = task.name;
        existing.status = task.status;
        existing.payload = JSON.stringify(task);
        existing.updatedAt = new Date();
      } else {
        realm.create('TaskRecord', {
          _id: task.id,
          name: task.name,
          status: task.status,
          payload: JSON.stringify(task),
          updatedAt: new Date(),
        });
      }
    });
  });
};

export const enqueueMutation = (realm: Realm, type: MutationType, payload: Record<string, unknown>) => {
  realm.write(() => {
    realm.create('PendingMutationRecord', {
      _id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      payload: JSON.stringify(payload),
      createdAt: new Date(),
      retries: 0,
    });
  });
};

export const completeMutation = (realm: Realm, mutationId: string) => {
  realm.write(() => {
    const record = realm.objectForPrimaryKey<PendingMutationRecord>('PendingMutationRecord', mutationId);
    if (record) {
      realm.delete(record);
    }
  });
};

export const incrementRetry = (realm: Realm, mutationId: string) => {
  realm.write(() => {
    const record = realm.objectForPrimaryKey<PendingMutationRecord>('PendingMutationRecord', mutationId);
    if (record) {
      record.retries += 1;
    }
  });
};

const safeParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse Realm payload', error);
    return null;
  }
};

export const mapCameraRecords = (records: Realm.Results<CameraRecord>): Camera[] =>
  records
    .map((record) => safeParse<Camera>(record.payload))
    .filter((value): value is Camera => Boolean(value));

export const mapTaskRecords = (records: Realm.Results<TaskRecord>): Task[] =>
  records
    .map((record) => safeParse<Task>(record.payload))
    .filter((value): value is Task => Boolean(value));
