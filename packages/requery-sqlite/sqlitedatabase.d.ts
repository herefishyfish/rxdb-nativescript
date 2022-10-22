import { SqliteParam, SqliteParams, SqliteRow, paramsToStringArray, throwError } from './sqlite.common';

declare const io: any;

type Db = any;

type FromCursor<T> = (cursor: android.database.Cursor, transformBlobs?: boolean) => T;

export function byteArrayToBuffer(value);

const messagePromises: { [key: string]: { resolve: Function; reject: Function; timeoutTimer: NodeJS.Timer }[] } = {};
export class SQLiteDatabaseBase {
  db: any;
  flags;
  transformBlobs: boolean;
  constructor(
    public filePath: string,
    options?: {
      threading?: boolean;
      readOnly?: boolean;
      flags?: number;
      transformBlobs?: boolean;
    }
  ) {}
  _isInTransaction = false;
  threading = false;
  worker: Worker;
  onWorkerMessage(event: {
    data: {
      result?: any;
      error?: any;
      id?: number;
    };
  });
  lastId: number;
  sendMessageToWorker(
    nativeData,
    messageData,
    timeout = 0
  ): Promise<{
    id: number;
    nativeDatas?: { [k: string]: any };
    [k: string]: any;
  }>;

  isOpen;

  async close();
  async setVersion(version: number);
  async getVersion();
  async execute(query: string, params?: SqliteParams);
  async get(query: string, params?: SqliteParams, transformBlobs?: boolean);
  async getArray(query: string, params?: SqliteParams, transformBlobs?: boolean);
  async select(query: string, params?: SqliteParams, transformBlobs?: boolean);
  async selectArray(query: string, params?: SqliteParams, transformBlobs?: boolean);
  async each(query: string, params: SqliteParams, callback: (error: Error, result: any) => void, complete: (error: Error, count: number) => void, transformBlobs?: boolean);
  async transaction<T = any>(action: (cancel?: () => void) => Promise<T>): Promise<T>;
}
