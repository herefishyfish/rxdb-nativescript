import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptSqliteRxstorageAdapter } from '@demo/shared';
import {} from '@herefishyfish/nativescript-sqlite-rxstorage-adapter';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptSqliteRxstorageAdapter {}
