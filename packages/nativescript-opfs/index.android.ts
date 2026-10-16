/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application, Utils } from '@nativescript/core';
import { domError, installPolyfillOnNavigator, type FileSystemDirectoryHandle, type FileSystemFileHandle, type FileSystemReadWriteOptions, type FileSystemSyncAccessHandle, type FileSystemWritableFileStream } from './common';

export * from './common';

declare const org: any;
declare const java: any;

// ---------------------------------------------------------------------------
// Native-binding helpers
// ---------------------------------------------------------------------------

function getAndroidContext(): any {
  const app = (Application as any).android;
  if (app && app.context) return app.context;
  if ((Utils as any).android && (Utils as any).android.getApplicationContext) {
    return (Utils as any).android.getApplicationContext();
  }
  throw new Error('@herefishyfish/nativescript-opfs: Android application context is not available yet.');
}

function getNativeOPFS(): any {
  return org.nativescript.plugins.opfs.OPFS;
}

const ERROR_NAMES: Record<string, string> = {
  NotFoundException: 'NotFoundError',
  TypeMismatchException: 'TypeMismatchError',
  InvalidModificationException: 'InvalidModificationError',
  InvalidStateException: 'InvalidStateError',
};

function native<T>(fn: () => T): T {
  try {
    return fn();
  } catch (e: any) {
    const ex = e?.nativeException;
    const name = ex && ERROR_NAMES[ex.getClass().getSimpleName()];
    throw name ? domError(name, String(ex.getMessage())) : e;
  }
}

// ---------------------------------------------------------------------------
// Buffer <-> Java byte[] conversion
// ---------------------------------------------------------------------------

function toByteArray(buffer: ArrayBuffer | ArrayBufferView): { bytes: any; length: number } {
  let view: Uint8Array;
  if (buffer instanceof ArrayBuffer) {
    view = new Uint8Array(buffer);
  } else if (ArrayBuffer.isView(buffer)) {
    view = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else {
    throw new TypeError('Expected ArrayBuffer or ArrayBufferView');
  }
  const bytes = (Array as any).create('byte', view.length);
  for (let i = 0; i < view.length; i++) {
    const v = view[i];
    bytes[i] = v < 128 ? v : v - 256;
  }
  return { bytes, length: view.length };
}

function readIntoBuffer(buffer: ArrayBuffer | ArrayBufferView, bytes: any, n: number): void {
  let view: Uint8Array;
  if (buffer instanceof ArrayBuffer) {
    view = new Uint8Array(buffer);
  } else {
    view = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }
  for (let i = 0; i < n; i++) {
    const v = bytes[i];
    view[i] = v < 0 ? v + 256 : v;
  }
}

// ---------------------------------------------------------------------------
// Wrappers — promise-based handles that mirror the web spec
// ---------------------------------------------------------------------------

class SyncAccessHandleImpl implements FileSystemSyncAccessHandle {
  constructor(private native: any) {}

  read(buffer: ArrayBuffer | ArrayBufferView, options?: FileSystemReadWriteOptions): number {
    const at = options && typeof options.at === 'number' ? options.at : 0;
    const len = (buffer as any).byteLength;
    const tmp = (Array as any).create('byte', len);
    const n = this.native.read(tmp, java.lang.Long.valueOf(at).longValue());
    readIntoBuffer(buffer, tmp, n);
    return n;
  }

  write(buffer: ArrayBuffer | ArrayBufferView, options?: FileSystemReadWriteOptions): number {
    const at = options && typeof options.at === 'number' ? options.at : 0;
    const { bytes } = toByteArray(buffer);
    return this.native.write(bytes, java.lang.Long.valueOf(at).longValue());
  }

  truncate(newSize: number): void {
    this.native.truncate(java.lang.Long.valueOf(newSize).longValue());
  }

  getSize(): number {
    return this.native.getSize();
  }

  flush(): void {
    this.native.flush();
  }

  close(): void {
    this.native.close();
  }
}

class WritableFileStreamImpl implements FileSystemWritableFileStream {
  constructor(private native: any) {}

  async write(data: ArrayBuffer | ArrayBufferView | Blob | string): Promise<void> {
    let view: Uint8Array;
    if (typeof data === 'string') {
      view = new TextEncoder().encode(data);
    } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
      const ab = await (data as Blob).arrayBuffer();
      view = new Uint8Array(ab);
    } else if (data instanceof ArrayBuffer) {
      view = new Uint8Array(data);
    } else {
      view = new Uint8Array((data as ArrayBufferView).buffer, (data as ArrayBufferView).byteOffset, (data as ArrayBufferView).byteLength);
    }
    const { bytes } = toByteArray(view);
    this.native.write(bytes);
  }

  async seek(position: number): Promise<void> {
    this.native.seek(java.lang.Long.valueOf(position).longValue());
  }

  async truncate(size: number): Promise<void> {
    this.native.truncate(java.lang.Long.valueOf(size).longValue());
  }

  async close(): Promise<void> {
    this.native.close();
  }
}

