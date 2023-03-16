import { Inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { Dialogs, isAndroid, isIOS } from '@nativescript/core';
import { addRxPlugin, createRxDatabase, lastOfArray, RxDatabase, RxDocument } from 'rxdb';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { replicateGraphQL } from 'rxdb/plugins/replication-graphql';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { pullQueryBuilder, pushQueryBuilder, pullStreamQueryBuilder } from './query-builder';
import { HERO_SCHEMA, RxHeroDocumentType } from '../schemas/hero.schema';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

const batchSize = 100;

export interface RxDBStorage {
  getRxDBStorage();
}

export const RXDB_STORAGE = new InjectionToken<RxDBStorage>('RXDB_STORAGE');

function getCheckpoint(data: any[], lastCheckpoint) {
  const lastDoc = lastOfArray(data);
  return {
    id: lastDoc?.id ?? lastCheckpoint?.id ?? '',
    updatedAt: lastDoc?.updatedAt ?? lastCheckpoint?.updatedAt ?? new Date(0).toISOString(),
  };
}

@Injectable()
export class RxDBCoreService implements OnDestroy {
  heros$;
  replicationState;
  database: RxDatabase;
  private destroy$ = new Subject<void>();

  constructor(@Inject(RXDB_STORAGE) private rxdbStorage: RxDBStorage) {
    addRxPlugin(RxDBQueryBuilderPlugin);
    addRxPlugin(RxDBDevModePlugin);

    this.initDb();
  }

  uuid() {
    if (isAndroid) {
      return java.util.UUID.randomUUID().toString();
    } else {
      return NSUUID.UUID().UUIDString.toLowerCase();
    }
  }

  async initDb() {
    console.log('Creating Database');
    this.database = await createRxDatabase({
      name: 'exampledb',
      storage: this.rxdbStorage as any,
      multiInstance: false,
      ignoreDuplicate: true,
    });

    console.log('Creating Collections');
    await this.database.addCollections({
      heroes: {
        schema: HERO_SCHEMA,
        statics: {
          async addHero(name, color) {
            return this.upsert({
              id: this.uuid(),
              name,
              color,
            });
          },
        },
      },
    });

    console.log('Creating Replication');
    this.replicationState = replicateGraphQL<
      RxHeroDocumentType,
      {
        id: string;
        updatedAt: string;
      }
    >({
      collection: this.database.heroes,
      url: {
        http: 'https://working-oriole-73.hasura.app/v1/graphql',
        ws: 'wss://working-oriole-73.hasura.app/v1/graphql',
      },
      push: {
        batchSize,
        queryBuilder: pushQueryBuilder,
        responseModifier: (response) => {
          return [];
        },
      },
      pull: {
        batchSize,
        queryBuilder: pullQueryBuilder,
        streamQueryBuilder: pullStreamQueryBuilder,
        responseModifier: (response, source, requestCheckpoint) => {
          return {
            checkpoint: getCheckpoint(response, requestCheckpoint),
            documents: response,
          };
        },
      },
      live: true,
      autoStart: true,
      waitForLeadership: false,
      deletedField: 'deleted',
    });

    this.replicationState.error$.pipe(takeUntil(this.destroy$), distinctUntilChanged()).subscribe((err) => {
      console.dir(err);
    });

    this.heros$ = this.database.heroes.find({
      selector: {},
      sort: [{ name: 'asc' }],
    }).$;
  }

  addHero() {
    Dialogs.prompt('Enter hero name', '').then((response) => {
      if (response.result) {
        this.database.heroes.insert({
          id: this.uuid(),
          name: response.text,
          color: '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });
  }

  async measure(name: string, action: () => Promise<void>, records: number) {
    let start = 0;

    if (isIOS) {
      start = performance.now();
    } else if (isAndroid) {
      start = java.lang.System.currentTimeMillis();
    }

    await action();

    let stop = 0;
    if (isIOS) {
      stop = performance.now();
    } else if (isAndroid) {
      stop = java.lang.System.currentTimeMillis();
    }

    const total = stop - start;
    console.log(`total : ${total} ms (${name}, ${records} records)`);
    console.log(`per record: ${total / records} ms`);
  }

  async test() {
    console.log('testing start, platform ', isIOS ? 'ios' : 'android');
    console.log('================================================================');
    const writePromise = async () => {
      const id = this.uuid();
      for (let i = 0; i < 100; i++) {
        const date = '2023-01-18T13:00:00.000Z';
        const color = '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
        await this.database?.heroes.upsert({
          id: id,
          name: `hero ${i}`,
          color,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deleted: false,
        });
      }
    };
    const readPromise = async () => {
      for (let i = 0; i < 5000; i++) {
        await this.database?.heroes.findOne().exec();
      }
    };
    await this.measure('write', writePromise, 100);
    await this.measure('read', readPromise, 5000);
    console.log('testing end');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.database.destroy();
  }
}
