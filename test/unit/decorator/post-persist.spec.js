import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PostPersist} from '../../../src/decorator/post-persist';
import {Stub} from '../stub';

@Entity
class Foo {
  @Id
  key;
  triggered = false;

  @PostPersist
  trigger() {
    this.triggered = true;
  }
}

describe('@PostPersist', () => {
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
          expect(request && 'triggered' in request.body).toBeFalsy();
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
