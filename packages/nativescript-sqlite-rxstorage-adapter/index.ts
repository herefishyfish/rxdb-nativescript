import { knownFolders, path } from '@nativescript/core';
import { openDatabase, type DatabaseOptions, type SQLiteDatabase } from '@edusperoni/nativescript-sqlite';
import type { SQLiteBasics, SQLResultRow } from 'rxdb-premium/plugins/storage-sqlite';

export type NativeScriptSQLiteOptions = Partial<Omit<DatabaseOptions, 'path' | 'serialized'>> & {
  /** Directory for database files. Defaults to `<documents>/db`. */
  directory?: string;
};

export const getSQLiteBasicsNativeScript = (options: NativeScriptSQLiteOptions = {}): SQLiteBasics<SQLiteDatabase> => {
  const { directory, ...dbOptions } = options;
  return {
    open: async (name) => {
      const db = openDatabase({
        ...dbOptions,
        // rxdb runs raw BEGIN/COMMIT, so every query must share one connection.
        serialized: true,
        path: name === ':memory:' ? name : path.join(directory ?? knownFolders.documents().getFolder('db').path, `${name}.sqlite`),
      });
      await db.initialized();
      return db;
    },
    all: (db, q) => db.select(q.query, q.params) as Promise<SQLResultRow[]>,
    run: (db, q) => db.execute(q.query, q.params),
    setPragma: (db, key, value) => db.execute(`PRAGMA ${key} = ${value}`),
    close: (db) => db.close(),
    // The plugin already enables WAL on open.
    journalMode: '',
  };
};
