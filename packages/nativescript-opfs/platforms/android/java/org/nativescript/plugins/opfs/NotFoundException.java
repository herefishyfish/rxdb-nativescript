package org.nativescript.plugins.opfs;

import java.io.IOException;

/** Mirrors the web {@code NotFoundError} DOMException. */
public class NotFoundException extends IOException {
    public NotFoundException(String message) {
        super(message);
    }
}
