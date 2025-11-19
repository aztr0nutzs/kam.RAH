import Realm from 'realm';
import type { Camera, Task } from '../types/domain';

export type MutationType =
  | 'camera:update'
  | 'camera:favorite'
  | 'camera:recording'
  | 'task:update';

export class CameraRecord extends Realm.Object<CameraRecord> {
  _id!: string;
  name!: string;
  status!: string;
  payload!: string;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'CameraRecord',
    primaryKey: '_id',
    properties: {
      _id: 'string',
      name: 'string',
      status: 'string',
      payload: 'string',
      updatedAt: 'date',
    },
  };
}

export class TaskRecord extends Realm.Object<TaskRecord> {
  _id!: string;
  name!: string;
  status!: string;
  payload!: string;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'TaskRecord',
    primaryKey: '_id',
    properties: {
      _id: 'string',
      name: 'string',
      status: 'string',
      payload: 'string',
      updatedAt: 'date',
    },
  };
}

export class PendingMutationRecord extends Realm.Object<PendingMutationRecord> {
  _id!: string;
  type!: MutationType;
  payload!: string;
  createdAt!: Date;
  retries!: number;

  static schema: Realm.ObjectSchema = {
    name: 'PendingMutationRecord',
    primaryKey: '_id',
    properties: {
      _id: 'string',
      type: 'string',
      payload: 'string',
      createdAt: 'date',
      retries: { type: 'int', default: 0 },
    },
  };
}

export type CameraPayload = Camera;
export type TaskPayload = Task;

export const schemaVersion = 1;

export const schema = [CameraRecord, TaskRecord, PendingMutationRecord];
