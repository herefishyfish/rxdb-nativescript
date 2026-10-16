# @herefishyfish/nativescript-sqlite-rxstorage-adapter

```javascript
npm i @herefishyfish/nativescript-sqlite-rxstorage-adapter
```

Backed by [@edusperoni/nativescript-sqlite](https://www.npmjs.com/package/@edusperoni/nativescript-sqlite) (all queries run off the JS thread).

**iOS:** link a SQLite build, e.g. add `OTHER_LDFLAGS = $(inherited) -lsqlite3` to `App_Resources/iOS/build.xcconfig`.

## Usage

```ts
import { getRxStorageSQLite } from 'rxdb-premium/plugins/storage-sqlite';
import { getSQLiteBasicsNativeScript } from '@herefishyfish/nativescript-sqlite-rxstorage-adapter';

const storage = getRxStorageSQLite({
  sqliteBasics: getSQLiteBasicsNativeScript(),
});
```

`getSQLiteBasicsNativeScript(options)` accepts any `openDatabase` option except `path` (e.g. `encryptionKey`, `busyTimeout`), plus `directory` to override the default `<documents>/db` location.

## License

Apache License Version 2.0
