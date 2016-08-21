import {Embeddable} from '../../../src/decorator/embeddable';
import {Embedded} from '../../../src/decorator/embedded';
import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PersistentData} from '../../../src/persistent-data';
import {Stub} from '../stub';

@Embeddable class Bar {
  baz = undefined;
}

@Entity class Foo {
  @Id
  key;

  @Embedded(Bar)
  bar;
}

describe('Embeddable', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = Stub.createEntityManager();
  });

  it('Empty', () => {
    return entityManager.create(Foo, {}).then(foo => {
      expect(foo.bar).toEqual(jasmine.any(Bar));
      expect('baz' in foo.bar).toEqual(true);
      expect(foo.bar.baz).toBeUndefined();
      foo.bar.baz = 'boo';
      expect(PersistentData.extract(foo)).toEqual({bar: {baz: 'boo'}});
    });
  });

  it('Non-empty', () => {
    return entityManager.create(Foo, {bar: {baz: 'boz'}}).then(foo => {
      expect(foo.bar).toEqual(jasmine.any(Bar));
      expect('baz' in foo.bar).toEqual(true);
      expect(foo.bar.baz).toEqual('boz');
    });
  });

  it('Invalid', () => {
    return entityManager.create(Foo, {bar: 'baa'}).then(foo => {
      expect(() => foo.bar.baz = 'biz').toThrow();
    });
  });

  it('Non-writable', () => {
    return entityManager.create(Foo, {}).then(foo => {
      expect(() => foo.bar = 'baz')
          .toThrowError('cannot override embedded object');
    });
  });
});
