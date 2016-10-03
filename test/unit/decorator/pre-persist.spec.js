import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PrePersist} from '../../../src/decorator/pre-persist';
import {createEntityManagerStub} from '../helper';

@Entity
class Foo {
  @Id
  key;
  triggered = undefined;

  @PrePersist
  trigger() {
    this.triggered = true;
  }
}

describe('@PrePersist', () => {
  let entityManager;
  let foo;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
    return entityManager.create(Foo, {})
        .then(f => foo = f);
  });

  it('Save', () => {
    return entityManager.persist(foo)
        .then(f => {
          expect(f.trigger).toBeUndefined();
          expect(f.triggered).toBeTruthy();
          const request = entityManager.requests.pop();
          expect(request.body.triggered).toBe(true);
        });
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity class Bar {
        @PrePersist prop = 'val';
      }
    }).toThrowError('@PrePersist prop is not a function');
  });
});
