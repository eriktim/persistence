import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PrePersist} from '../../../src/decorator/pre-persist';
import {createEntityManagerStub} from '../helper';

describe('@PrePersist', () => {
  let entityManager;
  let test = function(Class) {
    return entityManager.create(Class, {})
      .then(entity => entityManager.persist(entity))
      .then(entity => {
        expect(entity.trigger).toBeUndefined();
        expect(entity.triggered).toBeTruthy();
        const request = entityManager.requests.pop();
        expect(request.body.triggered).toBe(true);
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

      @PrePersist
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

      @PrePersist
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
      @Entity class Bar {
        @PrePersist prop = 'val';
      }
    }).toThrowError('@PrePersist prop is not a function');
  });
});
