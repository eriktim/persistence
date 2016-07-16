import {Entity} from '../../src/decorator/entity';
import {Id} from '../../src/decorator/id';
import {Config} from '../../src/config';
import {EntityConfig} from '../../src/entity-config';
import {EntityManager, getServerForTesting} from '../../src/entity-manager';

const URL = 'mock://no-url';
const HEADERS = new Headers({
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

function createFoo() {
  @Entity class Foo {
    @Id id = undefined;
  }
  return Foo;
}

function expectRejection(promise) {
  return promise.then(
    () => {
      throw new Error('expected Promise to be rejected');
    },
    () => undefined
  );
}

describe('EntityManager', () => {
  let entityManager;
  let entityConfig;
  let server;
  let Foo;
  let foo;
  class Bar {}
  let bar;

  beforeEach(() => {
    let config = Config.create({baseUrl: URL});
    entityManager = new EntityManager(config);
    server = getServerForTesting(entityManager);
    spyOn(server, 'delete').and.callFake(function() {
      return Promise.resolve([{id: 1}]);
    });
    spyOn(server, 'get').and.callFake(function(path) {
      let entity = {id: 1};
      return Promise.resolve(path.includes('/1') ? entity : [entity, {id: 2}]);
    });
    spyOn(server, 'post').and.callFake(function() {
      return Promise.resolve({id: 1});
    });
    spyOn(server, 'put').and.callFake(function() {
      return Promise.resolve({id: 1});
    });
    bar = new Bar();
    Foo = createFoo();
    return entityManager.create(Foo, {})
      .then(f => {
        foo = f;
        entityConfig = EntityConfig.get(Foo);
        entityConfig.configure({
          postLoad: jasmine.createSpy('postLoad'),
          postPersist: jasmine.createSpy('postPersist'),
          postRemove: jasmine.createSpy('postRemove'),
          prePersist: jasmine.createSpy('prePersist'),
          preRemove: jasmine.createSpy('preRemove')
        });
      });
  });

  it('findById', () => {
    return expectRejection(entityManager.findById(Bar, 1))
      .then(() => {
        return entityManager.findById(Foo, 1)
          .then(() => {
            expect(server.get).toHaveBeenCalledWith('foo/1');
            expect(server.get).toHaveBeenCalledTimes(1);
            expect(entityConfig.postLoad).toHaveBeenCalledTimes(1);
          });
      });
  });

  it('find', () => {
    return expectRejection(entityManager.find(Bar))
      .then(() => {
        return entityManager.find(Foo)
          .then(() => {
            expect(server.get).toHaveBeenCalledTimes(1);
            expect(server.get).toHaveBeenCalledWith('foo', {});
            expect(entityConfig.postLoad).toHaveBeenCalledTimes(2);
          });
      });
  });

  it('save', () => {
    return expectRejection(entityManager.save(bar))
      .then(() => {
        return entityManager.save(foo)
          .then(() => {
            expect(server.post).toHaveBeenCalledTimes(1);
            expect(server.post)
                .toHaveBeenCalledWith('foo', {});
            expect(entityConfig.prePersist).toHaveBeenCalledTimes(1);
            expect(entityConfig.postPersist).toHaveBeenCalledTimes(1);
          });
      })
      .then(() => {
        return entityManager.save(foo)
          .then(() => {
            expect(server.put).toHaveBeenCalledTimes(1);
            expect(server.put)
                .toHaveBeenCalledWith('foo/1', {id: 1});
            expect(entityConfig.prePersist).toHaveBeenCalledTimes(2);
            expect(entityConfig.postPersist).toHaveBeenCalledTimes(2);
          });
      });
  });

  it('reload', () => {
    return expectRejection(entityManager.reload(bar))
      .then(() => {
        foo.id = 1;
        return entityManager.reload(foo)
          .then(() => {
            expect(server.get).toHaveBeenCalledTimes(1);
            expect(server.get).toHaveBeenCalledWith('foo/1');
            expect(entityConfig.postLoad).toHaveBeenCalledTimes(1);
          });
      });
  });

  it('remove', () => {
    return expectRejection(entityManager.remove(bar))
      .then(() => {
        foo.id = 1;
        return entityManager.remove(foo)
          .then(() => {
            expect(server.delete).toHaveBeenCalledTimes(1);
            expect(server.delete).toHaveBeenCalledWith('foo/1');
            expect(entityConfig.preRemove).toHaveBeenCalledTimes(1);
            expect(entityConfig.postRemove).toHaveBeenCalledTimes(1);
          });
      });
  });
});

describe('Server', () => {
  let Foo;
  let foo;
  let entityManager;
  let interceptor;

  beforeEach(() => {
    interceptor = jasmine.createSpy('interceptor').and.callFake(function() {
      return Promise.resolve({});
    });
    let config = Config.create({baseUrl: URL});
    entityManager = new EntityManager(config);
    entityManager.setInterceptor(interceptor);
    Foo = createFoo();
    return entityManager.create(Foo, {}).then(f => foo = f);
  });

  it('findById', () => {
    return entityManager.findById(Foo, 1)
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(interceptor).toHaveBeenCalledWith(
            new Request(`${URL}/foo/1`, {method: 'GET', headers: HEADERS}));
      });
  });

  it('find', () => {
    return entityManager.find(Foo, {type: 'bar'})
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(interceptor).toHaveBeenCalledWith(
            new Request(`${URL}/foo?type=bar`, {method: 'GET', headers: HEADERS}));
      });
  });

  it('save (new)', () => {
    return entityManager.save(foo)
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(interceptor).toHaveBeenCalledWith(
            new Request(`${URL}/foo`, {body: '{}', method: 'POST', headers: HEADERS}));
      });
  });

  it('save (update)', () => {
    foo.id = 1;
    return entityManager.save(foo)
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(interceptor).toHaveBeenCalledWith(
            new Request(`${URL}/foo/1`, {body: '{"id":1}', method: 'PUT', headers: HEADERS}));
      });
  });

  it('reload', () => {
    foo.id = 1;
    return entityManager.reload(foo)
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(interceptor).toHaveBeenCalledWith(
            new Request(`${URL}/foo/1`, {method: 'GET', headers: HEADERS}));
      });
  });

  it('remove', () => {
    foo.id = 1;
    return entityManager.remove(foo)
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(interceptor).toHaveBeenCalledWith(
            new Request(`${URL}/foo/1`, {method: 'DELETE', headers: HEADERS}));
      });
  });
});
