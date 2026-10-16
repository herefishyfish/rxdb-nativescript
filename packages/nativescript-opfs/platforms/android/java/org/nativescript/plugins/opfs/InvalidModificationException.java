package org.nativescript.plugins.opfs;

import java.io.IOException;

/** Mirrors the web {@code InvalidModificationError} DOMException. */
public class InvalidModificationException extends IOException {
    public InvalidModificationException(String message) {
        super(message);
    }
}
