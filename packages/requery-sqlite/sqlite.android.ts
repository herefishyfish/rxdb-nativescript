import { Utils } from '@nativescript/core';
import { SQLiteDatabaseBase } from './sqlitedatabase';

@NativeClass()
class RequerySQLiteOpenHelper extends io.requery.android.database.sqlite.SQLiteOpenHelper {
  constructor(name, context) {
    super(context, name, null, 1);
  }
}

function createDb(dbName: string, flags) {
  if (dbName === ':memory:') {
    //noinspection JSUnresolvedVariable
    return io.requery.android.database.sqlite.SQLiteDatabase.create(null);
  }

  if (dbName.indexOf('/') >= 0) {
    const openHelper = new RequerySQLiteOpenHelper(dbName, Utils.ad.getApplicationContext());
    const configuration: io.requery.android.database.sqlite.SQLiteDatabaseConfiguration = openHelper.createConfiguration(dbName, flags ?? io.requery.android.database.sqlite.SQLiteDatabase.CREATE_IF_NECESSARY);
    const db = io.requery.android.database.sqlite.SQLiteDatabase.openDatabase(configuration, null, null);
    return db;
  } else {
    return io.requery.android.database.sqlite.SQLiteDatabase.openOrCreateDatabase(dbName, null);
  }
}

export class SQLiteDatabase extends SQLiteDatabaseBase {
  async open() {
    if (!this.db) {
      this.db = createDb(this.filePath, this.flags);
      if (this.threading && !this.worker) {
        this.worker = new Worker('./worker');
        this.worker.onmessage = this.onWorkerMessage;
      }
    }
    return this.isOpen;
  }
}

export function wrapDb(
  db: io.requery.android.database.sqlite.SQLiteDatabase,
  options?: {
    readOnly?: boolean;
    transformBlobs?: boolean;
    threading?: boolean;
  }
): SQLiteDatabase {
  const obj = new SQLiteDatabase(db, options);
  obj.open();
  return obj;
}

export const openOrCreate = (
  filePath: string,
  options?: {
    threading?: boolean;
    transformBlobs?: boolean;
    flags?: number;
  }
): SQLiteDatabase => {
  const obj = new SQLiteDatabase(filePath, options);
  obj.open();
  return obj;
};

export const deleteDatabase = (filePath: string) => io.requery.android.database.sqlite.SQLiteDatabase.deleteDatabase(new java.io.File(filePath));
