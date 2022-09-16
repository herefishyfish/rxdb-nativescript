import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptPouchdbSqliteAdapter } from '@demo/shared';
import {} from '@herefishyfish/nativescript-pouchdb-sqlite-adapter';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptPouchdbSqliteAdapter {}
