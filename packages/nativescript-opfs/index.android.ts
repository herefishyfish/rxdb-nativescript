/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application, Utils } from '@nativescript/core';
import { domError, installPolyfillOnNavigator, toUint8Array, WritableFileStreamBase, type FileSystemReadWriteOptions, type FileSystemSyncAccessHandle, type OPFSDirectoryHandle, type OPFSFileHandle, type OPFSWritableFileStream } from './common';

export * from './common';

declare const org: any;

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
// Buffers: the runtime passes a JS ArrayBuffer to Java as a direct ByteBuffer
// over the same memory, so no per-byte copies cross the bridge.
// ---------------------------------------------------------------------------

function nativeBuffer(view: Uint8Array): any {
  const buffer: any = view.buffer;
  return buffer.nativeObject ?? buffer;
}

// ---------------------------------------------------------------------------
// Wrappers — promise-based handles that mirror the web spec
// ---------------------------------------------------------------------------

class SyncAccessHandleImpl implements FileSystemSyncAccessHandle {
  constructor(private native: any) {}

  read(buffer: BufferSource, options?: FileSystemReadWriteOptions): number {
    const view = toUint8Array(buffer);
    return this.native.read(nativeBuffer(view), view.byteOffset, view.byteLength, options?.at ?? 0);
  }

  write(buffer: BufferSource, options?: FileSystemReadWriteOptions): number {
    const view = toUint8Array(buffer);
    return this.native.write(nativeBuffer(view), view.byteOffset, view.byteLength, options?.at ?? 0);
  }

  truncate(newSize: number): void {
    this.native.truncate(newSize);
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

class WritableFileStreamImpl extends WritableFileStreamBase {
  constructor(private native: any) {
    super();
  }

  protected writeBytes(bytes: Uint8Array): void {
    this.native.write(nativeBuffer(bytes), bytes.byteOffset, bytes.byteLength);
  }

  async seek(position: number): Promise<void> {
    this.native.seek(position);
  }

  async truncate(size: number): Promise<void> {
    this.native.truncate(size);
  }

  async close(): Promise<void> {
    this.native.close();
  }
}

class FileHandleImpl implements OPFSFileHandle {
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
    // ArrayBuffer.from wraps the direct ByteBuffer without copying.
    return new File([(ArrayBuffer as any).from(this.native.readAll())], this.name);
  }

  async createWritable(options?: { keepExistingData?: boolean }): Promise<OPFSWritableFileStream> {
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

class DirectoryHandleImpl implements OPFSDirectoryHandle {
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

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<OPFSFileHandle> {
    const create = !!(options && options.create);
    return new FileHandleImpl(
      native(() => this.native.getFileHandle(name, create)),
      name,
    );
  }

  async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<OPFSDirectoryHandle> {
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

  async *values(): AsyncIterableIterator<OPFSFileHandle | OPFSDirectoryHandle> {
    for await (const [, v] of this.entries()) yield v;
  }

  async *entries(): AsyncIterableIterator<[string, OPFSFileHandle | OPFSDirectoryHandle]> {
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

export async function getOPFSRoot(): Promise<OPFSDirectoryHandle> {
  const ctx = getAndroidContext();
  const root = getNativeOPFS().getDirectory(ctx);
  return new DirectoryHandleImpl(root, '');
}

export function installOPFSPolyfill(): void {
  installPolyfillOnNavigator(getOPFSRoot);
}
