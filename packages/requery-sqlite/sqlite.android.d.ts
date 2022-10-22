import { SQLiteDatabaseBase } from './sqlitedatabase';
export class SQLiteDatabase extends SQLiteDatabaseBase {
  open(): Promise<any>;
}
export declare const openOrCreate: (
  filePath: string,
  options?: {
    threading?: boolean;
    transformBlobs?: boolean;
    flags?: number;
  }
) => any;
export declare const deleteDatabase: (filePath: string) => any;
