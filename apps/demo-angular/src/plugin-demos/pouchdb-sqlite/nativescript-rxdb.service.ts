import { Injectable } from '@angular/core';
import { isAndroid } from '@nativescript/core';
import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/memory';
import { RxDBReplicationGraphQLPlugin } from 'rxdb/plugins/replication-graphql';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { HERO_SCHEMA } from '../../schemas/hero.schema';

// export const heroSchema = {
//   version: 0,
//   primaryKey: "id",
//   type: "object",
//   properties: {
//     id: {
//       type: "string",
//       maxLength: 100
//     },
//     name: {
//       type: "string",
//       maxLength: 100,
//     },
//     color: {
//       type: "string",
//     },
//     updatedAt: {
//       type: "string",
//     },
//     createdAt: {
//       type: "string",
//     },
//   },
//   indexes: ["name", "color", "updatedAt", "createdAt"],
//   required: ["id", "name"],
// };
export const HERO_COLLECTION_NAME = 'hero';

const batchSize = 5;

export const getPushQuery = () => {
  return (docs) => {
    // remove rxdb metadata before push

    console.log(docs);

    docs.forEach((doc) => {
      delete doc._meta;
    });
    const query = `mutation
      hero ($doc: [hero_insert_input!]!) {
        insert_hero(
          objects: $doc,
          on_conflict: {
            constraint: hero_pkey,
            update_columns: [
              name, color, deleted, updatedAt, createdAt
            ]
        }){
          returning {
            id name color updatedAt
          }
        }
      }`;

    const variables = {
      doc: docs,
    };

    return {
      query,
      variables,
    };
  };
};

export const getPullQuery = (checkpoint, limit) => {
  if (!checkpoint) {
    checkpoint = {
      updatedAt: new Date(0).toISOString(),
    };
  }

  console.log('Manually syncing @', new Date().toISOString());
  console.log(checkpoint);
  // the first pull does not have a start-document
  const sortByValue = checkpoint['updatedAt'];
  const query = `{
      hero(
        where: {updatedAt: {_gt: "${sortByValue}"}},
        order_by: {updatedAt: asc}
        ){
          id name color updatedAt createdAt deleted
        }
      }`;

  return {
    query,
    variables: {},
  };
};

const getUuid = () => {
  if (isAndroid) {
    return java.util.UUID.randomUUID().toString();
  } else {
    return NSUUID.UUID().UUIDString.toLowerCase();
  }
};

const getDatabase = async (storage): Promise<{ database: any; replicationState: any }> => {
  const database = await createRxDatabase({
    name: 'exampledb',
    storage: storage,
    multiInstance: false,
    ignoreDuplicate: true,
    eventReduce: false,
  });
  await database.addCollections({
    heroes: {
      schema: HERO_SCHEMA,
    },
  });

  const replicationState = await database.heroes.syncGraphQL({
    url: {
      http: 'https://working-oriole-73.hasura.app/v1/graphql',
    },
    headers: {
      'x-hasura-admin-secret': '2zWIdFAkt9O9OGnxqXTkPw14xkQC0jVCSWKRf9hB7OAkrlzz1l8idW9w7SfUPkZE',
    },
    push: {
      batchSize,
      queryBuilder: getPushQuery(),
    },
    pull: {
      batchSize: 100,
      queryBuilder: getPullQuery,
    },
    deletedField: 'deleted',
    waitForLeadership: false,
    live: true,

    // liveInterval: 1000 * 60 * 1, // 1 minute
  });
  // show replication-errors in logs
  replicationState.error$.subscribe((err) => {
    console.dir(err);
  });

  replicationState.send$.subscribe((doc) => {
    console.log('Sending:', doc);
  });

  replicationState.received$.subscribe((doc) => {
    console.log('Received:', doc);
  });

  replicationState.start();

  return { database, replicationState };
};

let uniqueIndex = 11;

@Injectable()
export class RxDBService {
  heros$;
  replicationState;
  private database;

  constructor() {
    addRxPlugin(RxDBQueryBuilderPlugin);
    addRxPlugin(RxDBReplicationGraphQLPlugin);
    this.initDb();
  }

  async initDb() {
    const { database, replicationState } = await getDatabase(getRxStorageMemory());
    this.database = database;
    this.replicationState = replicationState;

    this.heros$ = this.database.heroes.find({
      // selector: {
      //   name: 'Cool Hero 11'
      // },
      sort: [{ name: 'asc' }],
    }).$;
  }

  runReplication() {
    this.replicationState.run(true);
  }

  addHero() {
    this.database.heroes.insert({
      id: getUuid(),
      name: 'Cool Hero ' + uniqueIndex++,
      color: '#4321' + uniqueIndex,
    });
  }
}
