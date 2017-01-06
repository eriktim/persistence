import {Entity} from '../../src/decorator/entity';
import {Id} from '../../src/decorator/id';
import {Property} from '../../src/decorator/property';
import {Config} from '../../src/config';
import {Metadata} from '../../src/metadata';
import {PersistentConfig} from '../../src/persistent-config';
import {PersistentData} from '../../src/persistent-data';
import {EntityManager, getServerForTesting} from '../../src/entity-manager';
import {asJasmineValue, expectRejection, URL} from './helper';

const HEADERS = new Headers({
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

function setId(entity, id) {
  PersistentData.setProperty(entity, 'id', id);
}

function setLocation(data, location) {
  Reflect.defineMetadata(Metadata.REST_LOCATION, location, data);
}

function createFoo() {
  @Entity() class Foo {
    @Id() id;
  }
  return Foo;
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
      let data = {id: 1};
      return Promise.resolve(path.includes('/1') ? data : [data, {id: 2}]);
    });
    spyOn(server, 'post').and.callFake(function(path) {
      let data = {id: 1};
      setLocation(data, path + (path.endsWith('/') ? '' : '/') + data.id);
      return Promise.resolve(data);
    }).calls.saveArgumentsByValue(); // make copy of arguments
    spyOn(server, 'put').and.callFake(function() {
      return Promise.resolve({id: 1});
    });
    bar = new Bar();
    Foo = createFoo();
    return entityManager.create(Foo, {})
      .then(f => {
        foo = f;
        entityConfig = PersistentConfig.get(Foo);
        entityConfig.configure({
          postLoad: jasmine.createSpy('postLoad'),
          postPersist: jasmine.createSpy('postPersist'),
          postRemove: jasmine.createSpy('postRemove'),
          prePersist: jasmine.createSpy('prePersist'),
          preRemove: jasmine.createSpy('preRemove')
        });
      });
  });

  it('find', () => {
    return expectRejection(entityManager.find(Bar, 1))
      .then(() => {
        return entityManager.find(Foo, 1)
          .then(() => {
            expect(server.get).toHaveBeenCalledTimes(1);
            expect(server.get).toHaveBeenCalledWith('foo/1');
            expect(entityConfig.postLoad).toHaveBeenCalledTimes(1);
          });
      });
  });

  it('query', () => {
    return expectRejection(entityManager.query(Bar))
      .then(() => {
        return entityManager.query(Foo)
          .then(() => {
            expect(server.get).toHaveBeenCalledTimes(1);
            expect(server.get).toHaveBeenCalledWith('foo', {});
            expect(entityConfig.postLoad).toHaveBeenCalledTimes(2);
          });
      });
  });

  it('query using a custom mapper', () => {
    @Entity() class Bundle {
      @Property() foo;
    }
    let config = Config.create({
      queryEntityMapperFactory: () => () => new Map([[{foo: 'bar'}, Bundle]])
    });
    entityManager = new EntityManager(config);
    return entityManager.query(Foo)
      .then(entities => {
        expect(entityConfig.postLoad).not.toHaveBeenCalled();
        expect(entities.length).toEqual(1);
        let bundle = entities.pop();
        expect(bundle).toEqual(jasmine.any(Bundle));
        expect(bundle.foo).toEqual('bar');
      });
  });

  it('query using a batched custom mapper', () => {
    @Entity() class Foo {
      @Property() foo;
    }
    let config = Config.create({
      queryEntityMapperFactory: () => () => [
        new Map([[{foo: 'one'}, Foo]]),
        new Map([[{foo: 'two'}, Foo]])
      ]
    });
    entityManager = new EntityManager(config);
    return entityManager.query(Foo)
      .then(entities => {
        expect(entities.length).toBe(2);
        expect(entities[0]).toEqual(jasmine.any(Foo));
        expect(entities[1]).toEqual(jasmine.any(Foo));
        expect(entities[0].foo).toEqual('one');
        expect(entities[1].foo).toEqual('two');
      });
  });

  it('persist', () => {
    return expectRejection(entityManager.persist(bar))
      .then(() => {
        return entityManager.persist(foo)
          .then(f => {
            expect(f).toBe(foo);
            expect(f.id).toEqual('1');
            expect(server.post).toHaveBeenCalledTimes(1);
            expect(server.post)
                .toHaveBeenCalledWith(asJasmineValue('foo'), {});
            expect(entityConfig.prePersist).toHaveBeenCalledTimes(1);
            expect(entityConfig.postPersist).toHaveBeenCalledTimes(1);
          });
      })
      .then(() => {
        // not dirty
        return entityManager.persist(foo)
          .then(() => entityManager.persist(foo))
          .then(() => {
            expect(server.put).not.toHaveBeenCalled();
          });
      })
      .then(() => {
        setId(foo, 2); // dirty
        return entityManager.persist(foo)
          .then(() => {
            expect(server.put).toHaveBeenCalledTimes(1);
            expect(server.put)
                .toHaveBeenCalledWith('foo/2', {id: 2});
            expect(entityConfig.prePersist).toHaveBeenCalledTimes(2);
            expect(entityConfig.postPersist).toHaveBeenCalledTimes(2);
          });
      });
  });

  it('refresh', () => {
    setId(foo, 1);
    return expectRejection(entityManager.refresh(bar))
      .then(() => entityManager.refresh(foo))
      .then(f => {
        expect(f).toBe(foo);
        expect(f.id).toEqual(1);
        expect(server.get).toHaveBeenCalledTimes(1);
        expect(server.get).toHaveBeenCalledWith('foo/1');
        expect(entityConfig.postLoad).toHaveBeenCalledTimes(1);
      });
  });

  it('remove', () => {
    setId(foo, 1);
    return expectRejection(entityManager.remove(bar))
      .then(() => entityManager.remove(foo))
      .then(f => {
        expect(f).toBe(foo);
        expect(f.id).toEqual(1);
        expect(server.delete).toHaveBeenCalledTimes(1);
        expect(server.delete).toHaveBeenCalledWith('foo/1');
        expect(entityConfig.preRemove).toHaveBeenCalledTimes(1);
        expect(entityConfig.postRemove).toHaveBeenCalledTimes(1);
      });
  });

  it('cache', () => {
    return entityManager.find(Foo, 1)
      .then(foo1 => {
        return entityManager.find(Foo, 1)
          .then(foo2 => {
            expect(server.get).toHaveBeenCalledWith('foo/1');
            expect(server.get).toHaveBeenCalledTimes(1);
            expect(entityConfig.postLoad).toHaveBeenCalledTimes(1);
            expect(foo1).toBe(foo2);
          });
      });
  });

  it('No construction', () => {
    expect(() => new Foo()).toThrowError(
        'Use EntityManager#create to create new entities');
  });

  it('unmanaged', () => {
    let cfg = Config.create({baseUrl: URL});
    let em = new EntityManager(cfg);
    entityManager.create(Foo).then(foo => {
      expectRejection(em.persist(foo),
          'argument is not a persistent entity');
    });
  });
});

