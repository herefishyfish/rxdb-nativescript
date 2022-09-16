import { Observable, EventData, Page } from '@nativescript/core';
import { DemoSharedRxdb } from '@demo/shared';
import {} from '@@herefishyfish/rxdb';

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedRxdb {}
