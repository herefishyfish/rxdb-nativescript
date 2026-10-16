/**
 * Type entry for @herefishyfish/nativescript-opfs.
 *
 * The actual implementation is selected at build time by NativeScript webpack
 * from `index.android.ts` / `index.ios.ts`. Both implementations export the
 * same surface declared here.
 */
export * from './common';

export declare function installOPFSPolyfill(): void;
export declare function getOPFSRoot(): Promise<import('./common').OPFSDirectoryHandle>;
