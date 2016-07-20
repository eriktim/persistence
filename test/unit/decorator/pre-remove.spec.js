import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PreRemove} from '../../../src/decorator/pre-remove';
import {EntityConfig} from '../../../src/entity-config';
import {Stub} from '../stub';

@Entity
class Foo {
  @Id
  key;
  removed = undefined;

  @PreRemove
  trigger() {
    this.removed = EntityConfig.get(this).removed;
  }
}

describe('PreRemove', () => {
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
        expect(f.removed).toEqual(false);
      });
  });
});
