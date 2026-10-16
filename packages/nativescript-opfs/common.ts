/**
 * Shared, platform-agnostic types for @herefishyfish/nativescript-opfs.
 *
 * These mirror the WHATWG File System Access API:
 *   https://fs.spec.whatwg.org/
 *   https://developer.mozilla.org/docs/Web/API/File_System_API
 *
 * The actual runtime implementations live in:
 *   - index.android.ts (Android, backed by org.nativescript.plugins.opfs)
 *   - index.ios.ts     (iOS, backed by NSFileManager / NSFileHandle)
 *
 * Web spec consumers (e.g. RxDB OPFS storage) only need the polyfill installed
 * on `globalThis.navigator.storage` via {@link installOPFSPolyfill}.
 */

export type FileSystemHandleKind = 'file' | 'directory';

export interface FileSystemHandle {
  readonly kind: FileSystemHandleKind;
  readonly name: string;
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
}

export interface FileSystemGetFileOptions {
  create?: boolean;
}

export interface FileSystemGetDirectoryOptions {
  create?: boolean;
}

export interface FileSystemRemoveOptions {
  recursive?: boolean;
}

export interface FileSystemCreateWritableOptions {
  keepExistingData?: boolean;
}

export interface FileSystemReadWriteOptions {
  at?: number;
}

export interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: 'file';
  getFile(): Promise<File>;
  createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
  createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle>;
}

export interface FileSystemDirectoryHandle extends FileSystemHandle {
  readonly kind: 'directory';
  getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;
  removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
  keys(): AsyncIterableIterator<string>;
  values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>;
  entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
  [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
}

export interface FileSystemWritableFileStream {
  write(data: ArrayBuffer | ArrayBufferView | Blob | string): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
  close(): Promise<void>;
}

export interface FileSystemSyncAccessHandle {
  read(buffer: ArrayBuffer | ArrayBufferView, options?: FileSystemReadWriteOptions): number;
  write(buffer: ArrayBuffer | ArrayBufferView, options?: FileSystemReadWriteOptions): number;
  truncate(newSize: number): void;
  getSize(): number;
  flush(): void;
  close(): void;
}

/**
 * Public installer signature; implemented per-platform.
 *
 * Installs `globalThis.navigator.storage.getDirectory` if not already present.
 * Safe to call multiple times.
 */
export type InstallOPFSPolyfill = () => void;

/**
 * Public root accessor; implemented per-platform.
 *
 * Returns the OPFS root directory handle without touching globals.
 */
export type GetOPFSRoot = () => Promise<FileSystemDirectoryHandle>;

/** Creates a spec-named error (e.g. 'NotFoundError'); NativeScript has no global DOMException. */
export function domError(name: string, message: string): Error {
  const D = (globalThis as any).DOMException;
  if (typeof D === 'function') return new D(message, name);
  const err = new Error(message);
  err.name = name;
  return err;
}

/**
 * Helper used by platform implementations to install onto `navigator.storage`
 * without overwriting an existing native implementation.
 */
export function installPolyfillOnNavigator(getRoot: GetOPFSRoot): void {
  const g: any = globalThis as any;
  if (!g.navigator) g.navigator = {};
  if (!g.navigator.storage) g.navigator.storage = {};
  if (typeof g.navigator.storage.getDirectory !== 'function') {
    g.navigator.storage.getDirectory = () => getRoot();
  }
  installWebLocksPolyfill();
}

/**
 * Single-process polyfill for the Web Locks API (`navigator.locks`).
 *
 * NativeScript has no concurrent browsing contexts, so a per-name FIFO queue
 * is enough to satisfy callers like RxDB's OPFS storage that rely on
 * `navigator.locks.request(name, callback)` for cross-context exclusion.
 *
 * Spec reference: https://w3c.github.io/web-locks/
 */
export function installWebLocksPolyfill(): void {
  const g: any = globalThis as any;
  if (!g.navigator) g.navigator = {};
  if (g.navigator.locks && typeof g.navigator.locks.request === 'function') return;

  type Waiter = { mode: 'exclusive' | 'shared'; resolve: () => void; signal?: AbortSignal };
  type LockState = { holders: number; mode: 'exclusive' | 'shared' | null; queue: Waiter[] };
  const locks = new Map<string, LockState>();

  function getState(name: string): LockState {
    let s = locks.get(name);
    if (!s) {
      s = { holders: 0, mode: null, queue: [] };
      locks.set(name, s);
    }
    return s;
  }

  function canAcquire(s: LockState, mode: 'exclusive' | 'shared'): boolean {
    if (s.holders === 0) return true;
    if (mode === 'shared' && s.mode === 'shared') return true;
    return false;
  }

  function processQueue(name: string): void {
    const s = getState(name);
    while (s.queue.length > 0) {
      const next = s.queue[0];
      if (!canAcquire(s, next.mode)) break;
      s.queue.shift();
      s.holders += 1;
      s.mode = next.mode;
      next.resolve();
    }
    if (s.holders === 0 && s.queue.length === 0) locks.delete(name);
  }

  async function request(name: string, optionsOrCallback: any, maybeCallback?: any): Promise<any> {
    let options: { mode?: 'exclusive' | 'shared'; ifAvailable?: boolean; signal?: AbortSignal } = {};
    let callback: (lock: { name: string; mode: string } | null) => any;
    if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback;
    } else {
      options = optionsOrCallback || {};
      callback = maybeCallback;
    }
    const mode: 'exclusive' | 'shared' = options.mode === 'shared' ? 'shared' : 'exclusive';
    const s = getState(name);

    if (options.ifAvailable && !canAcquire(s, mode)) {
      return callback(null);
    }

    if (!canAcquire(s, mode)) {
      await new Promise<void>((resolve, reject) => {
        const waiter: Waiter = { mode, resolve, signal: options.signal };
        if (options.signal) {
          if (options.signal.aborted) {
            reject(domError('AbortError', 'Aborted'));
            return;
          }
          options.signal.addEventListener('abort', () => {
            const idx = s.queue.indexOf(waiter);
            if (idx !== -1) s.queue.splice(idx, 1);
            reject(domError('AbortError', 'Aborted'));
          });
        }
        s.queue.push(waiter);
      });
    } else {
      s.holders += 1;
      s.mode = mode;
    }

    try {
      return await callback({ name, mode });
    } finally {
      s.holders -= 1;
      if (s.holders === 0) s.mode = null;
      processQueue(name);
    }
  }

  g.navigator.locks = {
    request,
    async query() {
      const held: any[] = [];
      const pending: any[] = [];
      locks.forEach((s, name) => {
        if (s.holders > 0 && s.mode) held.push({ name, mode: s.mode, clientId: '', uuid: '' });
        for (const w of s.queue) pending.push({ name, mode: w.mode, clientId: '', uuid: '' });
      });
      return { held, pending };
    },
  };
}
