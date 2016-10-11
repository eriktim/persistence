import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PreRemove} from '../../../src/decorator/pre-remove';
import {REMOVED} from '../../../src/symbols';
import {createEntityManagerStub} from '../helper';

describe('@PreRemove', () => {
  let entityManager;
  let test = function(Class) {
    return entityManager.create(Class, {key: 123})
      .then(entity => entityManager.persist(entity))
      .then(entity => entityManager.remove(entity))
      .then(entity => {
        expect(entity.trigger).toBeUndefined();
        expect(entity.removed).toEqual(false);
      });
  };

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Remove', () => {
    @Entity
    class Foo {
      @Id
      key;
      removed = undefined;

      @PreRemove
      trigger() {
        this.removed = this[REMOVED];
      }
    }
    return test(Foo);
  });

  it('Inheritance', () => {
    class Foo {
      @Id
      key;
      removed = undefined;

      @PreRemove
      trigger() {
        this.removed = this[REMOVED];
      }
    }
    @Entity
    class Bar extends Foo {}
    return test(Bar);
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity class Bar {
        @PreRemove prop = 'val';
      }
    }).toThrowError('@PreRemove prop is not a function');
  });
});
