import '@valor/nativescript-websockets';

// Replaces the Node `ws` package that rxdb's websocket/graphql replication imports.
export const WebSocket = (globalThis as any).WebSocket;
export default WebSocket;
