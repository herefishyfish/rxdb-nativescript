# @herefishyfish/nativescript-rxdb

```javascript
npm i @herefishyfish/nativescript-rxdb
```

Thin wrappers for RxDB compatibility with NativeScript. Installing it is enough; its webpack hook aliases:

- `broadcast-channel` to its browser build
- `ws` to a global `WebSocket` (via `@valor/nativescript-websockets`) for websocket/GraphQL replication
- `unload` to a NativeScript `Application` exit listener

If you use websocket/GraphQL replication, also import the package once at startup so `WebSocket` is global:

```ts
import '@herefishyfish/nativescript-rxdb';
```

`crypto.subtle` and `crypto.randomUUID` come from `@nativescript/core` 8.9+, so no extra polyfills are needed.

See RxDB docs for more info on how to use RxDB.

## License

Apache License Version 2.0
