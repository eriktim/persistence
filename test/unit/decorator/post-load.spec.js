import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PostLoad} from '../../../src/decorator/post-load';
import {createEntityManagerStub} from '../helper';

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

describe('@PostLoad', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Create', () => {
    return entityManager.create(Foo, {})
        .then(f => {
          expect(f.trigger).toBeUndefined();
          expect(f.triggered).toBeTruthy();
        });
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity class Bar {
        @PostLoad prop = 'val';
      }
    }).toThrowError('@PostLoad prop is not a function');
  });
});
