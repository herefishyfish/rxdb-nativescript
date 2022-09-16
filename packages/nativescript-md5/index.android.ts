import { INativescriptMd5 } from '.';
import { Utils } from './common';

export class NativescriptMd5 implements INativescriptMd5 {
  hashForString(s: string): string {
    let hash = '';
    try {
      const digest = java.security.MessageDigest.getInstance('MD5');
      const javaString = new java.lang.String(s);
      digest.update(javaString.getBytes());
      const messageDigest = digest.digest();

      for (let i = 0; i < messageDigest.length; i++) {
        const hex = Utils.numberToZedoPadHex(0xff & messageDigest[i]);
        hash += hex;
      }
      return hash;
    } catch (err) {
      console.error('failed to create hash. ', err);
      return '';
    }
  }
}
