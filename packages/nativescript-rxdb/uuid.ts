import { isAndroid } from '@nativescript/core';

declare const java: any;
declare const NSUUID: any;

export const v4 = () => {
  if (isAndroid) {
    return java.util.UUID.randomUUID().toString();
  } else {
    return NSUUID.UUID().UUIDString.toLowerCase();
  }
};
