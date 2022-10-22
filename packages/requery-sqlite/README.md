# Nativescript: Requery Sqlite

[![npm](https://img.shields.io/npm/v/@akylas/nativescript-sqlite.svg)](https://www.npmjs.com/package/@akylas/nativescript-sqlite)
[![npm](https://img.shields.io/npm/dt/@akylas/nativescript-sqlite.svg?label=npm%20downloads)](https://www.npmjs.com/package/@akylas/nativescript-sqlite)

Fork of the @nativescript-community/sqlite package to use the requery SQLite implementation which supports modern android SQLite features.

## Installation

```
npm i @herefishyfish/requery-sqlite
```

## Usage

You should take care of wrapping sqlite calls to your preferred async option (promises, observables, async/await). And catch any exceptions thrown.

```typescript
import { openOrCreate, deleteDatabase } from "@herefishyfish/requery-sqlite";

const sqlite = openOrCreate("path/to/db");
sqlite.execute("CREATE TABLE names (id INT, name TEXT)");
sqlite.transaction(cancelTransaction => {
    // Calling cancelTransaction will rollback all changes made to db
    names.forEach((name, id) =>
        sqlite.execute(
            "INSERT INTO names (id, name) VALUES (?, ?)",
            [id, name]
        )
    );
});
```
