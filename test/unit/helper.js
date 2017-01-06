import {Config} from '../../src/config';
import {Metadata} from '../../src/metadata';
import {EntityManager, getServerForTesting}
    from '../../src/entity-manager';

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

export function createEntityManagerStub(options: IConfig = {}) {
  let config = Config.create(Object.assign({baseUrl: URL}, options));
  let entityManager = new EntityManager(config);
  entityManager.requests = [];
  let server = getServerForTesting(entityManager);
  server.fetch = function(path, init, propertyMap) {
    if (propertyMap && Object.keys(propertyMap).length) {
      throw new Error('propertyMap is not supported' +
          ' by the stub entity manager');
    }
    let body = JSON.parse(init.body || '{}');
    entityManager.requests.push({
      path,
      body: Object.assign({}, body)
    });
    Reflect.defineMetadata(Metadata.REST_LOCATION, path + (path.endsWith('/') ? '' : '/') + (body.id || '1'), body);
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
