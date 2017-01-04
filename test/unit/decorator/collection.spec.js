import {Collectible} from '../../../src/decorator/collectible';
import {Collection} from '../../../src/decorator/collection';
import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Property} from '../../../src/decorator/property';
import {PersistentData} from '../../../src/persistent-data';
import {createEntityManagerStub} from '../helper';

@Collectible()
class Bar {
  @Property() baz;
}

@Entity() class Foo {
  @Id()
  key;

  @Collection(Bar)
  bars;
}

describe('@Collection()', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Empty', () => {
    return entityManager.create(Foo, {}).then(foo => {
      expect(foo.bars.length).toEqual(0);
      let bar = new Bar();
      bar.baz = 'boo';
      foo.bars.push(bar);
      expect(JSON.stringify(PersistentData.extract(foo)))
          .toBe(JSON.stringify({bars: [{baz: 'boo'}]}));
    });
  });

  it('Non-empty', () => {
    return entityManager.create(Foo, {bars: [{baz: 'boz'}]}).then(foo => {
      expect(foo.bars.length).toEqual(1);
      let bar = foo.bars[0];
      expect(bar).toEqual(jasmine.any(Bar));
      expect(bar.baz).toEqual('boz');
    });
  });

  it('Non-writable', () => {
    return entityManager.create(Foo, {}).then(foo => {
      expect(() => foo.bars = 'bars')
        .toThrowError('invalid array');
    });
  });
});