describe('Server', () => {
  let Foo;
  let foo;
  let entityManager;
  let interceptor;

  beforeEach(() => {
    interceptor = jasmine.createSpy('interceptor').and.callFake((url, init) => {
      let data = {id: 1};
      switch(init.method) {
        case 'GET':
          data = url.endsWith('/1') ? data : [data];
          break;
        case 'POST':
          setLocation(data, url + (url.endsWith('/') ? '' : '/') + '1');
          break;
      }
      return Promise.resolve(data);
    });
    let config = Config.create({baseUrl: URL, fetchInterceptor: interceptor});
    entityManager = new EntityManager(config);
    Foo = createFoo();
    return entityManager.create(Foo, {}).then(f => foo = f);
  });

  it('find', () => {
    return entityManager.find(Foo, 1)
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(interceptor).toHaveBeenCalledWith(`${URL}/foo/1`,
            {method: 'GET', headers: HEADERS});
      });
  });

  it('query (propertyMap)', () => {
    return entityManager.query(Foo, {type: 'bar'})
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(interceptor).toHaveBeenCalledWith(
            `${URL}/foo?type=bar`, {method: 'GET', headers: HEADERS});
      });
  });

  it('query (string)', () => {
    return entityManager.query(Foo, 'type=bar')
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(interceptor).toHaveBeenCalledWith(
          `${URL}/foo?type=bar`, {method: 'GET', headers: HEADERS});
      });
  });

  it('persist (new)', () => {
    return entityManager.persist(foo)
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(interceptor).toHaveBeenCalledWith(`${URL}/foo`,
            {body: '{}', method: 'POST', headers: HEADERS});
      });
  });

  it('persist (update)', () => {
    setId(foo, 1);
    return entityManager.persist(foo)
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(1);
        expect(interceptor).toHaveBeenCalledWith(`${URL}/foo/1`,
            {body: '{"id":1}', method: 'PUT', headers: HEADERS});
      });
  });

  it('refresh', () => {
    setId(foo, 1);
    return entityManager.persist(foo)
      .then(() => entityManager.refresh(foo))
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(2);
        expect(interceptor).toHaveBeenCalledWith(`${URL}/foo/1`,
            {method: 'GET', headers: HEADERS});
      });
  });

  it('remove', () => {
    setId(foo, 1);
    return entityManager.persist(foo)
      .then(() => entityManager.remove(foo))
      .then(() => {
        expect(interceptor).toHaveBeenCalledTimes(2);
        expect(interceptor).toHaveBeenCalledWith(`${URL}/foo/1`,
            {method: 'DELETE', headers: HEADERS});
      });
  });
});
