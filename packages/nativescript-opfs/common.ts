/**
 * Shared, platform-agnostic pieces of @herefishyfish/nativescript-opfs.
 *
 * Handle types come from lib.dom (https://fs.spec.whatwg.org/). The polyfill
 * deviates from it in two places: `FileSystemWritableFileStream` is not a
 * `WritableStream`, and `createSyncAccessHandle` (worker-only in lib.dom) is
 * available on every file handle.
 *
 * Runtime implementations live in index.android.ts and index.ios.ts.
 */

export interface FileSystemReadWriteOptions {
  at?: number;
}

/** Worker-only on the web, so lib.dom does not declare it. */
export interface FileSystemSyncAccessHandle {
  read(buffer: BufferSource, options?: FileSystemReadWriteOptions): number;
  write(buffer: BufferSource, options?: FileSystemReadWriteOptions): number;
  truncate(newSize: number): void;
  getSize(): number;
  flush(): void;
  close(): void;
}

export type OPFSWritableFileStream = Pick<FileSystemWritableFileStream, 'write' | 'seek' | 'truncate' | 'close'>;

export interface OPFSFileHandle extends Omit<FileSystemFileHandle, 'createWritable'> {
  createWritable(options?: FileSystemCreateWritableOptions): Promise<OPFSWritableFileStream>;
  createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle>;
}

export interface OPFSDirectoryHandle extends Omit<FileSystemDirectoryHandle, 'getFileHandle' | 'getDirectoryHandle' | 'keys' | 'values' | 'entries' | typeof Symbol.asyncIterator> {
  getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<OPFSFileHandle>;
  getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<OPFSDirectoryHandle>;
  keys(): AsyncIterableIterator<string>;
  values(): AsyncIterableIterator<OPFSFileHandle | OPFSDirectoryHandle>;
  entries(): AsyncIterableIterator<[string, OPFSFileHandle | OPFSDirectoryHandle]>;
  [Symbol.asyncIterator](): AsyncIterableIterator<[string, OPFSFileHandle | OPFSDirectoryHandle]>;
}

/** Creates a spec-named error (e.g. 'NotFoundError'); NativeScript has no global DOMException. */
export function domError(name: string, message: string): Error {
  const D = (globalThis as any).DOMException;
  if (typeof D === 'function') return new D(message, name);
  const err = new Error(message);
  err.name = name;
  return err;
}

export function toUint8Array(data: BufferSource): Uint8Array {
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  throw new TypeError('Expected an ArrayBuffer or ArrayBufferView.');
}

async function chunkBytes(data: BufferSource | Blob | string): Promise<Uint8Array> {
  if (typeof data === 'string') return new TextEncoder().encode(data);
  if (typeof Blob !== 'undefined' && data instanceof Blob) return new Uint8Array(await data.arrayBuffer());
  return toUint8Array(data as BufferSource);
}

function isWriteParams(chunk: FileSystemWriteChunkType): chunk is WriteParams {
  return typeof chunk === 'object' && chunk !== null && !ArrayBuffer.isView(chunk) && !(chunk instanceof ArrayBuffer) && !(typeof Blob !== 'undefined' && chunk instanceof Blob);
}

/**
 * Implements `write()` for both platforms: raw data, or the `WriteParams` form
 * (`{ type: 'write' | 'seek' | 'truncate', ... }`) that RxDB uses.
 */
export abstract class WritableFileStreamBase implements OPFSWritableFileStream {
  /** Writes at the cursor and advances it. */
  protected abstract writeBytes(bytes: Uint8Array): void;
  abstract seek(position: number): Promise<void>;
  abstract truncate(size: number): Promise<void>;
  abstract close(): Promise<void>;

  async write(chunk: FileSystemWriteChunkType): Promise<void> {
    if (!isWriteParams(chunk)) {
      this.writeBytes(await chunkBytes(chunk));
      return;
    }
    switch (chunk.type) {
      case 'write':
        if (chunk.data == null) throw domError('SyntaxError', "write() with type 'write' requires data.");
        if (chunk.position != null) await this.seek(chunk.position);
        this.writeBytes(await chunkBytes(chunk.data));
        return;
      case 'seek':
        if (chunk.position == null) throw domError('SyntaxError', "write() with type 'seek' requires position.");
        return this.seek(chunk.position);
      case 'truncate':
        if (chunk.size == null) throw domError('SyntaxError', "write() with type 'truncate' requires size.");
        return this.truncate(chunk.size);
      default:
        throw new TypeError(`Unknown write type: ${(chunk as { type: unknown }).type}`);
    }
  }
}

/**
 * Helper used by platform implementations to install onto `navigator.storage`
 * without overwriting an existing native implementation.
 */
export function installPolyfillOnNavigator(getRoot: () => Promise<OPFSDirectoryHandle>): void {
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
