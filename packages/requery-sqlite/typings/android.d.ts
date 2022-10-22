/// <reference path="android-declarations.d.ts"/>

declare module io {
  export module requery {
    export module android {
      export module database {
        export abstract class AbstractCursor {
          public static class: java.lang.Class<io.requery.android.database.AbstractCursor>;
          public mPos: number;
          public mClosed: boolean;
          public mContentResolver: globalAndroid.content.ContentResolver;
          public move(param0: number): boolean;
          public onChange(param0: boolean): void;
          public getCount(): number;
          public copyStringToBuffer(param0: number, param1: globalAndroid.database.CharArrayBuffer): void;
          public finalize(): void;
          public deactivate(): void;
          public isFirst(): boolean;
          public moveToFirst(): boolean;
          public checkPosition(): void;
          public isBeforeFirst(): boolean;
          public getColumnName(param0: number): string;
          public getExtras(): globalAndroid.os.Bundle;
          public getBlob(param0: number): androidNative.Array<number>;
          public constructor();
          public moveToPrevious(): boolean;
          public close(): void;
          public moveToPosition(param0: number): boolean;
          public setExtras(param0: globalAndroid.os.Bundle): void;
          public getType(param0: number): number;
          public isLast(): boolean;
          public registerDataSetObserver(param0: globalAndroid.database.DataSetObserver): void;
          public getColumnCount(): number;
          public moveToLast(): boolean;
          public isNull(param0: number): boolean;
          public getShort(param0: number): number;
          public getDouble(param0: number): number;
          public requery(): boolean;
          public moveToNext(): boolean;
          public registerContentObserver(param0: globalAndroid.database.ContentObserver): void;
          public getString(param0: number): string;
          public onDeactivateOrClose(): void;
          public getFloat(param0: number): number;
          public isAfterLast(): boolean;
          public getLong(param0: number): number;
          public onMove(param0: number, param1: number): boolean;
          public unregisterContentObserver(param0: globalAndroid.database.ContentObserver): void;
          public setNotificationUri(param0: globalAndroid.content.ContentResolver, param1: globalAndroid.net.Uri): void;
          public getInt(param0: number): number;
          public respond(param0: globalAndroid.os.Bundle): globalAndroid.os.Bundle;
          public getColumnNames(): androidNative.Array<string>;
          public getColumnIndex(param0: string): number;
          public getColumnIndexOrThrow(param0: string): number;
          public unregisterDataSetObserver(param0: globalAndroid.database.DataSetObserver): void;
          public getWantsAllOnMoveCalls(): boolean;
          public getNotificationUri(): globalAndroid.net.Uri;
          public getPosition(): number;
          public isClosed(): boolean;
        }
        export module AbstractCursor {
          export class SelfContentObserver {
            public static class: java.lang.Class<io.requery.android.database.AbstractCursor.SelfContentObserver>;
            public onChange(param0: boolean): void;
            public deliverSelfNotifications(): boolean;
            public constructor(param0: io.requery.android.database.AbstractCursor);
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export abstract class AbstractWindowedCursor extends io.requery.android.database.AbstractCursor {
          public static class: java.lang.Class<io.requery.android.database.AbstractWindowedCursor>;
          public mWindow: io.requery.android.database.CursorWindow;
          public isNull(param0: number): boolean;
          public getShort(param0: number): number;
          public copyStringToBuffer(param0: number, param1: globalAndroid.database.CharArrayBuffer): void;
          public getDouble(param0: number): number;
          public getString(param0: number): string;
          public getWindow(): io.requery.android.database.CursorWindow;
          public onDeactivateOrClose(): void;
          public closeWindow(): void;
          public getFloat(param0: number): number;
          public setWindow(param0: io.requery.android.database.CursorWindow): void;
          public clearOrCreateWindow(param0: string): void;
          public checkPosition(): void;
          public getLong(param0: number): number;
          public getInt(param0: number): number;
          public constructor();
          public getBlob(param0: number): androidNative.Array<number>;
          public hasWindow(): boolean;
          public getType(param0: number): number;
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export class CursorWindow extends io.requery.android.database.sqlite.SQLiteClosable {
          public static class: java.lang.Class<io.requery.android.database.CursorWindow>;
          public mWindowPtr: number;
          public constructor(param0: string);
          public allocRow(): boolean;
          public finalize(): void;
          public putLong(param0: number, param1: number, param2: number): boolean;
          public putDouble(param0: number, param1: number, param2: number): boolean;
          public setStartPosition(param0: number): void;
          public toString(): string;
          public constructor();
          public getStartPosition(): number;
          public getString(param0: number, param1: number): string;
          public constructor(param0: string, param1: number);
          public clear(): void;
          public getBlob(param0: number, param1: number): androidNative.Array<number>;
          public setNumColumns(param0: number): boolean;
          public getShort(param0: number, param1: number): number;
          public copyStringToBuffer(param0: number, param1: number, param2: globalAndroid.database.CharArrayBuffer): void;
          public getDouble(param0: number, param1: number): number;
          public putNull(param0: number, param1: number): boolean;
          public getType(param0: number, param1: number): number;
          public getLong(param0: number, param1: number): number;
          public putBlob(param0: androidNative.Array<number>, param1: number, param2: number): boolean;
          public freeLastRow(): void;
          public getName(): string;
          public getWindowSizeBytes(): number;
          public getNumRows(): number;
          public onAllReferencesReleased(): void;
          public getInt(param0: number, param1: number): number;
          public putString(param0: string, param1: number, param2: number): boolean;
          public getFloat(param0: number, param1: number): number;
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export class CursorWindowAllocationException {
          public static class: java.lang.Class<io.requery.android.database.CursorWindowAllocationException>;
          public constructor(param0: string);
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export class DatabaseErrorHandler {
          public static class: java.lang.Class<io.requery.android.database.DatabaseErrorHandler>;
          /**
           * Constructs a new instance of the io.requery.android.database.DatabaseErrorHandler interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
           */
          public constructor(implementation: { onCorruption(param0: io.requery.android.database.sqlite.SQLiteDatabase): void });
          public constructor();
          public onCorruption(param0: io.requery.android.database.sqlite.SQLiteDatabase): void;
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export class DefaultDatabaseErrorHandler extends io.requery.android.database.DatabaseErrorHandler {
          public static class: java.lang.Class<io.requery.android.database.DefaultDatabaseErrorHandler>;
          public constructor();
          public onCorruption(param0: io.requery.android.database.sqlite.SQLiteDatabase): void;
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class CloseGuard {
            public static class: java.lang.Class<io.requery.android.database.sqlite.CloseGuard>;
            public static get(): io.requery.android.database.sqlite.CloseGuard;
            public static setReporter(param0: io.requery.android.database.sqlite.CloseGuard.Reporter): void;
            public close(): void;
            public static setEnabled(param0: boolean): void;
            public static getReporter(): io.requery.android.database.sqlite.CloseGuard.Reporter;
            public open(param0: string): void;
            public warnIfOpen(): void;
          }
          export module CloseGuard {
            export class DefaultReporter extends io.requery.android.database.sqlite.CloseGuard.Reporter {
              public static class: java.lang.Class<io.requery.android.database.sqlite.CloseGuard.DefaultReporter>;
              public report(param0: string, param1: java.lang.Throwable): void;
            }
            export class Reporter {
              public static class: java.lang.Class<io.requery.android.database.sqlite.CloseGuard.Reporter>;
              /**
               * Constructs a new instance of the io.requery.android.database.sqlite.CloseGuard$Reporter interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
               */
              public constructor(implementation: { report(param0: string, param1: java.lang.Throwable): void });
              public constructor();
              public report(param0: string, param1: java.lang.Throwable): void;
            }
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class RequerySQLiteOpenHelperFactory {
            public static class: java.lang.Class<io.requery.android.database.sqlite.RequerySQLiteOpenHelperFactory>;
            public create(param0: androidx.sqlite.db.SupportSQLiteOpenHelper.Configuration): androidx.sqlite.db.SupportSQLiteOpenHelper;
            public constructor(param0: java.lang.Iterable<io.requery.android.database.sqlite.RequerySQLiteOpenHelperFactory.ConfigurationOptions>);
            public constructor();
          }
          export module RequerySQLiteOpenHelperFactory {
            export class CallbackDatabaseErrorHandler extends io.requery.android.database.DatabaseErrorHandler {
              public static class: java.lang.Class<io.requery.android.database.sqlite.RequerySQLiteOpenHelperFactory.CallbackDatabaseErrorHandler>;
              public onCorruption(param0: io.requery.android.database.sqlite.SQLiteDatabase): void;
            }
            export class CallbackSQLiteOpenHelper extends io.requery.android.database.sqlite.SQLiteOpenHelper {
              public static class: java.lang.Class<io.requery.android.database.sqlite.RequerySQLiteOpenHelperFactory.CallbackSQLiteOpenHelper>;
              public onUpgrade(param0: io.requery.android.database.sqlite.SQLiteDatabase, param1: number, param2: number): void;
              public createConfiguration(param0: string, param1: number): io.requery.android.database.sqlite.SQLiteDatabaseConfiguration;
              public onOpen(param0: io.requery.android.database.sqlite.SQLiteDatabase): void;
              public onCreate(param0: io.requery.android.database.sqlite.SQLiteDatabase): void;
              public onDowngrade(param0: io.requery.android.database.sqlite.SQLiteDatabase, param1: number, param2: number): void;
              public onConfigure(param0: io.requery.android.database.sqlite.SQLiteDatabase): void;
            }
            export class ConfigurationOptions {
              public static class: java.lang.Class<io.requery.android.database.sqlite.RequerySQLiteOpenHelperFactory.ConfigurationOptions>;
              /**
               * Constructs a new instance of the io.requery.android.database.sqlite.RequerySQLiteOpenHelperFactory$ConfigurationOptions interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
               */
              public constructor(implementation: { apply(param0: io.requery.android.database.sqlite.SQLiteDatabaseConfiguration): io.requery.android.database.sqlite.SQLiteDatabaseConfiguration });
              public constructor();
              public apply(param0: io.requery.android.database.sqlite.SQLiteDatabaseConfiguration): io.requery.android.database.sqlite.SQLiteDatabaseConfiguration;
            }
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export abstract class SQLiteClosable {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteClosable>;
            public acquireReference(): void;
            public constructor();
            public onAllReferencesReleased(): void;
            public close(): void;
            public releaseReference(): void;
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteConnection {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteConnection>;
            public executeForChangedRowCount(param0: string, param1: androidNative.Array<any>, param2: androidx.core.os.CancellationSignal): number;
            public executeForLong(param0: string, param1: androidNative.Array<any>, param2: androidx.core.os.CancellationSignal): number;
            public onCancel(): void;
            public dump(param0: globalAndroid.util.Printer, param1: boolean): void;
            public isPrimaryConnection(): boolean;
            public enableLocalizedCollators(): void;
            public toString(): string;
            public finalize(): void;
            public execute(param0: string, param1: androidNative.Array<any>, param2: androidx.core.os.CancellationSignal): void;
            public static hasCodec(): boolean;
            public executeForString(param0: string, param1: androidNative.Array<any>, param2: androidx.core.os.CancellationSignal): string;
            public executeForCursorWindow(param0: string, param1: androidNative.Array<any>, param2: io.requery.android.database.CursorWindow, param3: number, param4: number, param5: boolean, param6: androidx.core.os.CancellationSignal): number;
            public executeForBlobFileDescriptor(param0: string, param1: androidNative.Array<any>, param2: androidx.core.os.CancellationSignal): globalAndroid.os.ParcelFileDescriptor;
            public prepare(param0: string, param1: io.requery.android.database.sqlite.SQLiteStatementInfo): void;
            public executeForLastInsertedRowId(param0: string, param1: androidNative.Array<any>, param2: androidx.core.os.CancellationSignal): number;
          }
          export module SQLiteConnection {
            export class Operation {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteConnection.Operation>;
              public mStartTime: number;
              public mEndTime: number;
              public mKind: string;
              public mSql: string;
              public mBindArgs: java.util.ArrayList<any>;
              public mFinished: boolean;
              public mException: java.lang.Exception;
              public mCookie: number;
              public describe(param0: java.lang.StringBuilder, param1: boolean): void;
            }
            export class OperationLog {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteConnection.OperationLog>;
              public dump(param0: globalAndroid.util.Printer, param1: boolean): void;
              public beginOperation(param0: string, param1: string, param2: androidNative.Array<any>): number;
              public describeCurrentOperation(): string;
              public failOperation(param0: number, param1: java.lang.Exception): void;
              public endOperationDeferLog(param0: number): boolean;
              public endOperation(param0: number): void;
              public logOperation(param0: number, param1: string): void;
            }
            export class PreparedStatement {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteConnection.PreparedStatement>;
              public mPoolNext: io.requery.android.database.sqlite.SQLiteConnection.PreparedStatement;
              public mSql: string;
              public mStatementPtr: number;
              public mNumParameters: number;
              public mType: number;
              public mReadOnly: boolean;
              public mInCache: boolean;
              public mInUse: boolean;
            }
            export class PreparedStatementCache extends androidx.collection.LruCache<string, io.requery.android.database.sqlite.SQLiteConnection.PreparedStatement> {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteConnection.PreparedStatementCache>;
              public entryRemoved(param0: boolean, param1: string, param2: io.requery.android.database.sqlite.SQLiteConnection.PreparedStatement, param3: io.requery.android.database.sqlite.SQLiteConnection.PreparedStatement): void;
              public dump(param0: globalAndroid.util.Printer): void;
              public constructor(param0: io.requery.android.database.sqlite.SQLiteConnection, param1: number);
            }
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteConnectionPool {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteConnectionPool>;
            public static CONNECTION_FLAG_READ_ONLY: number;
            public static CONNECTION_FLAG_PRIMARY_CONNECTION_AFFINITY: number;
            public static CONNECTION_FLAG_INTERACTIVE: number;
            public acquireConnection(param0: string, param1: number, param2: androidx.core.os.CancellationSignal): io.requery.android.database.sqlite.SQLiteConnection;
            public shouldYieldConnection(param0: io.requery.android.database.sqlite.SQLiteConnection, param1: number): boolean;
            public close(): void;
            public collectDbStats(param0: java.util.ArrayList<io.requery.android.database.sqlite.SQLiteDebug.DbStats>): void;
            public reconfigure(param0: io.requery.android.database.sqlite.SQLiteDatabaseConfiguration): void;
            public dump(param0: globalAndroid.util.Printer, param1: boolean): void;
            public static open(param0: io.requery.android.database.sqlite.SQLiteDatabaseConfiguration): io.requery.android.database.sqlite.SQLiteConnectionPool;
            public enableLocalizedCollators(): void;
            public releaseConnection(param0: io.requery.android.database.sqlite.SQLiteConnection): void;
            public toString(): string;
            public finalize(): void;
          }
          export module SQLiteConnectionPool {
            export class AcquiredConnectionStatus {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteConnectionPool.AcquiredConnectionStatus>;
              public static NORMAL: io.requery.android.database.sqlite.SQLiteConnectionPool.AcquiredConnectionStatus;
              public static RECONFIGURE: io.requery.android.database.sqlite.SQLiteConnectionPool.AcquiredConnectionStatus;
              public static DISCARD: io.requery.android.database.sqlite.SQLiteConnectionPool.AcquiredConnectionStatus;
              public static values(): androidNative.Array<io.requery.android.database.sqlite.SQLiteConnectionPool.AcquiredConnectionStatus>;
              public static valueOf(param0: string): io.requery.android.database.sqlite.SQLiteConnectionPool.AcquiredConnectionStatus;
            }
            export class ConnectionWaiter {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteConnectionPool.ConnectionWaiter>;
              public mNext: io.requery.android.database.sqlite.SQLiteConnectionPool.ConnectionWaiter;
              public mThread: java.lang.Thread;
              public mStartTime: number;
              public mPriority: number;
              public mWantPrimaryConnection: boolean;
              public mSql: string;
              public mConnectionFlags: number;
              public mAssignedConnection: io.requery.android.database.sqlite.SQLiteConnection;
              public mException: java.lang.RuntimeException;
              public mNonce: number;
            }
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteCursor extends io.requery.android.database.AbstractWindowedCursor {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteCursor>;
            public requery(): boolean;
            public constructor();
            public getDatabase(): io.requery.android.database.sqlite.SQLiteDatabase;
            public setWindow(param0: io.requery.android.database.CursorWindow): void;
            public setSelectionArguments(param0: androidNative.Array<string>): void;
            public close(): void;
            public getCount(): number;
            public constructor(param0: io.requery.android.database.sqlite.SQLiteCursorDriver, param1: string, param2: io.requery.android.database.sqlite.SQLiteQuery);
            public getColumnIndex(param0: string): number;
            public finalize(): void;
            public getColumnNames(): androidNative.Array<string>;
            public static cursorPickFillWindowStartPosition(param0: number, param1: number): number;
            public onMove(param0: number, param1: number): boolean;
            public deactivate(): void;
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteCursorDriver {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteCursorDriver>;
            /**
             * Constructs a new instance of the io.requery.android.database.sqlite.SQLiteCursorDriver interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
             */
            public constructor(implementation: { query(param0: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param1: androidNative.Array<any>): globalAndroid.database.Cursor; cursorDeactivated(): void; cursorRequeried(param0: globalAndroid.database.Cursor): void; cursorClosed(): void; setBindArguments(param0: androidNative.Array<string>): void });
            public constructor();
            public setBindArguments(param0: androidNative.Array<string>): void;
            public query(param0: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param1: androidNative.Array<any>): globalAndroid.database.Cursor;
            public cursorRequeried(param0: globalAndroid.database.Cursor): void;
            public cursorClosed(): void;
            public cursorDeactivated(): void;
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteCustomExtension {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteCustomExtension>;
            public path: string;
            public entryPoint: string;
            public constructor(param0: string, param1: string);
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteCustomFunction {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteCustomFunction>;
            public name: string;
            public numArgs: number;
            public callback: io.requery.android.database.sqlite.SQLiteDatabase.CustomFunction;
            public constructor(param0: string, param1: number, param2: io.requery.android.database.sqlite.SQLiteDatabase.CustomFunction);
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteDatabase extends io.requery.android.database.sqlite.SQLiteClosable {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDatabase>;
            public static LIBRARY_NAME: string;
            public static CONFLICT_ROLLBACK: number;
            public static CONFLICT_ABORT: number;
            public static CONFLICT_FAIL: number;
            public static CONFLICT_IGNORE: number;
            public static CONFLICT_REPLACE: number;
            public static CONFLICT_NONE: number;
            public static OPEN_READONLY: number;
            public static OPEN_READWRITE: number;
            public static OPEN_CREATE: number;
            public static OPEN_URI: number;
            public static OPEN_NOMUTEX: number;
            public static OPEN_FULLMUTEX: number;
            public static OPEN_SHAREDCACHE: number;
            public static OPEN_PRIVATECACHE: number;
            public static CREATE_IF_NECESSARY: number;
            public static ENABLE_WRITE_AHEAD_LOGGING: number;
            public static MAX_SQL_CACHE_SIZE: number;
            public update(param0: string, param1: globalAndroid.content.ContentValues, param2: string, param3: androidNative.Array<string>): number;
            public delete(param0: string, param1: string, param2: androidNative.Array<any>): number;
            public insertOrThrow(param0: string, param1: string, param2: globalAndroid.content.ContentValues): number;
            public update(param0: string, param1: number, param2: globalAndroid.content.ContentValues, param3: string, param4: androidNative.Array<any>): number;
            public yieldIfContendedSafely(): boolean;
            public getPath(): string;
            /** @deprecated */
            public addCustomFunction(param0: string, param1: number, param2: io.requery.android.database.sqlite.SQLiteDatabase.CustomFunction): void;
            public addFunction(param0: string, param1: number, param2: io.requery.android.database.sqlite.SQLiteDatabase.Function, param3: number): void;
            public finalize(): void;
            public rawQueryWithFactory(param0: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param1: string, param2: androidNative.Array<any>, param3: string, param4: androidx.core.os.CancellationSignal): globalAndroid.database.Cursor;
            public stringForQuery(param0: string, param1: androidNative.Array<string>): string;
            public isDatabaseIntegrityOk(): boolean;
            public rawQuery(param0: string, param1: androidNative.Array<any>): globalAndroid.database.Cursor;
            public rawQuery(param0: string, param1: androidNative.Array<any>, param2: androidx.core.os.CancellationSignal): globalAndroid.database.Cursor;
            public queryNumEntries(param0: string, param1: string): number;
            public isReadOnly(): boolean;
            public enableWriteAheadLogging(): boolean;
            public getPageSize(): number;
            public query(param0: boolean, param1: string, param2: androidNative.Array<string>, param3: string, param4: androidNative.Array<any>, param5: string, param6: string, param7: string, param8: string, param9: androidx.core.os.CancellationSignal): globalAndroid.database.Cursor;
            public isOpen(): boolean;
            public static releaseMemory(): number;
            public insertWithOnConflict(param0: string, param1: string, param2: globalAndroid.content.ContentValues, param3: number): number;
            public isWriteAheadLoggingEnabled(): boolean;
            public queryNumEntries(param0: string): number;
            public static stringForQuery(param0: io.requery.android.database.sqlite.SQLiteStatement, param1: androidNative.Array<string>): string;
            public beginTransactionDeferred(): void;
            public setTransactionSuccessful(): void;
            public isDbLockedByCurrentThread(): boolean;
            public query(param0: androidx.sqlite.db.SupportSQLiteQuery, param1: globalAndroid.os.CancellationSignal): globalAndroid.database.Cursor;
            public queryWithFactory(param0: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param1: boolean, param2: string, param3: androidNative.Array<string>, param4: string, param5: androidNative.Array<any>, param6: string, param7: string, param8: string, param9: string, param10: androidx.core.os.CancellationSignal): globalAndroid.database.Cursor;
            public validateSql(param0: string, param1: androidx.core.os.CancellationSignal): void;
            public setMaximumSize(param0: number): number;
            public query(param0: androidx.sqlite.db.SupportSQLiteQuery): globalAndroid.database.Cursor;
            public setLocale(param0: java.util.Locale): void;
            public toString(): string;
            public static openDatabase(param0: io.requery.android.database.sqlite.SQLiteDatabaseConfiguration, param1: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param2: io.requery.android.database.DatabaseErrorHandler): io.requery.android.database.sqlite.SQLiteDatabase;
            public static openOrCreateDatabase(param0: string, param1: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param2: io.requery.android.database.DatabaseErrorHandler): io.requery.android.database.sqlite.SQLiteDatabase;
            public static create(param0: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory): io.requery.android.database.sqlite.SQLiteDatabase;
            public query(param0: string, param1: androidNative.Array<any>): globalAndroid.database.Cursor;
            public onAllReferencesReleased(): void;
            public inTransaction(): boolean;
            public beginTransactionNonExclusive(): void;
            public static openDatabase(param0: string, param1: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param2: number, param3: io.requery.android.database.DatabaseErrorHandler): io.requery.android.database.sqlite.SQLiteDatabase;
            public updateWithOnConflict(param0: string, param1: globalAndroid.content.ContentValues, param2: string, param3: androidNative.Array<string>, param4: number): number;
            public setMaxSqlCacheSize(param0: number): void;
            public addFunction(param0: string, param1: number, param2: io.requery.android.database.sqlite.SQLiteDatabase.Function): void;
            public delete(param0: string, param1: string, param2: androidNative.Array<string>): number;
            public static openDatabase(param0: string, param1: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param2: number): io.requery.android.database.sqlite.SQLiteDatabase;
            public beginTransactionWithListenerNonExclusive(param0: globalAndroid.database.sqlite.SQLiteTransactionListener): void;
            public compileStatement(param0: string): io.requery.android.database.sqlite.SQLiteStatement;
            public static deleteDatabase(param0: java.io.File): boolean;
            public queryNumEntries(param0: string, param1: string, param2: androidNative.Array<string>): number;
            public setVersion(param0: number): void;
            public disableWriteAheadLogging(): void;
            public query(param0: string, param1: androidNative.Array<string>, param2: string, param3: androidNative.Array<any>, param4: string, param5: string, param6: string, param7: string): globalAndroid.database.Cursor;
            public replaceOrThrow(param0: string, param1: string, param2: globalAndroid.content.ContentValues): number;
            public setForeignKeyConstraintsEnabled(param0: boolean): void;
            public static findEditTable(param0: string): string;
            public query(param0: string, param1: androidNative.Array<string>, param2: string, param3: androidNative.Array<any>, param4: string, param5: string, param6: string): globalAndroid.database.Cursor;
            public query(param0: string): globalAndroid.database.Cursor;
            public beginTransaction(): void;
            public beginTransactionWithListenerDeferred(param0: globalAndroid.database.sqlite.SQLiteTransactionListener): void;
            public beginTransactionWithListener(param0: globalAndroid.database.sqlite.SQLiteTransactionListener): void;
            public needUpgrade(param0: number): boolean;
            public blobFileDescriptorForQuery(param0: string, param1: androidNative.Array<string>): globalAndroid.os.ParcelFileDescriptor;
            public static blobFileDescriptorForQuery(param0: io.requery.android.database.sqlite.SQLiteStatement, param1: androidNative.Array<string>): globalAndroid.os.ParcelFileDescriptor;
            public insert(param0: string, param1: string, param2: globalAndroid.content.ContentValues): number;
            public static openOrCreateDatabase(param0: java.io.File, param1: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory): io.requery.android.database.sqlite.SQLiteDatabase;
            public isInMemoryDatabase(): boolean;
            public replace(param0: string, param1: string, param2: globalAndroid.content.ContentValues): number;
            public execSQL(param0: string): void;
            public getVersion(): number;
            public query(param0: androidx.sqlite.db.SupportSQLiteQuery, param1: androidx.core.os.CancellationSignal): globalAndroid.database.Cursor;
            public longForQuery(param0: string, param1: androidNative.Array<string>): number;
            public static openOrCreateDatabase(param0: string, param1: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory): io.requery.android.database.sqlite.SQLiteDatabase;
            public endTransaction(): void;
            public reopenReadWrite(): void;
            public queryWithFactory(param0: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param1: boolean, param2: string, param3: androidNative.Array<string>, param4: string, param5: androidNative.Array<any>, param6: string, param7: string, param8: string, param9: string): globalAndroid.database.Cursor;
            public setPageSize(param0: number): void;
            public execSQL(param0: string, param1: androidNative.Array<any>): void;
            public getMaximumSize(): number;
            public query(param0: boolean, param1: string, param2: androidNative.Array<string>, param3: string, param4: androidNative.Array<any>, param5: string, param6: string, param7: string, param8: string): globalAndroid.database.Cursor;
            public getAttachedDbs(): java.util.List<globalAndroid.util.Pair<string, string>>;
            public insert(param0: string, param1: number, param2: globalAndroid.content.ContentValues): number;
            public yieldIfContendedSafely(param0: number): boolean;
            public rawQueryWithFactory(param0: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param1: string, param2: androidNative.Array<any>, param3: string): globalAndroid.database.Cursor;
          }
          export module SQLiteDatabase {
            export class ConflictAlgorithm {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDatabase.ConflictAlgorithm>;
              /**
               * Constructs a new instance of the io.requery.android.database.sqlite.SQLiteDatabase$ConflictAlgorithm interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
               */
              public constructor(implementation: {});
              public constructor();
            }
            export class CursorFactory {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory>;
              /**
               * Constructs a new instance of the io.requery.android.database.sqlite.SQLiteDatabase$CursorFactory interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
               */
              public constructor(implementation: { newCursor(param0: io.requery.android.database.sqlite.SQLiteDatabase, param1: io.requery.android.database.sqlite.SQLiteCursorDriver, param2: string, param3: io.requery.android.database.sqlite.SQLiteQuery): globalAndroid.database.Cursor });
              public constructor();
              public newCursor(param0: io.requery.android.database.sqlite.SQLiteDatabase, param1: io.requery.android.database.sqlite.SQLiteCursorDriver, param2: string, param3: io.requery.android.database.sqlite.SQLiteQuery): globalAndroid.database.Cursor;
            }
            export class CustomFunction {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDatabase.CustomFunction>;
              /**
               * Constructs a new instance of the io.requery.android.database.sqlite.SQLiteDatabase$CustomFunction interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
               */
              public constructor(implementation: { callback(param0: androidNative.Array<string>): string });
              public constructor();
              public callback(param0: androidNative.Array<string>): string;
            }
            export class Function {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDatabase.Function>;
              /**
               * Constructs a new instance of the io.requery.android.database.sqlite.SQLiteDatabase$Function interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
               */
              public constructor(implementation: { callback(param0: io.requery.android.database.sqlite.SQLiteDatabase.Function.Args, param1: io.requery.android.database.sqlite.SQLiteDatabase.Function.Result): void });
              public constructor();
              public static FLAG_DETERMINISTIC: number;
              public callback(param0: io.requery.android.database.sqlite.SQLiteDatabase.Function.Args, param1: io.requery.android.database.sqlite.SQLiteDatabase.Function.Result): void;
            }
            export module Function {
              export class Args {
                public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDatabase.Function.Args>;
                /**
                 * Constructs a new instance of the io.requery.android.database.sqlite.SQLiteDatabase$Function$Args interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
                 */
                public constructor(implementation: { getBlob(param0: number): androidNative.Array<number>; getString(param0: number): string; getDouble(param0: number): number; getInt(param0: number): number; getLong(param0: number): number });
                public constructor();
                public getInt(param0: number): number;
                public getLong(param0: number): number;
                public getString(param0: number): string;
                public getBlob(param0: number): androidNative.Array<number>;
                public getDouble(param0: number): number;
              }
              export class Result {
                public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDatabase.Function.Result>;
                /**
                 * Constructs a new instance of the io.requery.android.database.sqlite.SQLiteDatabase$Function$Result interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
                 */
                public constructor(implementation: { set(param0: androidNative.Array<number>): void; set(param0: number): void; set(param0: number): void; set(param0: number): void; set(param0: string): void; setError(param0: string): void; setNull(): void });
                public constructor();
                public set(param0: string): void;
                public set(param0: androidNative.Array<number>): void;
                public set(param0: number): void;
                public setNull(): void;
                public setError(param0: string): void;
              }
            }
            export class OpenFlags {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDatabase.OpenFlags>;
              /**
               * Constructs a new instance of the io.requery.android.database.sqlite.SQLiteDatabase$OpenFlags interface with the provided implementation. An empty constructor exists calling super() when extending the interface class.
               */
              public constructor(implementation: {});
              public constructor();
            }
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteDatabaseConfiguration {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDatabaseConfiguration>;
            public static MEMORY_DB_PATH: string;
            public path: string;
            public label: string;
            public openFlags: number;
            public maxSqlCacheSize: number;
            public locale: java.util.Locale;
            public foreignKeyConstraintsEnabled: boolean;
            public customFunctions: java.util.List<io.requery.android.database.sqlite.SQLiteCustomFunction>;
            public functions: java.util.List<io.requery.android.database.sqlite.SQLiteFunction>;
            public customExtensions: java.util.List<io.requery.android.database.sqlite.SQLiteCustomExtension>;
            public constructor(param0: string, param1: number, param2: java.util.List<io.requery.android.database.sqlite.SQLiteCustomFunction>, param3: java.util.List<io.requery.android.database.sqlite.SQLiteFunction>, param4: java.util.List<io.requery.android.database.sqlite.SQLiteCustomExtension>);
            public constructor(param0: string, param1: number);
            public isInMemoryDb(): boolean;
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteDebug {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDebug>;
            public static DEBUG_SQL_LOG: boolean;
            public static DEBUG_SQL_STATEMENTS: boolean;
            public static DEBUG_SQL_TIME: boolean;
            public static DEBUG_LOG_SLOW_QUERIES: boolean;
            public static getDatabaseInfo(): io.requery.android.database.sqlite.SQLiteDebug.PagerStats;
            public static dump(param0: globalAndroid.util.Printer, param1: androidNative.Array<string>): void;
            public static shouldLogSlowQuery(param0: number): boolean;
          }
          export module SQLiteDebug {
            export class DbStats {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDebug.DbStats>;
              public dbName: string;
              public pageSize: number;
              public dbSize: number;
              public lookaside: number;
              public cache: string;
              public constructor(param0: string, param1: number, param2: number, param3: number, param4: number, param5: number, param6: number);
            }
            export class PagerStats {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDebug.PagerStats>;
              public memoryUsed: number;
              public pageCacheOverflow: number;
              public largestMemAlloc: number;
              public dbStats: java.util.ArrayList<io.requery.android.database.sqlite.SQLiteDebug.DbStats>;
              public constructor();
            }
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteDirectCursorDriver extends io.requery.android.database.sqlite.SQLiteCursorDriver {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteDirectCursorDriver>;
            public setBindArguments(param0: androidNative.Array<string>): void;
            public query(param0: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param1: androidNative.Array<any>): globalAndroid.database.Cursor;
            public cursorRequeried(param0: globalAndroid.database.Cursor): void;
            public cursorClosed(): void;
            public cursorDeactivated(): void;
            public constructor(param0: io.requery.android.database.sqlite.SQLiteDatabase, param1: string, param2: string, param3: androidx.core.os.CancellationSignal);
            public toString(): string;
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteFunction {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteFunction>;
            public name: string;
            public numArgs: number;
            public callback: io.requery.android.database.sqlite.SQLiteDatabase.Function;
            public constructor(param0: string, param1: number, param2: io.requery.android.database.sqlite.SQLiteDatabase.Function);
            public constructor(param0: string, param1: number, param2: io.requery.android.database.sqlite.SQLiteDatabase.Function, param3: number);
          }
          export module SQLiteFunction {
            export class MyArgs extends io.requery.android.database.sqlite.SQLiteDatabase.Function.Args {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteFunction.MyArgs>;
              public getDouble(param0: number): number;
              public getBlob(param0: number): androidNative.Array<number>;
              public getString(param0: number): string;
              public getInt(param0: number): number;
              public getLong(param0: number): number;
            }
            export class MyResult extends io.requery.android.database.sqlite.SQLiteDatabase.Function.Result {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteFunction.MyResult>;
              public set(param0: number): void;
              public set(param0: androidNative.Array<number>): void;
              public setError(param0: string): void;
              public set(param0: string): void;
              public setNull(): void;
            }
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteGlobal {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteGlobal>;
            public static getJournalSizeLimit(): number;
            public static getWALAutoCheckpoint(): number;
            public static getWALConnectionPoolSize(): number;
            public static getDefaultJournalMode(): string;
            public static getDefaultSyncMode(): string;
            public static getWALSyncMode(): string;
            public static releaseMemory(): number;
            public static getDefaultPageSize(): number;
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export abstract class SQLiteOpenHelper {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteOpenHelper>;
            public onConfigure(param0: io.requery.android.database.sqlite.SQLiteDatabase): void;
            public close(): void;
            public createConfiguration(param0: string, param1: number): io.requery.android.database.sqlite.SQLiteDatabaseConfiguration;
            public getDatabaseName(): string;
            public onCreate(param0: io.requery.android.database.sqlite.SQLiteDatabase): void;
            public constructor(param0: globalAndroid.content.Context, param1: string, param2: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param3: number, param4: io.requery.android.database.DatabaseErrorHandler);
            public getReadableDatabase(): io.requery.android.database.sqlite.SQLiteDatabase;
            public onUpgrade(param0: io.requery.android.database.sqlite.SQLiteDatabase, param1: number, param2: number): void;
            public getWritableDatabase(): io.requery.android.database.sqlite.SQLiteDatabase;
            public onOpen(param0: io.requery.android.database.sqlite.SQLiteDatabase): void;
            public setWriteAheadLoggingEnabled(param0: boolean): void;
            public onDowngrade(param0: io.requery.android.database.sqlite.SQLiteDatabase, param1: number, param2: number): void;
            public constructor(param0: globalAndroid.content.Context, param1: string, param2: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory, param3: number);
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export abstract class SQLiteProgram extends io.requery.android.database.sqlite.SQLiteClosable {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteProgram>;
            public bindNull(param0: number): void;
            public bindString(param0: number, param1: string): void;
            public getSession(): io.requery.android.database.sqlite.SQLiteSession;
            public onCorruption(): void;
            public bindObject(param0: number, param1: any): void;
            public onAllReferencesReleased(): void;
            public bindBlob(param0: number, param1: androidNative.Array<number>): void;
            public clearBindings(): void;
            public bindAllArgsAsStrings(param0: androidNative.Array<string>): void;
            public getConnectionFlags(): number;
            public bindDouble(param0: number, param1: number): void;
            public bindLong(param0: number, param1: number): void;
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteQuery extends io.requery.android.database.sqlite.SQLiteProgram {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteQuery>;
            public toString(): string;
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteQueryBuilder {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteQueryBuilder>;
            public query(param0: io.requery.android.database.sqlite.SQLiteDatabase, param1: androidNative.Array<string>, param2: string, param3: androidNative.Array<string>, param4: string, param5: string, param6: string, param7: string): globalAndroid.database.Cursor;
            public static buildQueryString(param0: boolean, param1: string, param2: androidNative.Array<string>, param3: string, param4: string, param5: string, param6: string, param7: string): string;
            public constructor();
            public buildUnionSubQuery(param0: string, param1: androidNative.Array<string>, param2: java.util.Set<string>, param3: number, param4: string, param5: string, param6: string, param7: string): string;
            public setDistinct(param0: boolean): void;
            public query(param0: io.requery.android.database.sqlite.SQLiteDatabase, param1: androidNative.Array<string>, param2: string, param3: androidNative.Array<string>, param4: string, param5: string, param6: string, param7: string, param8: androidx.core.os.CancellationSignal): globalAndroid.database.Cursor;
            public setStrict(param0: boolean): void;
            public buildQuery(param0: androidNative.Array<string>, param1: string, param2: string, param3: string, param4: string, param5: string): string;
            public setCursorFactory(param0: io.requery.android.database.sqlite.SQLiteDatabase.CursorFactory): void;
            public static appendColumns(param0: java.lang.StringBuilder, param1: androidNative.Array<string>): void;
            public buildUnionQuery(param0: androidNative.Array<string>, param1: string, param2: string): string;
            public getTables(): string;
            public appendWhere(param0: string): void;
            public appendWhereEscapeString(param0: string): void;
            public setProjectionMap(param0: java.util.Map<string, string>): void;
            public query(param0: io.requery.android.database.sqlite.SQLiteDatabase, param1: androidNative.Array<string>, param2: string, param3: androidNative.Array<string>, param4: string, param5: string, param6: string): globalAndroid.database.Cursor;
            public setTables(param0: string): void;
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteSession {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteSession>;
            public static TRANSACTION_MODE_DEFERRED: number;
            public static TRANSACTION_MODE_IMMEDIATE: number;
            public static TRANSACTION_MODE_EXCLUSIVE: number;
            public beginTransaction(param0: number, param1: globalAndroid.database.sqlite.SQLiteTransactionListener, param2: number, param3: androidx.core.os.CancellationSignal): void;
            public constructor(param0: io.requery.android.database.sqlite.SQLiteConnectionPool);
            public executeForLastInsertedRowId(param0: string, param1: androidNative.Array<any>, param2: number, param3: androidx.core.os.CancellationSignal): number;
            public setTransactionSuccessful(): void;
            public execute(param0: string, param1: androidNative.Array<any>, param2: number, param3: androidx.core.os.CancellationSignal): void;
            public executeForLong(param0: string, param1: androidNative.Array<any>, param2: number, param3: androidx.core.os.CancellationSignal): number;
            public executeForBlobFileDescriptor(param0: string, param1: androidNative.Array<any>, param2: number, param3: androidx.core.os.CancellationSignal): globalAndroid.os.ParcelFileDescriptor;
            public executeForCursorWindow(param0: string, param1: androidNative.Array<any>, param2: io.requery.android.database.CursorWindow, param3: number, param4: number, param5: boolean, param6: number, param7: androidx.core.os.CancellationSignal): number;
            public executeForString(param0: string, param1: androidNative.Array<any>, param2: number, param3: androidx.core.os.CancellationSignal): string;
            public hasTransaction(): boolean;
            public hasConnection(): boolean;
            public prepare(param0: string, param1: number, param2: androidx.core.os.CancellationSignal, param3: io.requery.android.database.sqlite.SQLiteStatementInfo): void;
            public endTransaction(param0: androidx.core.os.CancellationSignal): void;
            public executeForChangedRowCount(param0: string, param1: androidNative.Array<any>, param2: number, param3: androidx.core.os.CancellationSignal): number;
            public hasNestedTransaction(): boolean;
            public yieldTransaction(param0: number, param1: boolean, param2: androidx.core.os.CancellationSignal): boolean;
          }
          export module SQLiteSession {
            export class Transaction {
              public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteSession.Transaction>;
              public mParent: io.requery.android.database.sqlite.SQLiteSession.Transaction;
              public mMode: number;
              public mListener: globalAndroid.database.sqlite.SQLiteTransactionListener;
              public mMarkedSuccessful: boolean;
              public mChildFailed: boolean;
            }
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteStatement extends io.requery.android.database.sqlite.SQLiteProgram {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteStatement>;
            public executeUpdateDelete(): number;
            public simpleQueryForLong(): number;
            public execute(): void;
            public executeInsert(): number;
            public simpleQueryForBlobFileDescriptor(): globalAndroid.os.ParcelFileDescriptor;
            public simpleQueryForString(): string;
            public toString(): string;
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteStatementInfo {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteStatementInfo>;
            public numParameters: number;
            public columnNames: androidNative.Array<string>;
            public readOnly: boolean;
            public constructor();
          }
        }
      }
    }
  }
}

declare module io {
  export module requery {
    export module android {
      export module database {
        export module sqlite {
          export class SQLiteStatementType {
            public static class: java.lang.Class<io.requery.android.database.sqlite.SQLiteStatementType>;
            public static STATEMENT_SELECT: number;
            public static STATEMENT_UPDATE: number;
            public static STATEMENT_ATTACH: number;
            public static STATEMENT_BEGIN: number;
            public static STATEMENT_COMMIT: number;
            public static STATEMENT_ABORT: number;
            public static STATEMENT_PRAGMA: number;
            public static STATEMENT_DDL: number;
            public static STATEMENT_UNPREPARED: number;
            public static STATEMENT_OTHER: number;
            public static getSqlStatementType(param0: string): number;
          }
        }
      }
    }
  }
}

//Generics information:
