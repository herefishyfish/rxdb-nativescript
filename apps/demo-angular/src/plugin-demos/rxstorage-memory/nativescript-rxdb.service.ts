import { Injectable } from '@angular/core';
import { Dialogs, isAndroid } from '@nativescript/core';
import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/memory';
// Using customized replication plugin for Hasura backend
// import { RxDBReplicationGraphQLPlugin } from "rxdb/plugins/replication-graphql";
import { RxDBReplicationHasuraGraphQLPlugin } from '../../replicator/graphql-plugin';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { pullQueryBuilder, pushQueryBuilder, pullStreamQueryBuilder } from '../../replicator/query-builder';
import { HERO_SCHEMA } from '../../schemas/hero.schema';
import { tap } from 'rxjs';

const batchSize = 100;

@Injectable()
export class RxDBService {
  heros$;
  replicationState;
  private database;

  constructor() {
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
    this.database = await createRxDatabase({
      name: 'exampledb',
      storage: getRxStorageMemory(),
      multiInstance: false,
      ignoreDuplicate: true,
    });
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

    this.replicationState.error$.subscribe((err) => {
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
}
