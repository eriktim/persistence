import {Entity} from '../../../src/decorator/entity';
import {Config} from '../../../src/config';
import {EntityConfig} from '../../../src/entity-config';
import {Stub} from '../stub';

Config.create();

describe('Entity', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = Stub.createEntityManager();
  });

  it('@Entity', () => {
    @Entity class Foo {}
    expect(EntityConfig.has(Foo)).toBeTruthy();
    expect(EntityConfig.get(Foo).path).toEqual('foo');

    expect(() => new Foo())
        .toThrowError('Entity \'Foo\' must be created by an EntityManager');
    return entityManager.create(Foo, {})
      .then(foo => expect(foo).toEqual(jasmine.any(Foo)));
  });

  it('@Entity()', () => {
    @Entity() class Foo {}
    expect(EntityConfig.has(Foo)).toBeTruthy();
    expect(EntityConfig.get(Foo).path).toEqual('foo');

    expect(() => new Foo())
        .toThrowError('Entity \'Foo\' must be created by an EntityManager');
    return entityManager.create(Foo, {})
      .then(foo => expect(foo).toEqual(jasmine.any(Foo)));
  });

  it('@Entity(path)', () => {
    @Entity('bar') class Foo {}
    expect(EntityConfig.has(Foo)).toBeTruthy();
    expect(EntityConfig.get(Foo).path).toEqual('bar');

    expect(() => new Foo())
        .toThrowError('Entity \'Foo\' must be created by an EntityManager');
    return entityManager.create(Foo, {})
      .then(foo => expect(foo).toEqual(jasmine.any(Foo)));
  });

  it('No @Entity', () => {
    class Foo {}
    expect(EntityConfig.has(Foo)).toBeFalsy();

    expect(() => new Foo()).not.toThrow();
    return entityManager.create(Foo, {})
      .then(
        () => {throw new Error();},
        err => expect(err.message).toEqual('EntityManager expects a valid Entity')
      );
  });
});
