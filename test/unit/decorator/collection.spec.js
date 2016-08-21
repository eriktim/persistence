import {Collectable} from '../../../src/decorator/collectable';
import {Collection} from '../../../src/decorator/collection';
import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PersistentData} from '../../../src/persistent-data';
import {Stub} from '../stub';

@Collectable
class Bar {
  baz = undefined;
}

@Entity class Foo {
  @Id
  key;

  @Collection(Bar)
  bars;
}

describe('Collection', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = Stub.createEntityManager();
  });

  it('Empty', () => {
    return entityManager.create(Foo, {}).then(foo => {
      expect(foo.bars.size).toEqual(0);
      let bar = foo.bars.create();
      expect(bar).toEqual(jasmine.any(Bar));
      bar.baz = 'boo';
      expect(bar.baz).toEqual('boo');
      expect(PersistentData.extract(foo)).toEqual({bars: [{baz: 'boo'}]});
    });
  });

  it('Non-empty', () => {
    return entityManager.create(Foo, {bars: [{baz: 'boz'}]}).then(foo => {
      expect(foo.bars.size).toEqual(1);
      let bar = Array.from(foo.bars).pop();
      expect(bar).toEqual(jasmine.any(Bar));
      expect(bar.baz).toEqual('boz');
    });
  });

  it('Invalid', () => {
    return entityManager.create(Foo, {bars: 'bars'}).then(foo => {
      expect(() => foo.bars.create()).toThrow();
    });
  });

  it('Non-writable', () => {
    return entityManager.create(Foo, {}).then(foo => {
      expect(() => foo.bars = 'bars')
          .toThrowError('cannot override collection');
    });
  });
});
