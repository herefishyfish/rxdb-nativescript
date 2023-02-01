import { clone, pick, filterChange, hasLocalStorage, changesHandler as Changes, toPromise } from 'pouchdb-utils';
import { isDeleted, isLocalId } from 'pouchdb-adapter-utils';
import { collectConflicts, traverseRevTree, latest as getLatest } from 'pouchdb-merge';
import { safeJsonParse, safeJsonStringify } from 'pouchdb-json';
import { binaryStringToBlobOrBuffer as binStringToBlob, btoa } from 'pouchdb-binary-utils';

import parseHexString from './parseHex';
import websqlBulkDocs from './bulkDocs';

import { MISSING_DOC, REV_CONFLICT, createError } from 'pouchdb-errors';

import { ADAPTER_VERSION, DOC_STORE, BY_SEQ_STORE, ATTACH_STORE, LOCAL_STORE, META_STORE, ATTACH_AND_SEQ_STORE } from './constants';

import { qMarks, stringifyDoc, unstringifyDoc, select, compactRevs, websqlError, getSize, unescapeBlob, uuid } from './utils';

import openDB from './openDatabase';

var websqlChanges = new Changes();

function fetchAttachmentsIfNecessary(doc, opts, api, txn, cb) {
  var attachments = Object.keys(doc._attachments || {});
  if (!attachments.length) {
    return cb && cb();
  }
  var numDone = 0;

  function checkDone() {
    if (++numDone === attachments.length && cb) {
      cb();
    }
  }

  function fetchAttachment(doc, att) {
    var attObj = doc._attachments[att];
    var attOpts = { binary: opts.binary, ctx: txn };
    api._getAttachment(doc._id, att, attObj, attOpts, function (_, data) {
      doc._attachments[att] = Object.assign(pick(attObj, ['digest', 'content_type']), { data: data });

      checkDone();
    });
  }

  attachments.forEach(function (att) {
    if (opts.attachments && opts.include_docs) {
      fetchAttachment(doc, att);
    } else {
      doc._attachments[att].stub = true;
      checkDone();
    }
  });
}

var POUCH_VERSION = 1;

// these indexes cover the ground for most allDocs queries
var BY_SEQ_STORE_DELETED_INDEX_SQL = "CREATE INDEX IF NOT EXISTS 'by-seq-deleted-idx' ON " + BY_SEQ_STORE + ' (seq, deleted)';
var BY_SEQ_STORE_DOC_ID_REV_INDEX_SQL = "CREATE UNIQUE INDEX IF NOT EXISTS 'by-seq-doc-id-rev' ON " + BY_SEQ_STORE + ' (doc_id, rev)';
var DOC_STORE_WINNINGSEQ_INDEX_SQL = "CREATE INDEX IF NOT EXISTS 'doc-winningseq-idx' ON " + DOC_STORE + ' (winningseq)';
var ATTACH_AND_SEQ_STORE_SEQ_INDEX_SQL = "CREATE INDEX IF NOT EXISTS 'attach-seq-seq-idx' ON " + ATTACH_AND_SEQ_STORE + ' (seq)';
var ATTACH_AND_SEQ_STORE_ATTACH_INDEX_SQL = "CREATE UNIQUE INDEX IF NOT EXISTS 'attach-seq-digest-idx' ON " + ATTACH_AND_SEQ_STORE + ' (digest, seq)';

var DOC_STORE_AND_BY_SEQ_JOINER = BY_SEQ_STORE + '.seq = ' + DOC_STORE + '.winningseq';

var SELECT_DOCS = BY_SEQ_STORE + '.seq AS seq, ' + BY_SEQ_STORE + '.deleted AS deleted, ' + BY_SEQ_STORE + '.json AS data, ' + BY_SEQ_STORE + '.rev AS rev, ' + DOC_STORE + '.json AS metadata';

