import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PostPersist} from '../../../src/decorator/post-persist';
import {Property} from '../../../src/decorator/property';
import {createEntityManagerStub} from '../helper';

describe('@PostPersist', () => {
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
          expect(request.body[p]).toBeUndefined(p);
        });
      });
  };

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Default', () => {
    @Entity
    class Foo {
      @Id key;
      @Property triggered;

      @PostPersist
      trigger() {
        this.triggered = true;
      }
    }
    return test(Foo, 'triggered');
  });

  it('Inheritance', () => {
    class Foo {
      @Id key;
      @Property triggered;

      @PostPersist
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
      @Id key;
      @Property triggeredSuper;

      @PostPersist
      trigger() {
        this.triggeredSuper = true;
      }
    }
    @Entity
    class Bar extends Foo {
      @Property triggeredSub;

      @PostPersist
      trigger() {
        this.triggeredSub = true;
      }
    }
    return test(Bar, 'triggeredSuper', 'triggeredSub');
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity class Foo {
        @PostPersist prop = 'val';
      }
    }).toThrowError('@PostPersist prop is not a function');
  });
});
