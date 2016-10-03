import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PostPersist} from '../../../src/decorator/post-persist';
import {createEntityManagerStub} from '../helper';

@Entity
class Foo {
  @Id
  key;
  triggered = undefined;

  @PostPersist
  trigger() {
    this.triggered = true;
  }
}

describe('@PostPersist', () => {
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
          expect(request.body.triggered).toBeUndefined();
        });
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity class Bar {
        @PostPersist prop = 'val';
      }
    }).toThrowError('@PostPersist prop is not a function');
  });
});
