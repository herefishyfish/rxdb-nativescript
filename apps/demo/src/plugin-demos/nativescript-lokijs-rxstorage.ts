import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptLokijsRxstorage } from '@demo/shared';
import {} from '@herefishyfish/nativescript-lokijs-rxstorage';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptLokijsRxstorage {}
