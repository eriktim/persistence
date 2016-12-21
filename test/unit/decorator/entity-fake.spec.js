import {FakeEntity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Config} from '../../../src/config';
import {createEntityManagerStub} from '../helper';

Config.create();

describe('@FakeEntity', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('@Entity', () => {
    @FakeEntity class Foo {
      @Id id;
    }

    return entityManager.find(Foo, '1')
      .then(foo => {
        expect(foo).toBeNull();
        expect(entityManager.requests.length).toBe(0);
      });
  });

  it('@Entity()', () => {
    @FakeEntity() class Foo {
      @Id id;
    }

    return entityManager.find(Foo, '1')
      .then(foo => {
        expect(foo).toBeNull();
        expect(entityManager.requests.length).toBe(0);
      });
  });

  it('@Entity(path)', () => {
    @FakeEntity('bar') class Foo {
      @Id id;
    }

    return entityManager.find(Foo, '1')
      .then(foo => {
        expect(foo).toBeNull();
        expect(entityManager.requests.length).toBe(0);
      });
  });
});
