import { knownFolders, path } from '@nativescript/core';
import { openOrCreate, SQLiteDatabase } from '@herefishyfish/requery-sqlite';
import { SQLiteBasics, SQLResultRow, SQLiteQueryWithParams } from 'rxdb-premium/plugins/storage-sqlite';

export interface ISQLiteDatabaseAdapterOptions {
  transformBlobs?: boolean;
  threading?: boolean;
  flags?: number;
}

export const getSQLiteBasicsNativeScript = (options?: ISQLiteDatabaseAdapterOptions): SQLiteBasics<SQLiteDatabase> => {
  return {
    setPragma: async (db, key, value) => {
      return db.execute(`PRAGMA ${key} = ${value}`) as any;
    },
    open: async (name: string) => {
      return await openOrCreate(path.join(knownFolders.documents().getFolder('db').path, `${name}.sqlite`), {
        transformBlobs: true,
        ...(options ?? {}),
      });
    },
    all: async (db: SQLiteDatabase, queryWithParams: SQLiteQueryWithParams): Promise<SQLResultRow[]> => {
      return db.select(queryWithParams.query, queryWithParams.params ?? []);
    },
    run: async (db: SQLiteDatabase, queryWithParams: SQLiteQueryWithParams) => {
      return db.select(queryWithParams.query, queryWithParams.params ?? []);
    },
    close: async (db: SQLiteDatabase) => {
      return db.close();
    },
    journalMode: '',
  };
};
