// import { getRxStorageSQLite, SQLiteQueryWithParams } from 'rxdb-premium/plugins/sqlite';
type SQLiteQueryWithParams = any;
import { knownFolders, path } from '@nativescript/core';
import { openOrCreate, SQLiteDatabase } from '@nativescript-community/sqlite';

const getSQLiteBasicsNativeScript = () => {
  return {
    open: (name: string) => {
      return openOrCreate(path.join(knownFolders.documents().getFolder('db').path, `${name}.sqlite`), {
        transformBlobs: true,
      });
    },
    all: async (db: SQLiteDatabase, queryWithParams: SQLiteQueryWithParams) => {
      if (queryWithParams.query.toUpperCase().startsWith('SELECT')) {
        return await db.select(queryWithParams.query, queryWithParams.params ?? []);
      } else {
        return await db.execute(queryWithParams.query, queryWithParams.params ?? []);
      }
    },
    run: async (db: SQLiteDatabase, queryWithParams: SQLiteQueryWithParams) => {
      await db.execute(queryWithParams.query, queryWithParams.params);
    },
    close: async (db: SQLiteDatabase) => {
      return await db.close();
    },
    journalMode: '',
  };
};
