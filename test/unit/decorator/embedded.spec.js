import {Embeddable} from '../../../src/decorator/embeddable';
import {Embedded} from '../../../src/decorator/embedded';
import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Property} from '../../../src/decorator/property';
import {PersistentData} from '../../../src/persistent-data';
import {createEntityManagerStub, expectRejection} from '../helper';

@Embeddable class Bar {
  @Property baz;
}

@Entity class Foo {
  @Id
  key;

  @Embedded(Bar)
  bar;
}

describe('@Embedded', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
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
    return expectRejection(entityManager.create(Foo, {bar: 'baa'}),
        'embedded data is corrupt');
  });

  it('Non-writable', () => {
    return entityManager.create(Foo, {}).then(foo => {
      expect(() => foo.bar = 'baz')
          .toThrowError('cannot override embedded object');
    });
  });

  it('Keep references', () => {
    return entityManager.create(Foo, {}).then(foo => {
      let bar = foo.bar;
      bar.baz = 'foz';
      expect(PersistentData.isDirty(foo)).toBe(true);
      expect(PersistentData.extract(foo).bar)
        .toBe(PersistentData.extract(foo.bar), 'before persistence');
      return entityManager.persist(foo).then(() => {
        expect(PersistentData.extract(foo).bar)
          .toBe(PersistentData.extract(foo.bar), 'after persistence');
        expect(foo.bar).toBe(bar);
      });
    });
  });
});
