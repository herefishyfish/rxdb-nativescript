package org.nativescript.plugins.opfs;

import java.io.File;
import java.io.IOException;

/**
 * Mirrors the web {@code FileSystemFileHandle}.
 *
 * Provides:
 *   - {@link #getFile()} returning the underlying {@link File} (analogous to {@code File}/Blob).
 *   - {@link #createSyncAccessHandle()} for synchronous random-access I/O (used by
 *     OPFS-backed databases and the RxDB OPFS storage).
 *   - {@link #createWritable(boolean)} for streaming writes.
 */
public final class FileSystemFileHandle extends FileSystemHandle {
    private final File file;

    FileSystemFileHandle(File file, String name) {
        super(name, KIND_FILE);
        this.file = file;
    }

    public File getFile() {
        return file;
    }

    public long getSize() {
        return file.length();
    }

    public String getAbsolutePath() {
        return file.getAbsolutePath();
    }

    /**
     * Returns a synchronous access handle. Per the OPFS specification, only one
     * sync access handle may be open for a given file at a time; this is enforced
     * by {@link FileSystemSyncAccessHandle} via a process-local lock map.
     */
    public FileSystemSyncAccessHandle createSyncAccessHandle() throws IOException {
        return FileSystemSyncAccessHandle.open(file);
    }

    /**
     * Returns a writable file stream.
     *
     * @param keepExistingData if {@code false}, the file is truncated on open
     *                         (matches {@code FileSystemCreateWritableOptions.keepExistingData}).
     */
    public FileSystemWritableFileStream createWritable(boolean keepExistingData) throws IOException {
        return FileSystemWritableFileStream.open(file, keepExistingData);
    }
}
