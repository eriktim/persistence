import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PreRemove} from '../../../src/decorator/pre-remove';
import {EntityConfig} from '../../../src/entity-config';
import {REMOVED} from '../../../src/symbols';
import {Stub} from '../stub';

@Entity
class Foo {
  @Id
  key;
  removed = undefined;

  @PreRemove
  trigger() {
    this.removed = this[REMOVED];
  }
}

describe('@PreRemove', () => {
  let entityManager;
  let foo;

  beforeEach(() => {
    entityManager = Stub.createEntityManager();
    return entityManager.create(Foo, {key: 123})
        .then(f => {
          foo = f;
          return entityManager.persist(foo);
        });
  });

  it('Remove', () => {
    return entityManager.remove(foo)
      .then(f => {
        expect(f.trigger).toBeUndefined();
        expect(f.removed).toEqual(false);
      });
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity class Bar {
        @PreRemove prop = 'val';
      }
    }).toThrowError('@PreRemove prop is not a function');
  });
});
