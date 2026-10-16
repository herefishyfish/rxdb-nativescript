import { domError, installPolyfillOnNavigator, toUint8Array, WritableFileStreamBase, type FileSystemReadWriteOptions, type FileSystemSyncAccessHandle, type OPFSDirectoryHandle, type OPFSFileHandle, type OPFSWritableFileStream } from './common';

export * from './common';

const ROOT_DIR_NAME = 'opfs-root';
const openSyncHandles = new Set<string>();

function fm(): NSFileManager {
  return NSFileManager.defaultManager;
}

function kindAt(path: string): 'file' | 'directory' | null {
  if (!fm().fileExistsAtPath(path)) return null;
  const attrs = fm().attributesOfItemAtPathError(path);
  return attrs && attrs.objectForKey(NSFileType) === NSFileTypeDirectory ? 'directory' : 'file';
}

function childPath(dir: string, name: string): string {
  if (!name || name === '.' || name === '..' || /[\\/\u0000]/.test(name)) {
    throw new TypeError(`Invalid name: ${name}`);
  }
  return `${dir}/${name}`;
}

function toNSData(view: Uint8Array): NSData {
  // Marshalling uses the start of the backing buffer, so copy views that don't start at 0.
  const bytes = view.byteOffset === 0 ? view.buffer : view.slice().buffer;
  return NSData.dataWithBytesLength(bytes as any, view.byteLength);
}

function copyInto(target: BufferSource, data: NSData): number {
  const n = data.length;
  if (n === 0) return 0;
  toUint8Array(target).set(new Uint8Array(interop.bufferFromData(data)));
  return n;
}

function openForUpdate(path: string): NSFileHandle {
  const handle = NSFileHandle.fileHandleForUpdatingAtPath(path);
  if (!handle) throw domError('NotFoundError', `Unable to open file: ${path}`);
  return handle;
}

class SyncAccessHandleImpl implements FileSystemSyncAccessHandle {
  private closed = false;
  constructor(
    private handle: NSFileHandle,
    private path: string,
  ) {}

  private ensureOpen() {
    if (this.closed) throw domError('InvalidStateError', 'FileSystemSyncAccessHandle is closed.');
  }

  read(buffer: BufferSource, options?: FileSystemReadWriteOptions): number {
    this.ensureOpen();
    this.handle.seekToFileOffset(options?.at ?? 0);
    return copyInto(buffer, this.handle.readDataOfLength(buffer.byteLength));
  }

  write(buffer: BufferSource, options?: FileSystemReadWriteOptions): number {
    this.ensureOpen();
    const data = toNSData(toUint8Array(buffer));
    this.handle.seekToFileOffset(options?.at ?? 0);
    this.handle.writeData(data);
    return data.length;
  }

  truncate(newSize: number): void {
    this.ensureOpen();
    this.handle.truncateFileAtOffset(newSize);
  }

  getSize(): number {
    this.ensureOpen();
    return Number(this.handle.seekToEndOfFile());
  }

  flush(): void {
    this.ensureOpen();
    this.handle.synchronizeFile();
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    try {
      this.handle.closeFile();
    } finally {
      openSyncHandles.delete(this.path);
    }
  }
}

class WritableFileStreamImpl extends WritableFileStreamBase {
  private position = 0;
  private closed = false;
  constructor(private handle: NSFileHandle) {
    super();
  }

  private ensureOpen() {
    if (this.closed) throw domError('InvalidStateError', 'FileSystemWritableFileStream is closed.');
  }

  protected writeBytes(bytes: Uint8Array): void {
    this.ensureOpen();
    const ns = toNSData(bytes);
    this.handle.seekToFileOffset(this.position);
    this.handle.writeData(ns);
    this.position += ns.length;
  }

  async seek(position: number): Promise<void> {
    this.ensureOpen();
    this.position = position;
  }

  async truncate(size: number): Promise<void> {
    this.ensureOpen();
    this.handle.truncateFileAtOffset(size);
    if (this.position > size) this.position = size;
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.handle.synchronizeFile();
    this.handle.closeFile();
  }
}

class FileHandleImpl implements OPFSFileHandle {
  readonly kind = 'file' as const;
  constructor(
    public readonly __path: string,
    public readonly name: string,
  ) {}

  async isSameEntry(other: any): Promise<boolean> {
    return !!other && other.kind === 'file' && other.__path === this.__path;
  }

  async getFile(): Promise<File> {
    const data = NSData.dataWithContentsOfFile(this.__path);
    if (!data) throw domError('NotFoundError', `File '${this.name}' was not found.`);
    return new File([data.length ? interop.bufferFromData(data) : new ArrayBuffer(0)], this.name);
  }

