import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PostLoad} from '../../../src/decorator/post-load';
import {Stub} from '../stub';

@Entity
class Foo {
  @Id
  key;
  triggered = false;

  @PostLoad
  trigger() {
    this.triggered = true;
  }
}

describe('PostLoad', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = Stub.createEntityManager();
  });

  it('Create', () => {
    return entityManager.create(Foo, {})
        .then(f => {
          expect(f.trigger).toBeUndefined();
          expect(f.triggered).toBeTruthy();
        });
  });
});
