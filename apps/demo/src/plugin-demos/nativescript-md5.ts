import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptMd5 } from '@demo/shared';
import {} from '@rxdb/nativescript-md5';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptMd5 {}
