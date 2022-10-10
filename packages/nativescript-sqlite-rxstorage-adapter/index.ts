// import { getRxStorageSQLite, SQLiteQueryWithParams } from 'rxdb-premium/plugins/sqlite';
type SQLiteQueryWithParams = any;
import { knownFolders, path } from '@nativescript/core';
import { openOrCreate, SQLiteDatabase } from '@nativescript-community/sqlite';
import { SQLiteBasics } from 'rxdb-premium/dist/lib/plugins/sqlite';

export const getSQLiteBasicsNativeScript = (): SQLiteBasics<SQLiteDatabase> => {
  return {
    open: async (name: string) => {
      return openOrCreate(path.join(knownFolders.documents().getFolder('db').path, `${name}.sqlite`), {
        transformBlobs: true,
      });
    },
    all: (db: SQLiteDatabase, queryWithParams: SQLiteQueryWithParams) => {
      if (queryWithParams.query.toUpperCase().startsWith('SELECT')) {
        return db.select(queryWithParams.query, queryWithParams.params ?? []);
      } else {
        return db.execute(queryWithParams.query, queryWithParams.params ?? []) as any;
      }
    },
    run: (db: SQLiteDatabase, queryWithParams: SQLiteQueryWithParams): Promise<void> => {
      return db.execute(queryWithParams.query, queryWithParams.params) as Promise<void>;
    },
    close: (db: SQLiteDatabase) => {
      return db.close();
    },
    journalMode: '',
  };
};
