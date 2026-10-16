package org.nativescript.plugins.opfs;

import java.io.IOException;

/** Mirrors the web {@code TypeMismatchError} DOMException. */
public class TypeMismatchException extends IOException {
    public TypeMismatchException(String message) {
        super(message);
    }
}
