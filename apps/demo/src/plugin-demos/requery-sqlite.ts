import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedRequerySqlite } from '@demo/shared';
import {} from '@herefishyfish/requery-sqlite';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedRequerySqlite {}
