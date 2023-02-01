'use strict';

var WebSqlPouchCore = require('./pouchdb-web-core').default;
import { openOrCreate } from '@nativescript-community/sqlite';
import { knownFolders, path } from '@nativescript/core';

function WebSQLRows(array) {
  this._array = array;
  this.length = array.length;
}

WebSQLRows.prototype.item = function (i) {
  return this._array[i];
};

function WebSQLResultSet(insertId, rowsAffected, rows) {
  this.insertId = insertId;
  this.rowsAffected = rowsAffected;
  this.rows = new WebSQLRows(rows);
}

function createOpenDBFunction(opts) {
  return function (name, version, description, size) {
    // The SQLite Plugin started deviating pretty heavily from the
    // standard openDatabase() function, as they started adding more features.
    // It's better to just use their "new" format and pass in a big ol'
    // options object. Also there are many options here that may come from
    // the PouchDB constructor, so we have to grab those.
    var openOpts = Object.assign({}, opts, {
      name: name,
      version: version,
      description: description,
      size: size,
    });
    function onError(err) {
      console.error(err);
      if (typeof opts.onError === 'function') {
        opts.onError(err);
      }
    }

    console.log('Opening ', openOpts.name);

    const db = openOrCreate(path.join(knownFolders.documents().getFolder('db').path, `${openOpts.name}.sqlite`), {
      transformBlobs: true,
    });

    return db;
  };
}

function NativescriptSQLitePouch(opts, callback) {
  var websql = createOpenDBFunction(opts);
  var _opts = Object.assign(
    {
      websql: websql,
    },
    opts
  );

  WebSqlPouchCore.call(this, _opts, callback);
}

NativescriptSQLitePouch.valid = function () {
  return true;
};

// no need for a prefix in ReactNative (i.e. no need for `_pouch_` prefix
NativescriptSQLitePouch.use_prefix = false;

function nativescriptSqlitePlugin(PouchDB) {
  PouchDB.adapter('nativescript-sqlite', NativescriptSQLitePouch, true);
}

export function createPlugin() {
  return nativescriptSqlitePlugin;
}
