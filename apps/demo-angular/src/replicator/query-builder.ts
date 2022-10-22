export const pushQueryBuilder = (docs) => {
  // remove rxdb metadata before push
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
    doc: docs.map((d) => d.newDocumentState),
  };

  return {
    query,
    variables,
  };
};

export const pullQueryBuilder = (checkpoint, limit) => {
  // the first pull does not have a start-document
  const sortByValue = checkpoint ? checkpoint['updatedAt'] : new Date(0).toISOString();
  const query = `query MyQuery {
    hero(where: {updatedAt: {_gt: "${sortByValue}"}}, order_by: {updatedAt: asc}, limit: ${limit}) {
      color
      createdAt
      deleted
      id
      name
      updatedAt
    }
  }`;

  return {
    query,
    variables: {},
  };
};

export const pullStreamQueryBuilder = () => {
  const query = `subscription HeroSubscription {
    hero {
      name
      id
      updatedAt
      createdAt
      deleted
      color
    }
  }`;

  return {
    query,
    variables: {},
  };
};
