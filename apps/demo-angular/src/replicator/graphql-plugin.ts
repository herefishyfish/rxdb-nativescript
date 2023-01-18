import { Client, createClient } from 'graphql-ws';
import * as objectPath from 'object-path';
import { RxCollection, SyncOptionsGraphQL, RxReplicationPullStreamItem, WithDeleted, RxReplicationWriteToMasterRow, fastUnsecureHash, ensureNotFalsy, RxPlugin, lastOfArray } from 'rxdb';
import { ReplicationPullOptions, ReplicationPushOptions } from 'rxdb/dist/types/types/plugins/replication';
import { startReplicationOnLeaderShip } from 'rxdb/plugins/replication';
import { GRAPHQL_REPLICATION_PLUGIN_IDENTITY_PREFIX, GRAPHQL_WEBSOCKET_BY_URL, removeGraphQLWebSocketRef, RxGraphQLReplicationState } from 'rxdb/plugins/replication-graphql';
import { Subject } from 'rxjs';

/**
 * From RxDB 13 the GraphQL replication plugin requires each action to provide a
 * documents and checkpoint. Because we're using Hasura for the demo it would mean
 * we would need to create custom actions for every replicated table.
 *
 * This plugin is a work-around from the intended method so that it behaves like previous
 * versions of RxDB.
 *
 * Original plugin: https://github.com/pubkey/rxdb/tree/master/src/plugins/replication-graphql
 */

/**
 * Standard getGraphQLWebSocket definition doesn't allow adding connection params only the url.
 * Fixes document/checkpoint results.
 */
function getGraphQLWebSocket(url: string, headers = {}): Client {
  let has = GRAPHQL_WEBSOCKET_BY_URL.get(url);
  if (!has) {
    const wsClient = createClient({
      url,
      retryAttempts: Number.MAX_SAFE_INTEGER,
      shouldRetry: () => true,
      connectionParams: {
        headers,
      },
    });
    has = {
      url,
      socket: wsClient,
      refCount: 1,
    };
    GRAPHQL_WEBSOCKET_BY_URL.set(url, has);
  } else {
    has.refCount = has.refCount + 1;
  }
  return has.socket;
}

function getCheckpoint(data: any[], lastCheckpoint) {
  const lastDoc = lastOfArray(data);
  return {
    id: lastDoc?.id ?? lastCheckpoint?.id ?? '',
    updatedAt: lastDoc?.updatedAt ?? lastCheckpoint?.updatedAt ?? new Date(0).toISOString(),
  };
}

/**
 * Fixes document/checkpoint results.
 */
function syncHasuraGraphQL<RxDocType, CheckpointType>(
  this: RxCollection,
  {
    url,
    headers = {},
    credentials,
    deletedField = '_deleted',
    waitForLeadership = true,
    pull,
    push,
    live = true,
    retryTime = 1000 * 5, // in ms
    autoStart = true,
  }: SyncOptionsGraphQL<RxDocType, CheckpointType>
): RxGraphQLReplicationState<RxDocType, CheckpointType> {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const collection = this;

  /**
   * We use this object to store the GraphQL client
   * so we can later swap out the client inside of the replication handlers.
   */
  const mutateableClientState = {
    headers,
    credentials,
  };

  const pullStream$: Subject<RxReplicationPullStreamItem<RxDocType, CheckpointType>> = new Subject();

  let replicationPrimitivesPull: ReplicationPullOptions<RxDocType, CheckpointType> | undefined;
  if (pull) {
    const pullBatchSize = pull.batchSize ? pull.batchSize : 20;
    replicationPrimitivesPull = {
      async handler(lastPulledCheckpoint: CheckpointType) {
        const pullGraphQL = await pull.queryBuilder(lastPulledCheckpoint, pullBatchSize);
        const result = await graphqlReplicationState.graphQLRequest(pullGraphQL);

        if (result.errors) {
          throw result.errors;
        }

        const dataPath = pull.dataPath || ['data', Object.keys(result.data)[0]];
        let data: any = objectPath.get(result, dataPath);

        if (pull.responseModifier) {
          data = await pull.responseModifier(data, 'handler', lastPulledCheckpoint);
        }

        // const docsData: WithDeleted<RxDocType>[] = data.documents;
        // const newCheckpoint = data.checkpoint;
        const docsData: WithDeleted<RxDocType>[] = data;
        const newCheckpoint = getCheckpoint(docsData, lastPulledCheckpoint);

        return {
          documents: docsData,
          checkpoint: newCheckpoint,
        } as any;
      },
      batchSize: pull.batchSize,
      modifier: pull.modifier,
      stream$: pullStream$.asObservable(),
    };
  }
  let replicationPrimitivesPush: ReplicationPushOptions<RxDocType> | undefined;
  if (push) {
    replicationPrimitivesPush = {
      async handler(rows: RxReplicationWriteToMasterRow<RxDocType>[]) {
        const pushObj = await push.queryBuilder(rows);
        const result = await graphqlReplicationState.graphQLRequest(pushObj);

        if (result.errors) {
          throw result.errors;
        }

        // const dataPath = Object.keys(result.data)[0];
        // const data: any = objectPath.get(result.data, dataPath);
        // return data;
        return [];
      },
      batchSize: push.batchSize,
      modifier: push.modifier,
    };
  }

  const graphqlReplicationState = new RxGraphQLReplicationState(url, mutateableClientState, GRAPHQL_REPLICATION_PLUGIN_IDENTITY_PREFIX + fastUnsecureHash(url.http ? url.http : (url.ws as any)), collection, deletedField, replicationPrimitivesPull, replicationPrimitivesPush, live, retryTime, autoStart);

  const mustUseSocket = url.ws && pull && pull.streamQueryBuilder && live;

  const startBefore = graphqlReplicationState.start.bind(graphqlReplicationState);
  graphqlReplicationState.start = () => {
    if (mustUseSocket) {
      const wsClient = getGraphQLWebSocket(ensureNotFalsy(url.ws), mutateableClientState.headers);

      wsClient.on('connected', () => {
        pullStream$.next('RESYNC');
      });

      const query: any = ensureNotFalsy(pull.streamQueryBuilder)(mutateableClientState.headers);

      wsClient.subscribe(query, {
        next: async (streamResponse: any) => {
          pullStream$.next('RESYNC');
          // const firstField = Object.keys(streamResponse.data)[0];
          // const docsData = streamResponse.data[firstField];
          // const newCheckpoint = getCheckpoint(
          //   streamResponse.data[firstField],
          //   {}
          // );
          // pullStream$.next({
          //   documents: docsData,
          //   checkpoint: newCheckpoint,
          // } as any);
        },
        error: (error: any) => {
          pullStream$.error(error);
        },
        complete: () => {
          pullStream$.complete();
        },
      });
    }
    return startBefore();
  };

  const cancelBefore = graphqlReplicationState.cancel.bind(graphqlReplicationState);
  graphqlReplicationState.cancel = () => {
    pullStream$.complete();
    if (mustUseSocket) {
      removeGraphQLWebSocketRef(ensureNotFalsy(url.ws));
    }
    return cancelBefore();
  };

  startReplicationOnLeaderShip(waitForLeadership, graphqlReplicationState);
  return graphqlReplicationState;
}

export const RxDBReplicationHasuraGraphQLPlugin: RxPlugin = {
  name: 'replication-hasura-graphql',
  init() {
    // Leader election isn't required on a single application level.
    // addRxPlugin(RxDBLeaderElectionPlugin);
  },
  rxdb: true,
  prototypes: {
    RxCollection: (proto: any) => {
      proto.syncGraphQL = syncHasuraGraphQL;
    },
  },
};
