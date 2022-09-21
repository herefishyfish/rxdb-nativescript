import { MD5 } from 'nativescript-md5';

export function binaryMd5(data, callback) {
  callback(MD5.hashForString(data));
}

export function stringMd5(string) {
  return MD5.hashForString(string);
}
