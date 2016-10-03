import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Config} from '../../../src/config';
import {PersistentConfig} from '../../../src/persistent-config';
import {createEntityManagerStub} from '../helper';

Config.create();

describe('@Entity', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('@Entity', () => {
    @Entity class Foo {
      @Id id;
    }
    expect(PersistentConfig.has(Foo)).toBeTruthy();
    expect(PersistentConfig.get(Foo).path).toEqual('foo');

    return entityManager.create(Foo, {})
      .then(foo => expect(foo).toEqual(jasmine.any(Foo)));
  });

  it('@Entity()', () => {
    @Entity() class Foo {
      @Id id;
    }
    expect(PersistentConfig.has(Foo)).toBeTruthy();
    expect(PersistentConfig.get(Foo).path).toEqual('foo');

    return entityManager.create(Foo, {})
      .then(foo => expect(foo).toEqual(jasmine.any(Foo)));
  });

  it('@Entity(path)', () => {
    @Entity('bar') class Foo {
      @Id id;
    }
    expect(PersistentConfig.get(Foo).path).toEqual('bar');

    return entityManager.create(Foo, {})
      .then(foo => expect(foo).toEqual(jasmine.any(Foo)));
  });

  it('No @Entity', () => {
    class Foo {
      @Id id;
    }
    expect(PersistentConfig.get(Foo).path).toBeUndefined();

    return entityManager.create(Foo, {})
      .then(
        () => {throw new Error('created entity');},
        err => expect(err.message).toEqual('EntityManager expects a valid Entity')
      );
  });
});
