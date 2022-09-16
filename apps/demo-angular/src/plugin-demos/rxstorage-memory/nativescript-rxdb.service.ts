import { Injectable } from '@angular/core';
import { isAndroid } from '@nativescript/core';
import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/memory';
// Using customized replication plugin for Hasura backend
// import { RxDBReplicationGraphQLPlugin } from "rxdb/plugins/replication-graphql";
import { RxDBReplicationHasuraGraphQLPlugin } from '../../replicator/graphql-plugin';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { pullQueryBuilder, pushQueryBuilder, pullStreamQueryBuilder } from '../../replicator/query-builder';
import { HERO_SCHEMA } from '../../schemas/hero.schema';

const batchSize = 5;

let uniqueIndex = 11;

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

    this.heros$ = this.database.heroes.find({
      sort: [{ name: 'desc' }],
    }).$;
  }

  runReplication() {
    // this.replicationState.run(true);
  }

  addHero() {
    this.database.heroes.insert({
      id: this.uuid(),
      name: 'Cool Hero ' + uniqueIndex++,
      color: '#4321' + uniqueIndex,
    });
  }
}
