// import crypto from 'crypto';
// import { MD5 } from 'nativescript-md5';

import { NativescriptMd5 } from '..';

function binaryMd5(data, callback) {
  // var base64 = crypto.createHash('md5').update(data, 'binary').digest('base64');
  callback(NativescriptMd5.hashForString(data));
}

function stringMd5(string) {
  return NativescriptMd5.hashForString(string);
  // return crypto.createHash('md5').update(string, 'binary').digest('hex');
}

export { binaryMd5, stringMd5 };
