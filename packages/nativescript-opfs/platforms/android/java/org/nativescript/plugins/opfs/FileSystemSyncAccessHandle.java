package org.nativescript.plugins.opfs;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Mirrors the web {@code FileSystemSyncAccessHandle}.
 *
 * All read / write / truncate / flush / getSize / close operations are synchronous,
 * matching the spec. Per-file exclusivity is enforced via {@link #OPEN_FILES}, which
 * tracks canonical paths of currently-open handles.
 *
 * NOTE for callers on the JS thread: the spec is synchronous; the JS bridge layer
 * should arrange to call these methods from a worker / non-UI thread when used
 * for high-throughput databases (e.g. RxDB OPFS storage).
 */
public final class FileSystemSyncAccessHandle {
    private static final Set<String> OPEN_FILES = ConcurrentHashMap.newKeySet();

    private final RandomAccessFile raf;
    private final FileChannel channel;
    private final String canonicalPath;
    private boolean closed;

    private FileSystemSyncAccessHandle(RandomAccessFile raf, String canonicalPath) {
        this.raf = raf;
        this.channel = raf.getChannel();
        this.canonicalPath = canonicalPath;
    }

    static FileSystemSyncAccessHandle open(File file) throws IOException {
        String canonical = file.getCanonicalPath();
        if (!OPEN_FILES.add(canonical)) {
            throw new InvalidStateException(
                    "A FileSystemSyncAccessHandle is already open for: " + canonical);
        }
        try {
            RandomAccessFile raf = new RandomAccessFile(file, "rw");
            return new FileSystemSyncAccessHandle(raf, canonical);
        } catch (IOException e) {
            OPEN_FILES.remove(canonical);
            throw e;
        }
    }

    /**
     * Reads up to {@code length} bytes from {@code at} into {@code buffer} starting at {@code offset}.
     * The buffer can be a JS ArrayBuffer, which NativeScript passes as a direct ByteBuffer.
     *
     * @return number of bytes read, or 0 at EOF (matches the web spec).
     */
    public int read(ByteBuffer buffer, int offset, int length, long at) throws IOException {
        ensureOpen();
        if (at < 0) {
            throw new IllegalArgumentException("at must be >= 0");
        }
        ByteBuffer bb = slice(buffer, offset, length);
        int total = 0;
        while (bb.hasRemaining()) {
            int n = channel.read(bb, at + total);
            if (n < 0) break;
            total += n;
        }
        return total;
    }

    /**
     * Writes {@code length} bytes of {@code buffer}, starting at {@code offset}, to the file at {@code at}.
     * @return number of bytes written.
     */
    public int write(ByteBuffer buffer, int offset, int length, long at) throws IOException {
        ensureOpen();
        if (at < 0) {
            throw new IllegalArgumentException("at must be >= 0");
        }
        ByteBuffer bb = slice(buffer, offset, length);
        int total = 0;
        while (bb.hasRemaining()) {
            total += channel.write(bb, at + total);
        }
        return total;
    }

    public void truncate(long newSize) throws IOException {
        ensureOpen();
        if (newSize < 0) {
            throw new IllegalArgumentException("newSize must be >= 0");
        }
        if (newSize < channel.size()) {
            channel.truncate(newSize);
        } else {
            raf.setLength(newSize);
        }
    }

    public long getSize() throws IOException {
        ensureOpen();
        return channel.size();
    }

    public void flush() throws IOException {
        ensureOpen();
        channel.force(true);
    }

    public void close() throws IOException {
        if (closed) return;
        closed = true;
        try {
            channel.close();
        } finally {
            try {
                raf.close();
            } finally {
                OPEN_FILES.remove(canonicalPath);
            }
        }
    }

    static ByteBuffer slice(ByteBuffer buffer, int offset, int length) {
        ByteBuffer bb = buffer.duplicate();
        bb.limit(offset + length);
        bb.position(offset);
        return bb;
    }

    private void ensureOpen() {
        if (closed) {
            throw new InvalidStateException("FileSystemSyncAccessHandle is closed.");
        }
    }
}