  async createWritable(options?: { keepExistingData?: boolean }): Promise<OPFSWritableFileStream> {
    const handle = openForUpdate(this.__path);
    if (!options?.keepExistingData) handle.truncateFileAtOffset(0);
    return new WritableFileStreamImpl(handle);
  }

  async createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle> {
    if (openSyncHandles.has(this.__path)) {
      throw domError('NoModificationAllowedError', `A FileSystemSyncAccessHandle is already open for: ${this.__path}`);
    }
    const handle = openForUpdate(this.__path);
    openSyncHandles.add(this.__path);
    return new SyncAccessHandleImpl(handle, this.__path);
  }
}

class DirectoryHandleImpl implements OPFSDirectoryHandle {
  readonly kind = 'directory' as const;
  constructor(
    public readonly __path: string,
    public readonly name: string,
  ) {}

  async isSameEntry(other: any): Promise<boolean> {
    return !!other && other.kind === 'directory' && other.__path === this.__path;
  }

  async getFileHandle(name: string, options?: { create?: boolean }): Promise<OPFSFileHandle> {
    const p = childPath(this.__path, name);
    const kind = kindAt(p);
    if (kind === 'directory') throw domError('TypeMismatchError', `Entry '${name}' exists and is a directory.`);
    if (!kind) {
      if (!options?.create) throw domError('NotFoundError', `File '${name}' was not found.`);
      if (!fm().createFileAtPathContentsAttributes(p, null, null)) throw new Error(`Unable to create file: ${p}`);
    }
    return new FileHandleImpl(p, name);
  }

  async getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<OPFSDirectoryHandle> {
    const p = childPath(this.__path, name);
    const kind = kindAt(p);
    if (kind === 'file') throw domError('TypeMismatchError', `Entry '${name}' exists and is not a directory.`);
    if (!kind) {
      if (!options?.create) throw domError('NotFoundError', `Directory '${name}' was not found.`);
      fm().createDirectoryAtPathWithIntermediateDirectoriesAttributesError(p, true, null);
    }
    return new DirectoryHandleImpl(p, name);
  }

  async removeEntry(name: string, options?: { recursive?: boolean }): Promise<void> {
    const p = childPath(this.__path, name);
    const kind = kindAt(p);
    if (!kind) throw domError('NotFoundError', `Entry '${name}' was not found.`);
    if (kind === 'directory' && !options?.recursive && (fm().contentsOfDirectoryAtPathError(p)?.count ?? 0) > 0) {
      throw domError('InvalidModificationError', `Directory '${name}' is not empty and recursive=false.`);
    }
    fm().removeItemAtPathError(p);
  }

  async resolve(possibleDescendant: any): Promise<string[] | null> {
    const target: string | undefined = possibleDescendant?.__path;
    if (!target) return null;
    if (target === this.__path) return [];
    const prefix = this.__path + '/';
    return target.startsWith(prefix) ? target.slice(prefix.length).split('/') : null;
  }

  async *keys(): AsyncIterableIterator<string> {
    for await (const [k] of this.entries()) yield k;
  }

  async *values(): AsyncIterableIterator<OPFSFileHandle | OPFSDirectoryHandle> {
    for await (const [, v] of this.entries()) yield v;
  }

  async *entries(): AsyncIterableIterator<[string, OPFSFileHandle | OPFSDirectoryHandle]> {
    const names = fm().contentsOfDirectoryAtPathError(this.__path);
    if (!names) return;
    for (let i = 0; i < names.count; i++) {
      const name = String(names.objectAtIndex(i));
      const p = `${this.__path}/${name}`;
      yield [name, kindAt(p) === 'directory' ? new DirectoryHandleImpl(p, name) : new FileHandleImpl(p, name)];
    }
  }

  [Symbol.asyncIterator]() {
    return this.entries();
  }
}

export async function getOPFSRoot(): Promise<OPFSDirectoryHandle> {
  const base = fm().URLsForDirectoryInDomains(NSSearchPathDirectory.ApplicationSupportDirectory, NSSearchPathDomainMask.UserDomainMask).firstObject.path;
  const root = `${base}/${ROOT_DIR_NAME}`;
  if (kindAt(root) !== 'directory') {
    fm().createDirectoryAtPathWithIntermediateDirectoriesAttributesError(root, true, null);
  }
  return new DirectoryHandleImpl(root, '');
}

export function installOPFSPolyfill(): void {
  installPolyfillOnNavigator(getOPFSRoot);
}
