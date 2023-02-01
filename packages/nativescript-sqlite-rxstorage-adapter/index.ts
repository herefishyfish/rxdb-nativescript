type SQLiteQueryWithParams = any;
import { knownFolders, path } from '@nativescript/core';
import { openOrCreate, SQLiteDatabase } from '@herefishyfish/requery-sqlite';
import { SQLiteBasics } from 'rxdb-premium/plugins/sqlite';

export interface ISQLiteDatabaseAdapterOptions {
  transformBlobs?: boolean;
  threading?: boolean;
  flags?: number;
}

export const getSQLiteBasicsNativeScript = (options?: ISQLiteDatabaseAdapterOptions): SQLiteBasics<SQLiteDatabase> => {
  return {
    open: async (name: string) => {
      return await openOrCreate(path.join(knownFolders.documents().getFolder('db').path, `${name}.sqlite`), {
        transformBlobs: true,
        ...(options ?? {}),
      });
    },
    all: async (db: SQLiteDatabase, queryWithParams: SQLiteQueryWithParams) => {
      return (await db.select(queryWithParams.query, queryWithParams.params ?? [])) as any;
    },
    run: async (db: SQLiteDatabase, queryWithParams: SQLiteQueryWithParams) => {
      await db.select(queryWithParams.query, queryWithParams.params ?? []);
    },
    close: (db: SQLiteDatabase) => {
      return db.close();
    },
    journalMode: '',
  };
};
