import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PostPersist} from '../../../src/decorator/post-persist';
import {createEntityManagerStub} from '../helper';

describe('@PostPersist', () => {
  let entityManager;
  let test = function(Class) {
    return entityManager.create(Class, {})
      .then(entity => entityManager.persist(entity))
      .then(entity => {
        expect(entity.trigger).toBeUndefined();
        expect(entity.triggered).toBeTruthy();
        const request = entityManager.requests.pop();
        expect(request.body.triggered).toBeUndefined();
      });
  };

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Save', () => {
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
    return test(Foo);
  });

  it('Inheritance', () => {
    class Foo {
      @Id
      key;
      triggered = undefined;

      @PostPersist
      trigger() {
        this.triggered = true;
      }
    }
    @Entity
    class Bar extends Foo {}
    return test(Bar);
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity class Foo {
        @PostPersist prop = 'val';
      }
    }).toThrowError('@PostPersist prop is not a function');
  });
});
