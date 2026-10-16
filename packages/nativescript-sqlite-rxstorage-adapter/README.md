# @herefishyfish/nativescript-sqlite-rxstorage-adapter

```javascript
npm i @herefishyfish/nativescript-sqlite-rxstorage-adapter
```

Backed by [@edusperoni/nativescript-sqlite](https://www.npmjs.com/package/@edusperoni/nativescript-sqlite) (all queries run off the JS thread).

**iOS:** link a SQLite build, e.g. add `OTHER_LDFLAGS = $(inherited) -lsqlite3` to `App_Resources/iOS/build.xcconfig`.

**Android:** `@edusperoni/nativescript-sqlite@0.0.7` needs [this patch](../../patches/@edusperoni+nativescript-sqlite+0.0.7.patch) until the fixes land upstream. It escapes Windows paths passed to CMake and stops AGP from packaging the plugin's stub `libNativeScript.so` over the app's runtime. Apply it with [patch-package](https://www.npmjs.com/package/patch-package): copy it into your app's `patches/` folder and add `"postinstall": "patch-package"`.

## Usage

```ts
import { getRxStorageSQLite } from 'rxdb-premium/plugins/storage-sqlite';
import { getSQLiteBasicsNativeScript } from '@herefishyfish/nativescript-sqlite-rxstorage-adapter';

const storage = getRxStorageSQLite({
  sqliteBasics: getSQLiteBasicsNativeScript(),
});
```

`getSQLiteBasicsNativeScript(options)` accepts any `openDatabase` option except `path` and `serialized` (e.g. `busyTimeout`), plus `directory` to override the default `<documents>/db` location.

`encryptionKey` only works with a SQLite build that has a codec (SQLCipher on iOS, SQLite3MultipleCiphers on Android; see the plugin's [encryption caveats](https://www.npmjs.com/package/@edusperoni/nativescript-sqlite#encryption-caveats)). The system SQLite linked by `-lsqlite3` ignores the key and leaves the database unencrypted.

## License

Apache License Version 2.0
