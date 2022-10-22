import { Connection } from '@nativescript-community/typeorm/browser/connection/Connection';
import { BaseConnectionOptions } from '@nativescript-community/typeorm/browser/connection/BaseConnectionOptions';

import { NativescriptDriver } from './NativescriptDriver';

let installed = false;
export function installMixins() {
  if (installed) {
    return;
  }
  installed = true;
  const DriverFactory = require('@nativescript-community/typeorm/browser/driver/DriverFactory').DriverFactory;
  const oldFunc = DriverFactory.prototype.create;

  DriverFactory.prototype.create = function (connection: Connection) {
    const { type } = connection.options;
    switch (type) {
      case 'nativescript' as any:
      case '@nativescript-community/sqlite' as any:
        return new NativescriptDriver(connection);
      default:
        return oldFunc.call(this, connection);
    }
  };
}

/**
 * NativeScript-specific connection options.
 */
export interface NativescriptConnectionOptions extends BaseConnectionOptions {
  /**
   * Database type.
   */
  readonly type: 'nativescript';

  /**
   * Database name.
   */
  readonly database: string;

  /**
   * The driver object
   * Default is `require('nativescript-sqlite')
   */
  readonly driver?: any;
}
