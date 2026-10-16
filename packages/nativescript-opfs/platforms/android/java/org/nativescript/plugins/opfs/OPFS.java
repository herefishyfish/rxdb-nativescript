package org.nativescript.plugins.opfs;

import android.content.Context;

import java.io.File;
import java.io.IOException;

/**
 * Entry point for the Origin Private File System (OPFS) on Android.
 *
 * Mirrors the web platform's {@code navigator.storage.getDirectory()} entry point.
 * The "origin private" root is materialised as a private directory under
 * {@link Context#getFilesDir()} so that data is sandboxed to the application
 * and removed when the app is uninstalled, matching the spirit of the web spec.
 *
 * Public Java API (web-spec aligned):
 *   - {@link #getDirectory(Context)} returns the root {@link FileSystemDirectoryHandle}.
 *   - {@link FileSystemDirectoryHandle} exposes getFileHandle / getDirectoryHandle / removeEntry.
 *   - {@link FileSystemFileHandle} exposes getFile / createSyncAccessHandle / createWritable.
 *   - {@link FileSystemSyncAccessHandle} exposes synchronous read / write / truncate / flush / close.
 *   - {@link FileSystemWritableFileStream} exposes write / seek / truncate / close.
 */
public final class OPFS {
    private static final String ROOT_DIR_NAME = "opfs-root";

    private OPFS() {}

    /**
     * Returns the root directory handle for the origin's private file system.
     *
     * @param context any valid Android context (the application context is preferred)
     * @return the root {@link FileSystemDirectoryHandle}
     */
    public static FileSystemDirectoryHandle getDirectory(Context context) throws IOException {
        if (context == null) {
            throw new IllegalArgumentException("context must not be null");
        }
        File root = new File(context.getFilesDir(), ROOT_DIR_NAME);
        if (!root.exists() && !root.mkdirs()) {
            throw new IOException("Unable to create OPFS root directory: " + root.getAbsolutePath());
        }
        if (!root.isDirectory()) {
            throw new IOException("OPFS root path exists and is not a directory: " + root.getAbsolutePath());
        }
        return new FileSystemDirectoryHandle(root, "");
    }
}
