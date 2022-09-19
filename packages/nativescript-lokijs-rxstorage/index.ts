/**
* LokiNativescriptAdapter
* @author Stefano Falda <stefano.falda@gmail.com>
* @author Tobias Hennig <toias.hennig1@gmail.com>
*
* Lokijs adapter for nativescript framework (http://www.nativescript.org)
*
* The db file is created in the app documents folder.

* How to use:
* Just create a new loki db and your ready to go:
*
* let db = new loki('loki.json',{autosave:true});
*
*/

export function LokiNativescriptAdapter() {
  this.fs = require('@nativescript/core/file-system');
}

LokiNativescriptAdapter.prototype.loadDatabase = function (dbname, callback) {
  const documents = this.fs.knownFolders.documents();
  const myFile = documents.getFile(dbname);
  //Read from filesystem
  myFile.readText().then(
    function (content) {
      //The file is empty or missing
      if (content === '') {
        console.error('DB file does not exist');
        callback('');
      } else {
        callback(content);
      }
    },
    function (error) {
      console.error('Error opening db ' + dbname + ': ' + error);
      callback('');
    }
  );
};

LokiNativescriptAdapter.prototype.saveDatabase = function (dbname, serialized, callback) {
  const documents = this.fs.knownFolders.documents();
  const myFile = documents.getFile(dbname);
  myFile.writeText(serialized).then(
    function () {
      callback();
    },
    function (error) {
      console.error('Error saving db ' + dbname + ': ' + error);
    }
  );
};

LokiNativescriptAdapter.prototype.deleteDatabase = function deleteDatabase(dbname, callback) {
  const documents = this.fs.knownFolders.documents();
  const file = documents.getFile(dbname);
  file.remove().then(
    function (result) {
      callback();
    },
    function (error) {
      callback(error);
    }
  );
};
