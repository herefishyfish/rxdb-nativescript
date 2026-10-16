package org.nativescript.plugins.opfs;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Mirrors the web platform's {@code FileSystemDirectoryHandle}.
 *
 * Provides:
 *   - {@link #getFileHandle(String, boolean)}
 *   - {@link #getDirectoryHandle(String, boolean)}
 *   - {@link #removeEntry(String, boolean)}
 *   - {@link #entries()} (returns a snapshot list of children)
 *   - {@link #resolve(FileSystemHandle)} (returns a path or null)
 */
public final class FileSystemDirectoryHandle extends FileSystemHandle {
    /**
     * Names of files/directories are restricted to the same set the web spec
     * allows: no path separators, no NUL, no "." / "..".
     */
    private static final Pattern INVALID_NAME = Pattern.compile("[\\\\/\\u0000]");

    private final File dir;

    FileSystemDirectoryHandle(File dir, String name) {
        super(name, KIND_DIRECTORY);
        this.dir = dir;
    }

    /** Absolute path on disk; intended for the JS bridge layer, not for end users. */
    public String getAbsolutePath() {
        return dir.getAbsolutePath();
    }

    public FileSystemFileHandle getFileHandle(String name, boolean create) throws IOException {
        validateName(name);
        File child = new File(dir, name);
        if (child.exists()) {
            if (child.isDirectory()) {
                throw new TypeMismatchException("Entry '" + name + "' exists and is a directory.");
            }
            return new FileSystemFileHandle(child, name);
        }
        if (!create) {
            throw new NotFoundException("File '" + name + "' was not found.");
        }
        if (!child.createNewFile()) {
            throw new IOException("Unable to create file: " + child.getAbsolutePath());
        }
        return new FileSystemFileHandle(child, name);
    }

    public FileSystemDirectoryHandle getDirectoryHandle(String name, boolean create) throws IOException {
        validateName(name);
        File child = new File(dir, name);
        if (child.exists()) {
            if (!child.isDirectory()) {
                throw new TypeMismatchException("Entry '" + name + "' exists and is not a directory.");
            }
            return new FileSystemDirectoryHandle(child, name);
        }
        if (!create) {
            throw new NotFoundException("Directory '" + name + "' was not found.");
        }
        if (!child.mkdirs()) {
            throw new IOException("Unable to create directory: " + child.getAbsolutePath());
        }
        return new FileSystemDirectoryHandle(child, name);
    }

    public void removeEntry(String name, boolean recursive) throws IOException {
        validateName(name);
        File child = new File(dir, name);
        if (!child.exists()) {
            throw new NotFoundException("Entry '" + name + "' was not found.");
        }
        if (child.isDirectory()) {
            String[] contents = child.list();
            if (contents != null && contents.length > 0 && !recursive) {
                throw new InvalidModificationException(
                        "Directory '" + name + "' is not empty and recursive=false.");
            }
            deleteRecursively(child);
        } else {
            if (!child.delete()) {
                throw new IOException("Unable to delete file: " + child.getAbsolutePath());
            }
        }
    }

    /**
     * Snapshot of the directory contents. Each entry is either a
     * {@link FileSystemFileHandle} or a {@link FileSystemDirectoryHandle}.
     */
    public List<FileSystemHandle> entries() {
        File[] children = dir.listFiles();
        if (children == null) {
            return Collections.emptyList();
        }
        List<FileSystemHandle> out = new ArrayList<>(children.length);
        for (File c : children) {
            if (c.isDirectory()) {
                out.add(new FileSystemDirectoryHandle(c, c.getName()));
            } else {
                out.add(new FileSystemFileHandle(c, c.getName()));
            }
        }
        return out;
    }

    /**
     * Returns the slash-separated relative path from this directory to
     * {@code possibleDescendant}, or {@code null} if it is not a descendant.
     */
    public String[] resolve(FileSystemHandle possibleDescendant) throws IOException {
        File target;
        if (possibleDescendant instanceof FileSystemDirectoryHandle) {
            target = ((FileSystemDirectoryHandle) possibleDescendant).dir;
        } else if (possibleDescendant instanceof FileSystemFileHandle) {
            target = ((FileSystemFileHandle) possibleDescendant).getFile();
        } else {
            return null;
        }
        String basePath = dir.getCanonicalPath();
        String targetPath = target.getCanonicalPath();
        if (basePath.equals(targetPath)) {
            return new String[0];
        }
        String prefix = basePath.endsWith(File.separator) ? basePath : basePath + File.separator;
        if (!targetPath.startsWith(prefix)) {
            return null;
        }
        String rel = targetPath.substring(prefix.length());
        return rel.split(Pattern.quote(File.separator));
    }

    private static void validateName(String name) {
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("name must not be empty");
        }
        if (".".equals(name) || "..".equals(name) || INVALID_NAME.matcher(name).find()) {
            throw new IllegalArgumentException("Invalid name: " + name);
        }
    }

    private static void deleteRecursively(File f) throws IOException {
        if (f.isDirectory()) {
            File[] children = f.listFiles();
            if (children != null) {
                for (File c : children) {
                    deleteRecursively(c);
                }
            }
        }
        if (!f.delete()) {
            throw new IOException("Unable to delete: " + f.getAbsolutePath());
        }
    }
}
