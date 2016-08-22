import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PrePersist} from '../../../src/decorator/pre-persist';
import {Stub} from '../stub';

@Entity
class Foo {
  @Id
  key;
  triggered = false;

  @PrePersist
  trigger() {
    this.triggered = true;
  }
}

describe('@PrePersist', () => {
  let entityManager;
  let foo;

  beforeEach(() => {
    entityManager = Stub.createEntityManager();
    return entityManager.create(Foo, {key: 123})
        .then(f => foo = f);
  });

  it('Save', () => {
    return entityManager.save(foo)
        .then(f => {
          expect(f.trigger).toBeUndefined();
          expect(f.triggered).toBeTruthy();
          const request = entityManager.requests.pop();
          expect(request && 'triggered' in request.body).toBeTruthy();
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