function WebSqlPouch(opts, callback) {
  var api = this;
  var instanceId = null;
  var size = getSize(opts);
  var idRequests = [];
  var encoding;

  api._name = opts.name;

  // extend the options here, because sqlite plugin has a ton of options
  // and they are constantly changing, so it's more prudent to allow anything
  var websqlOpts = Object.assign({}, opts, {
    version: POUCH_VERSION,
    description: opts.name,
    size: size,
  });
  var openDBResult = openDB(websqlOpts);
  if (openDBResult.error) {
    return websqlError(callback)(openDBResult.error);
  }
  var db = openDBResult.db;
  if (typeof db.readTransaction !== 'function') {
    // doesn't exist in sqlite plugin
    // nested transactions don't work in iOS, really not required.
    const fn = async (callback) => {
      return await callback();
    };
    db.readTransaction = fn;
  }

  function dbCreated() {
    // note the db name in case the browser upgrades to idb
    if (hasLocalStorage()) {
      window.localStorage['_pouch__websqldb_' + api._name] = true;
    }
    callback(null, api);
  }

  // In this migration, we added the 'deleted' and 'local' columns to the
  // by-seq and doc store tables.
  // To preserve existing user data, we re-process all the existing JSON
  // and add these values.
  // Called migration2 because it corresponds to adapter version (db_version) #2
  function runMigration2(tx, callback) {
    // index used for the join in the allDocs query
    dbExecuteSql(DOC_STORE_WINNINGSEQ_INDEX_SQL);

    dbExecuteSql('ALTER TABLE ' + BY_SEQ_STORE + ' ADD COLUMN deleted TINYINT(1) DEFAULT 0', [], function () {
      dbExecuteSql(BY_SEQ_STORE_DELETED_INDEX_SQL);
      dbExecuteSql('ALTER TABLE ' + DOC_STORE + ' ADD COLUMN local TINYINT(1) DEFAULT 0', [], function () {
        dbExecuteSql("CREATE INDEX IF NOT EXISTS 'doc-store-local-idx' ON " + DOC_STORE + ' (local, id)');

        var sql = 'SELECT ' + DOC_STORE + '.winningseq AS seq, ' + DOC_STORE + '.json AS metadata FROM ' + BY_SEQ_STORE + ' JOIN ' + DOC_STORE + ' ON ' + BY_SEQ_STORE + '.seq = ' + DOC_STORE + '.winningseq';

        dbExecuteSql(sql, [], function (tx, result) {
          var deleted = [];
          var local = [];

          for (var i = 0; i < result.length; i++) {
            var item = result[i];
            var seq = item.seq;
            var metadata = JSON.parse(item.metadata);
            if (isDeleted(metadata)) {
              deleted.push(seq);
            }
            if (isLocalId(metadata.id)) {
              local.push(metadata.id);
            }
          }
          dbExecuteSql('UPDATE ' + DOC_STORE + 'SET local = 1 WHERE id IN ' + qMarks(local.length), local, function () {
            dbExecuteSql('UPDATE ' + BY_SEQ_STORE + ' SET deleted = 1 WHERE seq IN ' + qMarks(deleted.length), deleted, callback);
          });
        });
      });
    });
  }

  // in this migration, we make all the local docs unversioned
  function runMigration3(tx, callback) {
    var local = 'CREATE TABLE IF NOT EXISTS ' + LOCAL_STORE + ' (id UNIQUE, rev, json)';
    dbExecuteSql(local, [], function () {
      var sql = 'SELECT ' + DOC_STORE + '.id AS id, ' + BY_SEQ_STORE + '.json AS data ' + 'FROM ' + BY_SEQ_STORE + ' JOIN ' + DOC_STORE + ' ON ' + BY_SEQ_STORE + '.seq = ' + DOC_STORE + '.winningseq WHERE local = 1';
      dbExecuteSql(sql, [], function (tx, res) {
        var rows = [];
        for (var i = 0; i < res.length; i++) {
          rows.push(res[i]);
        }
        function doNext() {
          if (!rows.length) {
            return callback(tx);
          }
          var row = rows.shift();
          var rev = JSON.parse(row.data)._rev;
          dbExecuteSql('INSERT INTO ' + LOCAL_STORE + ' (id, rev, json) VALUES (?,?,?)', [row.id, rev, row.data], function (tx) {
            dbExecuteSql('DELETE FROM ' + DOC_STORE + ' WHERE id=?', [row.id], function (tx) {
              dbExecuteSql('DELETE FROM ' + BY_SEQ_STORE + ' WHERE seq=?', [row.seq], function () {
                doNext();
              });
            });
          });
        }
        doNext();
      });
    });
  }

  // in this migration, we remove doc_id_rev and just use rev
  function runMigration4(tx, callback) {
    function updateRows(rows) {
      function doNext() {
        if (!rows.length) {
          return callback(tx);
        }
        var row = rows.shift();
        var doc_id_rev = parseHexString(row.hex, encoding);
        var idx = doc_id_rev.lastIndexOf('::');
        var doc_id = doc_id_rev.substring(0, idx);
        var rev = doc_id_rev.substring(idx + 2);
        var sql = 'UPDATE ' + BY_SEQ_STORE + ' SET doc_id=?, rev=? WHERE doc_id_rev=?';
        dbExecuteSql(sql, [doc_id, rev, doc_id_rev], function () {
          doNext();
        });
      }
      doNext();
    }

    var sql = 'ALTER TABLE ' + BY_SEQ_STORE + ' ADD COLUMN doc_id';
    dbExecuteSql(sql, [], function (tx) {
      var sql = 'ALTER TABLE ' + BY_SEQ_STORE + ' ADD COLUMN rev';
      dbExecuteSql(sql, [], function (tx) {
        dbExecuteSql(BY_SEQ_STORE_DOC_ID_REV_INDEX_SQL, [], function (tx) {
          var sql = 'SELECT hex(doc_id_rev) as hex FROM ' + BY_SEQ_STORE;
          dbExecuteSql(sql, [], function (tx, res) {
            var rows = [];
            for (var i = 0; i < res.length; i++) {
              rows.push(res[i]);
            }
            updateRows(rows);
          });
        });
      });
    });
  }

  // in this migration, we add the attach_and_seq table
  // for issue #2818
  function runMigration5(tx, callback) {
    function migrateAttsAndSeqs(tx) {
      // need to actually populate the table. this is the expensive part,
      // so as an optimization, check first that this database even
      // contains attachments
      var sql = 'SELECT COUNT(*) AS cnt FROM ' + ATTACH_STORE;
      dbExecuteSql(sql, [], function (tx, res) {
        var count = res[0].cnt;
        if (!count) {
          return callback(tx);
        }

        var offset = 0;
        var pageSize = 10;
        function nextPage() {
          var sql = select(SELECT_DOCS + ', ' + DOC_STORE + '.id AS id', [DOC_STORE, BY_SEQ_STORE], DOC_STORE_AND_BY_SEQ_JOINER, null, DOC_STORE + '.id ');
          sql += ' LIMIT ' + pageSize + ' OFFSET ' + offset;
          offset += pageSize;
          dbExecuteSql(sql, [], function (tx, res) {
            if (!res.length) {
              return callback(tx);
            }
            var digestSeqs = {};
            function addDigestSeq(digest, seq) {
              // uniq digest/seq pairs, just in case there are dups
              var seqs = (digestSeqs[digest] = digestSeqs[digest] || []);
              if (seqs.indexOf(seq) === -1) {
                seqs.push(seq);
              }
            }
            for (var i = 0; i < res.length; i++) {
              var row = res[i];
              var doc = unstringifyDoc(row.data, row.id, row.rev);
              var atts = Object.keys(doc._attachments || {});
              for (var j = 0; j < atts.length; j++) {
                var att = doc._attachments[atts[j]];
                addDigestSeq(att.digest, row.seq);
              }
            }
            var digestSeqPairs = [];
            Object.keys(digestSeqs).forEach(function (digest) {
              var seqs = digestSeqs[digest];
              seqs.forEach(function (seq) {
                digestSeqPairs.push([digest, seq]);
              });
            });
            if (!digestSeqPairs.length) {
              return nextPage();
            }
            var numDone = 0;
            digestSeqPairs.forEach(function (pair) {
              var sql = 'INSERT INTO ' + ATTACH_AND_SEQ_STORE + ' (digest, seq) VALUES (?,?)';
              dbExecuteSql(sql, pair, function () {
                if (++numDone === digestSeqPairs.length) {
                  nextPage();
                }
              });
            });
          });
        }
        nextPage();
      });
    }

    var attachAndRev = 'CREATE TABLE IF NOT EXISTS ' + ATTACH_AND_SEQ_STORE + ' (digest, seq INTEGER)';
    dbExecuteSql(attachAndRev, [], function (tx) {
      dbExecuteSql(ATTACH_AND_SEQ_STORE_ATTACH_INDEX_SQL, [], function (tx) {
        dbExecuteSql(ATTACH_AND_SEQ_STORE_SEQ_INDEX_SQL, [], migrateAttsAndSeqs);
      });
    });
  }

  // in this migration, we use escapeBlob() and unescapeBlob()
  // instead of reading out the binary as HEX, which is slow
  function runMigration6(tx, callback) {
    var sql = 'ALTER TABLE ' + ATTACH_STORE + ' ADD COLUMN escaped TINYINT(1) DEFAULT 0';
    dbExecuteSql(sql, [], callback);
  }

  // issue #3136, in this migration we need a "latest seq" as well
  // as the "winning seq" in the doc store
  function runMigration7(tx, callback) {
    var sql = 'ALTER TABLE ' + DOC_STORE + ' ADD COLUMN max_seq INTEGER';
    dbExecuteSql(sql, [], function (tx) {
      var sql = 'UPDATE ' + DOC_STORE + ' SET max_seq=(SELECT MAX(seq) FROM ' + BY_SEQ_STORE + ' WHERE doc_id=id)';
      dbExecuteSql(sql, [], function (tx) {
        // add unique index after filling, else we'll get a constraint
        // error when we do the ALTER TABLE
        var sql = "CREATE UNIQUE INDEX IF NOT EXISTS 'doc-max-seq-idx' ON " + DOC_STORE + ' (max_seq)';
        dbExecuteSql(sql, [], callback);
      });
    });
  }

  function checkEncoding(tx, cb) {
    // UTF-8 on chrome/android, UTF-16 on safari < 7.1
    db.select('SELECT HEX("a") AS hex', []).then((res) => {
      var hex = res[0].hex;
      encoding = hex.length === 2 ? 'UTF-8' : 'UTF-16';
      cb();
    });
  }

  function onGetInstanceId() {
    while (idRequests.length > 0) {
      var idCallback = idRequests.pop();
      idCallback(null, instanceId);
    }
  }

  function onGetVersion(tx, dbVersion) {
    if (dbVersion === 0) {
      // initial schema

      var meta = 'CREATE TABLE IF NOT EXISTS ' + META_STORE + ' (dbid, db_version INTEGER)';
      var attach = 'CREATE TABLE IF NOT EXISTS ' + ATTACH_STORE + ' (digest UNIQUE, escaped TINYINT(1), body BLOB)';
      var attachAndRev = 'CREATE TABLE IF NOT EXISTS ' + ATTACH_AND_SEQ_STORE + ' (digest, seq INTEGER)';
      // TODO: migrate winningseq to INTEGER
      var doc = 'CREATE TABLE IF NOT EXISTS ' + DOC_STORE + ' (id unique, json, winningseq, max_seq INTEGER UNIQUE)';
      var seq = 'CREATE TABLE IF NOT EXISTS ' + BY_SEQ_STORE + ' (seq INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' + 'json, deleted TINYINT(1), doc_id, rev)';
      var local = 'CREATE TABLE IF NOT EXISTS ' + LOCAL_STORE + ' (id UNIQUE, rev, json)';

      // creates
      db.execute(attach);
      db.execute(local);
      db.execute(attachAndRev).then(() => {
        db.execute(ATTACH_AND_SEQ_STORE_SEQ_INDEX_SQL);
        db.execute(ATTACH_AND_SEQ_STORE_ATTACH_INDEX_SQL);
      });
      db.execute(doc).then(() => {
        db.execute(DOC_STORE_WINNINGSEQ_INDEX_SQL);
        db.execute(seq).then(() => {
          db.execute(BY_SEQ_STORE_DELETED_INDEX_SQL);
          db.execute(BY_SEQ_STORE_DOC_ID_REV_INDEX_SQL);
          db.execute(meta).then((result) => {
            // mark the db version, and new dbid
            var initSeq = 'INSERT INTO ' + META_STORE + ' (db_version, dbid) VALUES (?,?)';
            instanceId = uuid();
            var initSeqArgs = [ADAPTER_VERSION, instanceId];
            db.execute(initSeq, initSeqArgs).then((result) => {
              onGetInstanceId();
            });
          });
        });
      });
    } else {
      // version > 0

      var setupDone = function () {
        var migrated = dbVersion < ADAPTER_VERSION;
        if (migrated) {
          // update the db version within this transaction
          db.execute('UPDATE ' + META_STORE + ' SET db_version = ' + ADAPTER_VERSION);
        }
        // notify db.id() callers
        var sql = 'SELECT dbid FROM ' + META_STORE;
        db.select(sql).then((result) => {
          instanceId = result[0].dbid;
          onGetInstanceId();
        });
      };

      // would love to use promises here, but then websql
      // ends the transaction early
      var tasks = [runMigration2, runMigration3, runMigration4, runMigration5, runMigration6, runMigration7, setupDone];

      // run each migration sequentially
      var i = dbVersion;
      var nextMigration = function (tx) {
        try {
          tasks[i - 1](tx, nextMigration);
          i++;
        } catch (err) {}
      };
      nextMigration(tx);
    }
  }

  function setup() {
    db.transaction((cancelTransaction) => {
      // first check the encoding
      checkEncoding(db, () => {
        // then get the version
        fetchVersion(db);
      });
    })
      .catch(websqlError(callback))
      .then(() => {
        dbCreated();
      });
  }

  function fetchVersion(tx) {
    var sql = 'SELECT sql FROM sqlite_master WHERE tbl_name = ' + META_STORE;

    db.select(sql).then((result) => {
      if (result?.length == 0 || !result) {
        onGetVersion(db, 0);
      } else if (!/db_version/.test(result[0]?.sql)) {
        // so add it.
        db.execute('ALTER TABLE ' + META_STORE + ' ADD COLUMN db_version INTEGER', []).then(() => {
          // before version 2, this column didn't even exist
          onGetVersion(db, 1);
        });
      } else {
        //
        db.select('SELECT db_version FROM ' + META_STORE, []).then((result) => {
          var dbVersion = result[0].db_version;
          onGetVersion(db, dbVersion);
        });
      }
    });
  }

  setup();

  function getMaxSeq(tx, callback) {
    var sql = 'SELECT MAX(seq) AS seq FROM ' + BY_SEQ_STORE;
    db.select(sql, []).then((res) => {
      var updateSeq = res[0].seq || 0;
      callback(updateSeq);
    });
  }

  function countDocs(tx, callback) {
    // count the total rows
    var sql = select('COUNT(' + DOC_STORE + ".id) AS 'num'", [DOC_STORE, BY_SEQ_STORE], DOC_STORE_AND_BY_SEQ_JOINER, BY_SEQ_STORE + '.deleted=0');

    // callback((await DATABASE.select(sql))[0].num);
    tx.select(sql).then((result) => {
      callback(result[0].num);
    });
  }

  api._remote = false;
  api.type = function () {
    return 'websql';
  };

  api._id = toPromise(function (callback) {
    callback(null, instanceId);
  });

  api._info = function (callback) {
    var seq;
    var docCount;
    // try {
    db.readTransaction(() => {
      getMaxSeq(db, function (theSeq) {
        seq = theSeq;
      });
      countDocs(db, (theDocCount) => {
        docCount = theDocCount;
      });
    })
      .catch(websqlError(callback))
      .then(() => {
        callback(null, {
          doc_count: docCount,
          update_seq: seq,
          websql_encoding: encoding,
        });
      });

    // catch (error) {
    // }
  };

  api._bulkDocs = function (req, reqOpts, callback) {
    websqlBulkDocs(opts, req, reqOpts, api, db, websqlChanges, callback);
  };

  function latest(tx, id, rev, callback, finish) {
    var sql = select(SELECT_DOCS, [DOC_STORE, BY_SEQ_STORE], DOC_STORE_AND_BY_SEQ_JOINER, DOC_STORE + '.id=?');
    var sqlArgs = [id];

    db.select(sql, sqlArgs).then((results) => {
      if (!results.length) {
        var err = createError(MISSING_DOC, 'missing');
        return finish(err);
      }
      var item = results[0];
      var metadata = safeJsonParse(item.metadata);
      callback(getLatest(rev, metadata));
    });
  }

  api._get = function (id, opts, callback) {
    var doc;
    var metadata;
    var tx = opts.ctx;
    if (!tx) {
      return db.readTransaction(() => {
        api._get(id, Object.assign({ ctx: db }, opts), callback);
      });
    }

    function finish(err) {
      callback(err, { doc: doc, metadata: metadata, ctx: tx });
    }

    var sql;
    var sqlArgs;

    if (!opts.rev) {
      sql = select(SELECT_DOCS, [DOC_STORE, BY_SEQ_STORE], DOC_STORE_AND_BY_SEQ_JOINER, DOC_STORE + '.id=?');
      sqlArgs = [id];
    } else if (opts.latest) {
      latest(
        tx,
        id,
        opts.rev,
        function (latestRev) {
          opts.latest = false;
          opts.rev = latestRev;
          api._get(id, opts, callback);
        },
        finish
      );
      return;
    } else {
      sql = select(SELECT_DOCS, [DOC_STORE, BY_SEQ_STORE], DOC_STORE + '.id=' + BY_SEQ_STORE + '.doc_id', [BY_SEQ_STORE + '.doc_id=?', BY_SEQ_STORE + '.rev=?']);
      sqlArgs = [id, opts.rev];
    }

    db.select(sql, sqlArgs).then((results) => {
      if (!results.length) {
        var missingErr = createError(MISSING_DOC, 'missing');
        return finish(missingErr);
      }
      var item = results[0];
      metadata = safeJsonParse(item.metadata);
      if (item.deleted && !opts.rev) {
        var deletedErr = createError(MISSING_DOC, 'deleted');
        return finish(deletedErr);
      }
      doc = unstringifyDoc(item.data, metadata.id, item.rev);
      finish();
    });
  };

  api._allDocs = function (opts, callback) {
    var results = [];
    var totalRows;
    var updateSeq;

    var start = 'startkey' in opts ? opts.startkey : false;
    var end = 'endkey' in opts ? opts.endkey : false;
    var key = 'key' in opts ? opts.key : false;
    var keys = 'keys' in opts ? opts.keys : false;
    var descending = 'descending' in opts ? opts.descending : false;
    var limit = 'limit' in opts ? opts.limit : -1;
    var offset = 'skip' in opts ? opts.skip : 0;
    var inclusiveEnd = opts.inclusive_end !== false;

    var sqlArgs = [];
    var criteria = [];
    var keyChunks = [];
    if (keys) {
      var destinctKeys = [];
      keys.forEach(function (key) {
        if (destinctKeys.indexOf(key) === -1) {
          destinctKeys.push(key);
        }
      });

      for (var index = 0; index < destinctKeys.length; index += 999) {
        var chunk = destinctKeys.slice(index, index + 999);
        if (chunk.length > 0) {
          keyChunks.push(chunk);
        }
      }
    } else if (key !== false) {
      criteria.push(DOC_STORE + '.id = ?');
      sqlArgs.push(key);
    } else if (start !== false || end !== false) {
      if (start !== false) {
        criteria.push(DOC_STORE + '.id ' + (descending ? '<=' : '>=') + ' ?');
        sqlArgs.push(start);
      }
      if (end !== false) {
        var comparator = descending ? '>' : '<';
        if (inclusiveEnd) {
          comparator += '=';
        }
        criteria.push(DOC_STORE + '.id ' + comparator + ' ?');
        sqlArgs.push(end);
      }
      if (key !== false) {
        criteria.push(DOC_STORE + '.id = ?');
        sqlArgs.push(key);
      }
    }

    if (!keys) {
      // report deleted if keys are specified
      criteria.push(BY_SEQ_STORE + '.deleted = 0');
    }

    db.readTransaction(() => {
      // count the docs in parallel to other operations
      countDocs(db, (docCount) => {
        totalRows = docCount;
      });

      /* istanbul ignore if */
      if (opts.update_seq) {
        // get max sequence in parallel to other operations
        getMaxSeq(db, function (theSeq) {
          updateSeq = theSeq;
        });
      }

      if (limit === 0) {
        return;
      }

      if (keys) {
        var finishedCount = 0;
        var allRows = [];
        keyChunks.forEach(function (keyChunk) {
          sqlArgs = [];
          criteria = [];
          var bindingStr = '';
          keyChunk.forEach(function () {
            bindingStr += '?,';
          });
          bindingStr = bindingStr.substring(0, bindingStr.length - 1); // keys is never empty
          criteria.push(DOC_STORE + '.id IN (' + bindingStr + ')');
          sqlArgs = sqlArgs.concat(keyChunk);

          var sql = select(SELECT_DOCS, [DOC_STORE, BY_SEQ_STORE], DOC_STORE_AND_BY_SEQ_JOINER, criteria, DOC_STORE + '.id ' + (descending ? 'DESC' : 'ASC'));
          sql += ' LIMIT ' + limit + ' OFFSET ' + offset;
          db.select(sql, sqlArgs).then((result) => {
            finishedCount++;
            for (var index = 0; index < result.length; index++) {
              allRows.push(result[index]);
            }
            if (finishedCount === keyChunks.length) {
              processResult(allRows);
            }
          });
        });
      } else {
        // do a single query to fetch the documents
        var sql = select(SELECT_DOCS, [DOC_STORE, BY_SEQ_STORE], DOC_STORE_AND_BY_SEQ_JOINER, criteria, DOC_STORE + '.id ' + (descending ? 'DESC' : 'ASC'));
        sql += ' LIMIT ' + limit + ' OFFSET ' + offset;

        if (!!sqlArgs) {
          db.select(sql, sqlArgs).then((result) => {
            // var rows = result;
            var rows = [];
            for (var index = 0; index < result.length; index++) {
              rows.push(result[index]);
            }
            processResult(rows);
          });
        } else {
          db.select(sql).then((result) => {
            // var rows = result;
            var rows = [];
            for (var index = 0; index < result.length; index++) {
              rows.push(result[index]);
            }
            processResult(rows);
          });
        }
      }

      function processResult(rows) {
        for (var i = 0, l = rows.length; i < l; i++) {
          var item = rows[i];
          var metadata = safeJsonParse(item.metadata);
          var id = metadata.id;
          var data = unstringifyDoc(item.data, id, item.rev);
          var winningRev = data._rev;
          var doc = {
            id: id,
            key: id,
            value: { rev: winningRev },
          };
          if (opts.include_docs) {
            doc.doc = data;
            doc.doc._rev = winningRev;
            if (opts.conflicts) {
              var conflicts = collectConflicts(metadata);
              if (conflicts.length) {
                doc.doc._conflicts = conflicts;
              }
            }
            fetchAttachmentsIfNecessary(doc.doc, opts, api, db);
          }
          if (item.deleted) {
            if (keys) {
              doc.value.deleted = true;
              doc.doc = null;
            } else {
              // propably should not happen
              continue;
            }
          }
          if (!keys) {
            results.push(doc);
          } else {
            var index = keys.indexOf(id, index);
            do {
              results[index] = doc;
              index = keys.indexOf(id, index + 1);
            } while (index > -1 && index < keys.length);
          }
        }
        if (keys) {
          keys.forEach(function (key, index) {
            if (!results[index]) {
              results[index] = { key: key, error: 'not_found' };
            }
          });
        }
      }
    })
      .catch(websqlError(callback))
      .then(function () {
        var returnVal = {
          total_rows: totalRows,
          offset: opts.skip,
          rows: results,
        };
        /* istanbul ignore if */
        if (opts.update_seq) {
          returnVal.update_seq = updateSeq;
        }
        callback(null, returnVal);
      });
  };

  api._changes = function (opts) {
    opts = clone(opts);

    if (opts.continuous) {
      var id = api._name + ':' + uuid();
      websqlChanges.addListener(api._name, id, api, opts);
      websqlChanges.notify(api._name);
      return {
        cancel: function () {
          websqlChanges.removeListener(api._name, id);
        },
      };
    }

    var descending = opts.descending;

    // Ignore the `since` parameter when `descending` is true
    opts.since = opts.since && !descending ? opts.since : 0;

    var limit = 'limit' in opts ? opts.limit : -1;
    if (limit === 0) {
      limit = 1; // per CouchDB _changes spec
    }

    var results = [];
    var numResults = 0;

    function fetchChanges() {
      var selectStmt = DOC_STORE + '.json AS metadata, ' + DOC_STORE + '.max_seq AS maxSeq, ' + BY_SEQ_STORE + '.json AS winningDoc, ' + BY_SEQ_STORE + '.rev AS winningRev ';

      var from = DOC_STORE + ' JOIN ' + BY_SEQ_STORE;

      var joiner = DOC_STORE + '.id=' + BY_SEQ_STORE + '.doc_id' + ' AND ' + DOC_STORE + '.winningseq=' + BY_SEQ_STORE + '.seq';

      var criteria = ['maxSeq > ?'];
      var sqlArgs = [opts.since];

      if (opts.doc_ids) {
        criteria.push(DOC_STORE + '.id IN ' + qMarks(opts.doc_ids.length));
        sqlArgs = sqlArgs.concat(opts.doc_ids);
      }

      var orderBy = 'maxSeq ' + (descending ? 'DESC' : 'ASC');

      var sql = select(selectStmt, from, joiner, criteria, orderBy);

      var filter = filterChange(opts);
      if (!opts.view && !opts.filter) {
        // we can just limit in the query
        sql += ' LIMIT ' + limit;
      }

      var lastSeq = opts.since || 0;
      db.readTransaction(() => {
        db.select(sql, sqlArgs).then((result) => {
          function reportChange(change) {
            return function () {
              opts.onChange(change);
            };
          }
          for (var i = 0, l = result.length; i < l; i++) {
            var item = result[i];
            var metadata = safeJsonParse(item.metadata);
            lastSeq = item.maxSeq;

            var doc = unstringifyDoc(item.winningDoc, metadata.id, item.winningRev);
            var change = opts.processChange(doc, metadata, opts);
            change.seq = item.maxSeq;

            var filtered = filter(change);
            if (typeof filtered === 'object') {
              return opts.complete(filtered);
            }

            if (filtered) {
              numResults++;
              if (opts.return_docs) {
                results.push(change);
              }
              // process the attachment immediately
              // for the benefit of live listeners
              if (opts.attachments && opts.include_docs) {
                fetchAttachmentsIfNecessary(doc, opts, api, db, reportChange(change));
              } else {
                reportChange(change)();
              }
            }
            if (numResults === limit) {
              break;
            }
          }
        });
      })
        .catch(websqlError(opts.complete))
        .then(function () {
          if (!opts.continuous) {
            opts.complete(null, {
              results: results,
              last_seq: lastSeq,
            });
          }
        });
    }

    fetchChanges();
  };

  api._close = function (callback) {
    //WebSQL databases do not need to be closed
    callback();
  };

  api._getAttachment = function (docId, attachId, attachment, opts, callback) {
    var res;
    var tx = opts.ctx;
    var digest = attachment.digest;
    var type = attachment.content_type;
    var sql = 'SELECT escaped, ' + 'CASE WHEN escaped = 1 THEN body ELSE HEX(body) END AS body FROM ' + ATTACH_STORE + ' WHERE digest=?';
    db.select(sql, [digest]).then((result) => {
      // websql has a bug where \u0000 causes early truncation in strings
      // and blobs. to work around this, we used to use the hex() function,
      // but that's not performant. after migration 6, we remove \u0000
      // and add it back in afterwards
      var item = result[0];
      var data = item.escaped ? unescapeBlob(item.body) : parseHexString(item.body, encoding);
      if (opts.binary) {
        res = binStringToBlob(data, type);
      } else {
        res = btoa(data);
      }
      callback(null, res);
    });
  };

  api._getRevisionTree = function (docId, callback) {
    db.readTransaction(() => {
      var sql = 'SELECT json AS metadata FROM ' + DOC_STORE + ' WHERE id = ?';
      db.select(sql, [docId]).then((result) => {
        if (!result.length) {
          callback(createError(MISSING_DOC));
        } else {
          var data = safeJsonParse(result[0].metadata);
          callback(null, data.rev_tree);
        }
      });
    });
  };

  api._doCompaction = function (docId, revs, callback) {
    if (!revs.length) {
      return callback();
    }
    db.transaction(() => {
      // update doc store
      var sql = 'SELECT json AS metadata FROM ' + DOC_STORE + ' WHERE id = ?';
      db.select(sql, [docId]).then((result) => {
        var metadata = safeJsonParse(result[0].metadata);
        traverseRevTree(metadata.rev_tree, function (isLeaf, pos, revHash, ctx, opts) {
          var rev = pos + '-' + revHash;
          if (revs.indexOf(rev) !== -1) {
            opts.status = 'missing';
          }
        });

        var sql = 'UPDATE ' + DOC_STORE + ' SET json = ? WHERE id = ?';
        db.execute(sql, [safeJsonStringify(metadata), docId]);
      });

      compactRevs(revs, docId, tx);
    })
      .catch(websqlError(callback))
      .then(() => {
        callback();
      });
  };

  api._getLocal = function (id, callback) {
    db.readTransaction(() => {
      var sql = 'SELECT json, rev FROM ' + LOCAL_STORE + ' WHERE id=?';
      db.select(sql, [id]).then((res) => {
        if (res.length) {
          var item = res[0];
          var doc = unstringifyDoc(item.json, id, item.rev);
          callback(null, doc);
        } else {
          callback(createError(MISSING_DOC));
        }
      });
    });
  };

  api._putLocal = function (doc, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    delete doc._revisions; // ignore this, trust the rev
    var oldRev = doc._rev;
    var id = doc._id;
    var newRev;
    if (!oldRev) {
      newRev = doc._rev = '0-1';
    } else {
      newRev = doc._rev = '0-' + (parseInt(oldRev.split('-')[1], 10) + 1);
    }
    var json = stringifyDoc(doc);

    var ret;
    function putLocal(db) {
      var sql;
      var values;
      if (oldRev) {
        sql = 'UPDATE ' + LOCAL_STORE + ' SET rev=?, json=? ' + 'WHERE id=? AND rev=?';
        values = [newRev, json, id, oldRev];
      } else {
        sql = 'INSERT INTO ' + LOCAL_STORE + ' (id, rev, json) VALUES (?,?,?)';
        values = [id, newRev, json];
      }
      db.execute(sql, values).then(
        (res) => {
          if (res) {
            ret = { ok: true, id: id, rev: newRev };
            if (opts.ctx) {
              // return immediately
              callback(null, ret);
            }
          } else {
            callback(createError(REV_CONFLICT));
          }
        },
        function () {
          callback(createError(REV_CONFLICT));
          return false; // ack that we handled the error
        }
      );
    }

    if (opts.ctx) {
      putLocal(opts.ctx);
    } else {
      db.transaction(() => {
        putLocal(db);
      })
        .catch(websqlError(callback))
        .then(function () {
          if (ret) {
            callback(null, ret);
          }
        });
    }
  };

  api._removeLocal = function (doc, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    var ret;

    function removeLocal(tx) {
      var sql = 'DELETE FROM ' + LOCAL_STORE + ' WHERE id=? AND rev=?';
      var params = [doc._id, doc._rev];
      db.execute(sql, params).then((res) => {
        if (!res.length) {
          return callback(createError(MISSING_DOC));
        }
        ret = { ok: true, id: doc._id, rev: '0-0' };
        if (opts.ctx) {
          // return immediately
          callback(null, ret);
        }
      });
    }

    if (opts.ctx) {
      removeLocal(opts.ctx);
    } else {
      db.transaction(() => {
        removeLocal();
      })
        .catch(websqlError(callback))
        .then(function () {
          if (ret) {
            callback(null, ret);
          }
        });
    }
  };

  api._destroy = function (opts, callback) {
    websqlChanges.removeAllListeners(api._name);
    db.transaction(() => {
      var stores = [DOC_STORE, BY_SEQ_STORE, ATTACH_STORE, META_STORE, LOCAL_STORE, ATTACH_AND_SEQ_STORE];
      stores.forEach(function (store) {
        db.execute('DROP TABLE IF EXISTS ' + store, []);
      });
    })
      .catch(websqlError(callback))
      .then(function () {
        if (hasLocalStorage()) {
          delete window.localStorage['_pouch__websqldb_' + api._name];
          delete window.localStorage[api._name];
        }
        callback(null, { ok: true });
      });
  };
}

export default WebSqlPouch;
