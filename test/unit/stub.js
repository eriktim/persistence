import {Config} from '../../src/config';
import {EntityManager, getServerForTesting} from '../../src/entity-manager';

export class Stub {
  static createEntityManager() {
    let config = Config.create();
    let entityManager = new EntityManager(config);
    entityManager.requests = [];
    let server = getServerForTesting(entityManager);
    server.fetch = function(path, init, propertyMap) {
      if (propertyMap) {
        throw new Error('propertyMap is not supported' +
            ' by the stub entity manager');
      }
      entityManager.requests.push({
        path,
        body: JSON.parse(init.body || '{}')
      });
    };
    return entityManager;
  }
}
