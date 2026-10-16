package org.nativescript.plugins.opfs;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

/**
 * Mirrors the web {@code FileSystemWritableFileStream}.
 *
 * Asynchronous-style streaming write API with a movable position cursor.
 * The underlying implementation is plain blocking I/O; the JS bridge is
 * expected to expose {@code write/seek/truncate/close} as Promises.
 */
public final class FileSystemWritableFileStream {
    private final RandomAccessFile raf;
    private final FileChannel channel;
    private long position;
    private boolean closed;

    private FileSystemWritableFileStream(RandomAccessFile raf, long initialPosition) {
        this.raf = raf;
        this.channel = raf.getChannel();
        this.position = initialPosition;
    }

    static FileSystemWritableFileStream open(File file, boolean keepExistingData) throws IOException {
        RandomAccessFile raf = new RandomAccessFile(file, "rw");
        if (!keepExistingData) {
            raf.setLength(0);
        }
        return new FileSystemWritableFileStream(raf, 0L);
    }

    public int write(ByteBuffer data, int offset, int length) throws IOException {
        ensureOpen();
        ByteBuffer bb = FileSystemSyncAccessHandle.slice(data, offset, length);
        int total = 0;
        while (bb.hasRemaining()) {
            int n = channel.write(bb, position + total);
            total += n;
        }
        position += total;
        return total;
    }

    public void seek(long position) throws IOException {
        ensureOpen();
        if (position < 0) {
            throw new IllegalArgumentException("position must be >= 0");
        }
        this.position = position;
    }

    public void truncate(long size) throws IOException {
        ensureOpen();
        if (size < 0) {
            throw new IllegalArgumentException("size must be >= 0");
        }
        if (size < channel.size()) {
            channel.truncate(size);
        } else {
            raf.setLength(size);
        }
        if (position > size) {
            position = size;
        }
    }

    public void close() throws IOException {
        if (closed) return;
        closed = true;
        try {
            channel.force(true);
        } finally {
            try {
                channel.close();
            } finally {
                raf.close();
            }
        }
    }

    private void ensureOpen() {
        if (closed) {
            throw new InvalidStateException("FileSystemWritableFileStream is closed.");
        }
    }
}
