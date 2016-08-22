import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PostRemove} from '../../../src/decorator/post-remove';
import {EntityConfig} from '../../../src/entity-config';
import {REMOVED} from '../../../src/entity-manager';
import {Stub} from '../stub';

@Entity
class Foo {
  @Id
  key;
  removed = undefined;

  @PostRemove
  trigger() {
    this.removed = this[REMOVED];
  }
}

describe('@PostRemove', () => {
  let entityManager;
  let foo;

  beforeEach(() => {
    entityManager = Stub.createEntityManager();
    return entityManager.create(Foo, {key: 123})
        .then(f => {
          foo = f;
          return entityManager.save(foo);
        });
  });

  it('Remove', () => {
    return entityManager.remove(foo)
      .then(f => {
        expect(f.trigger).toBeUndefined();
        expect(f.removed).toEqual(true);
      });
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity class Bar {
        @PostRemove prop = 'val';
      }
    }).toThrowError('@PostRemove prop is not a function');
  });
});
