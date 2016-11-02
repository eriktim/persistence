import {Config} from '../../src/config';
import {EntityManager, getLocationSymbolForTesting, getServerForTesting}
    from '../../src/entity-manager';

const LOCATION = getLocationSymbolForTesting();

export const URL = 'mock://no-url';

export function asJasmineValue(value) {
  if (typeof value === 'string') {
    let obj = {};
    for (let i in value) {
      obj[i] = value[i];
    }
    return obj;
  }
  return value;
}

export function createEntityManagerStub() {
  let config = Config.create({baseUrl: URL});
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
    body[LOCATION] = path + (path.endsWith('/') ? '' : '/') + (body.id || '1');
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
