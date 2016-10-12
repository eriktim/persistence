import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PrePersist} from '../../../src/decorator/pre-persist';
import {createEntityManagerStub} from '../helper';

describe('@PrePersist', () => {
  let entityManager;
  let test = function(Class, ...properties) {
    expect(properties.length > 0).toBe(true);
    return entityManager.create(Class, {})
      .then(entity => entityManager.persist(entity))
      .then(entity => {
        expect(entity.trigger).toBeUndefined();
        const request = entityManager.requests.pop();
        properties.forEach(p => {
          expect(entity[p]).toBe(true, p);
          expect(request.body[p]).toBe(true, p);
        });
      });
  };

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Default', () => {
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
    return test(Foo, 'triggered');
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
    return test(Bar, 'triggered');
  });

  it('Inheritance & default', () => {
    class Foo {
      @Id
      key;
      triggeredSuper = undefined;

      @PrePersist
      trigger() {
        this.triggeredSuper = true;
      }
    }
    @Entity
    class Bar extends Foo {
      triggeredSub = undefined;

      @PrePersist
      trigger() {
        this.triggeredSub = true;
      }
    }
    return test(Bar, 'triggeredSuper', 'triggeredSub');
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity class Bar {
        @PrePersist prop = 'val';
      }
    }).toThrowError('@PrePersist prop is not a function');
  });
});
