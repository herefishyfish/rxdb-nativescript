import { Inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { Dialogs, isAndroid } from '@nativescript/core';
import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb';
import { Subject, takeUntil, tap } from 'rxjs';
// Using customized replication plugin for Hasura backend
// import { RxDBReplicationGraphQLPlugin } from "rxdb/plugins/replication-graphql";
import { RxDBReplicationHasuraGraphQLPlugin } from './graphql-plugin';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { pullQueryBuilder, pushQueryBuilder, pullStreamQueryBuilder } from './query-builder';
import { HERO_SCHEMA } from '../schemas/hero.schema';

const batchSize = 100;

export interface RxDBStorage {
  getRxDBStorage();
}

export const RXDB_STORAGE = new InjectionToken<RxDBStorage>('RXDB_STORAGE');

@Injectable()
export class RxDBCoreService implements OnDestroy {
  heros$;
  replicationState;
  database: RxDatabase;
  private destroy$ = new Subject<void>();

  constructor(@Inject(RXDB_STORAGE) private rxdbStorage: RxDBStorage) {
    addRxPlugin(RxDBQueryBuilderPlugin);
    addRxPlugin(RxDBReplicationHasuraGraphQLPlugin);
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
              uuid: this.uuid(),
              name,
              color,
            });
          },
        },
      },
    });

    console.log('Creating Replication');
    this.replicationState = await this.database.heroes.syncGraphQL({
      url: {
        http: 'https://working-oriole-73.hasura.app/v1/graphql',
        ws: 'wss://working-oriole-73.hasura.app/v1/graphql',
      },
      headers: {
        'x-hasura-admin-secret': '2zWIdFAkt9O9OGnxqXTkPw14xkQC0jVCSWKRf9hB7OAkrlzz1l8idW9w7SfUPkZE',
      },
      push: {
        batchSize,
        queryBuilder: pushQueryBuilder,
      },
      pull: {
        batchSize,
        queryBuilder: pullQueryBuilder,
        streamQueryBuilder: pullStreamQueryBuilder,
      },
      live: true,
      autoStart: true,
      // liveInterval: 1000 * 1, // 1 minute
      deletedField: 'deleted',
    });

    this.replicationState.error$.pipe(takeUntil(this.destroy$)).subscribe((err) => {
      console.dir(err);
    });

    this.heros$ = this.database.heroes
      .find({
        selector: {},
        sort: [{ name: 'asc' }],
      })
      .$.pipe(
        tap((hero: any[]) => {
          console.log(hero.map((e) => e.name));
        })
      );
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.database.destroy();
  }
}
