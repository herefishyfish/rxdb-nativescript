package org.nativescript.plugins.opfs;

/** Mirrors the web {@code InvalidStateError} DOMException. Unchecked to match JS semantics. */
public class InvalidStateException extends RuntimeException {
    public InvalidStateException(String message) {
        super(message);
    }
}
