import {CachedEntity} from '../../../src/decorator/cached-entity';
import {Id} from '../../../src/decorator/id';
import {Config} from '../../../src/config';
import {createEntityManagerStub} from '../helper';

Config.create();

describe('@CachedEntity', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('@Entity', () => {
    @CachedEntity class Foo {
      @Id id;
    }

    return entityManager.find(Foo, '1')
      .then(foo => {
        expect(foo).toBeNull();
        expect(entityManager.requests.length).toBe(0);
      });
  });

  it('@Entity()', () => {
    @CachedEntity() class Foo {
      @Id id;
    }

    return entityManager.find(Foo, '1')
      .then(foo => {
        expect(foo).toBeNull();
        expect(entityManager.requests.length).toBe(0);
      });
  });

  it('@Entity(path)', () => {
    @CachedEntity('bar') class Foo {
      @Id id;
    }

    return entityManager.find(Foo, '1')
      .then(foo => {
        expect(foo).toBeNull();
        expect(entityManager.requests.length).toBe(0);
      });
  });
});
