package org.nativescript.plugins.opfs;

/**
 * Common base class for {@link FileSystemFileHandle} and {@link FileSystemDirectoryHandle}.
 * Mirrors the web {@code FileSystemHandle} interface.
 */
public abstract class FileSystemHandle {
    /** "file" or "directory", matching the web spec's {@code kind} property. */
    public static final String KIND_FILE = "file";
    public static final String KIND_DIRECTORY = "directory";

    protected final String name;
    protected final String kind;

    protected FileSystemHandle(String name, String kind) {
        this.name = name;
        this.kind = kind;
    }

    public String getName() {
        return name;
    }

    public String getKind() {
        return kind;
    }

    public boolean isFile() {
        return KIND_FILE.equals(kind);
    }

    public boolean isDirectory() {
        return KIND_DIRECTORY.equals(kind);
    }
}
