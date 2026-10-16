# @herefishyfish/nativescript-opfs

A web-spec compliant [Origin Private File System (OPFS)](https://fs.spec.whatwg.org/) polyfill for NativeScript, backed by Java on Android and `NSFileManager`/`NSFileHandle` on iOS. It also installs a single-process `navigator.locks` polyfill, which RxDB's OPFS storage requires.

The TypeScript surface mirrors the [File System Access API](https://developer.mozilla.org/docs/Web/API/File_System_API) so that existing web libraries (RxDB, sqlite-wasm, custom code, etc.) can run unmodified inside a NativeScript app.

## Install

```bash
npm install @herefishyfish/nativescript-opfs
```

## Usage

```ts
import { installOPFSPolyfill, getOPFSRoot } from '@herefishyfish/nativescript-opfs';

// Option A: install the polyfill globally and use the standard web API.
installOPFSPolyfill();
const root = await navigator.storage.getDirectory();

// Option B: get the root directly without polyfilling globals.
const root2 = await getOPFSRoot();

const file = await root.getFileHandle('hello.txt', { create: true });
const writable = await file.createWritable();
await writable.write('Hello OPFS');
await writable.close();
```

## Native Java API

The package also ships a stable, web-spec aligned Java public API under `org.nativescript.plugins.opfs` so that pure-Android consumers can use it directly:

```java
import org.nativescript.plugins.opfs.OPFS;
import org.nativescript.plugins.opfs.FileSystemDirectoryHandle;
import org.nativescript.plugins.opfs.FileSystemFileHandle;
import org.nativescript.plugins.opfs.FileSystemSyncAccessHandle;

FileSystemDirectoryHandle root = OPFS.getDirectory(context);
FileSystemFileHandle handle = root.getFileHandle("hello.txt", true);
FileSystemSyncAccessHandle h = handle.createSyncAccessHandle();
h.write("Hello OPFS".getBytes(), 0);
h.flush();
h.close();
```

## Platforms

| Platform | Status |
| --- | --- |
| Android | Implemented (Java, `org.nativescript.plugins.opfs`), root: `<filesDir>/opfs-root` |
| iOS | Implemented (Foundation), root: `Library/Application Support/opfs-root` |

## With RxDB

```ts
import { installOPFSPolyfill } from '@herefishyfish/nativescript-opfs';
import { getRxStorageOPFSMainThread } from 'rxdb-premium/plugins/storage-opfs';

installOPFSPolyfill();
const storage = getRxStorageOPFSMainThread();
```

## Notes

- `FileSystemSyncAccessHandle` methods are **synchronous** by spec; when using them from JS for high-throughput workloads (e.g. RxDB OPFS storage), invoke from a worker thread to keep the UI responsive.
- Only one sync access handle may be open per file at a time (a second one rejects with `NoModificationAllowedError`).
- Errors use spec names (`NotFoundError`, `TypeMismatchError`, `InvalidModificationError`, ...) on both platforms.