class FileHandleImpl implements FileSystemFileHandle {
  readonly kind = 'file' as const;
  constructor(
    public readonly native: any,
    public readonly name: string,
  ) {}

  isSameEntry(other: any): Promise<boolean> {
    return Promise.resolve(!!other && other.kind === 'file' && other.__path === this.__path);
  }

  get __path(): string {
    return this.native.getAbsolutePath();
  }

  async getFile(): Promise<File> {
    const path = this.native.getAbsolutePath();
    const javaFile = new java.io.File(path);
    const len = javaFile.length();
    const fis = new java.io.FileInputStream(javaFile);
    try {
      const bytes = (Array as any).create('byte', len);
      let read = 0;
      while (read < len) {
        const n = fis.read(bytes, read, len - read);
        if (n < 0) break;
        read += n;
      }
      const ab = new ArrayBuffer(len);
      readIntoBuffer(ab, bytes, len);
      return new File([ab], this.name);
    } finally {
      fis.close();
    }
  }

  async createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream> {
    const keep = !!(options && options.keepExistingData);
    return new WritableFileStreamImpl(this.native.createWritable(keep));
  }

  async createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle> {
    try {
      return new SyncAccessHandleImpl(native(() => this.native.createSyncAccessHandle()));
    } catch (e: any) {
      if (e?.name === 'InvalidStateError') throw domError('NoModificationAllowedError', e.message);
      throw e;
    }
  }
}

class DirectoryHandleImpl implements FileSystemDirectoryHandle {
  readonly kind = 'directory' as const;
  constructor(
    public readonly native: any,
    public readonly name: string,
  ) {}

  isSameEntry(other: any): Promise<boolean> {
    return Promise.resolve(!!other && other.kind === 'directory' && other.__path === this.__path);
  }

  get __path(): string {
    return this.native.getAbsolutePath();
  }

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle> {
    const create = !!(options && options.create);
    return new FileHandleImpl(
      native(() => this.native.getFileHandle(name, create)),
      name,
    );
  }

  async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle> {
    const create = !!(options && options.create);
    return new DirectoryHandleImpl(
      native(() => this.native.getDirectoryHandle(name, create)),
      name,
    );
  }

  async removeEntry(name: string, options?: { recursive?: boolean }): Promise<void> {
    const recursive = !!(options && options.recursive);
    native(() => this.native.removeEntry(name, recursive));
  }

  async resolve(possibleDescendant: any): Promise<string[] | null> {
    const native = possibleDescendant && possibleDescendant.native ? possibleDescendant.native : null;
    if (!native) return null;
    const arr = this.native.resolve(native);
    if (arr === null || arr === undefined) return null;
    const out: string[] = [];
    for (let i = 0; i < arr.length; i++) out.push(String(arr[i]));
    return out;
  }

  async *keys(): AsyncIterableIterator<string> {
    for await (const [k] of this.entries()) yield k;
  }

  async *values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle> {
    for await (const [, v] of this.entries()) yield v;
  }

  async *entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]> {
    const list = this.native.entries();
    const size = list.size();
    for (let i = 0; i < size; i++) {
      const h = list.get(i);
      const name = String(h.getName());
      if (h.isDirectory()) {
        yield [name, new DirectoryHandleImpl(h, name)];
      } else {
        yield [name, new FileHandleImpl(h, name)];
      }
    }
  }

  [Symbol.asyncIterator]() {
    return this.entries();
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getOPFSRoot(): Promise<FileSystemDirectoryHandle> {
  const ctx = getAndroidContext();
  const root = getNativeOPFS().getDirectory(ctx);
  return new DirectoryHandleImpl(root, '');
}

export function installOPFSPolyfill(): void {
  installPolyfillOnNavigator(getOPFSRoot);
}
