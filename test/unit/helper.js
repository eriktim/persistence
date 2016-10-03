import {Config} from '../../src/config';
import {EntityManager, getServerForTesting} from '../../src/entity-manager';

export function createEntityManagerStub() {
  let config = Config.create();
  let entityManager = new EntityManager(config);
  entityManager.requests = [];
  let server = getServerForTesting(entityManager);
  server.fetch = function(path, init, propertyMap) {
    if (propertyMap) {
      throw new Error('propertyMap is not supported' +
          ' by the stub entity manager');
    }
    let body = JSON.parse(init.body || '{}');
    entityManager.requests.push({
      path,
      body: Object.assign({}, body)
    });
    return Promise.resolve(body);
  };
  return entityManager;
}

export function expectRejection(promise, reason = null) {
  return promise.then(
    () => {
      throw new Error('expected Promise to be rejected');
    },
    err => {
      if (reason) {
        expect(err.message).toEqual(reason);
      }
      return undefined;
    }
  );
}
