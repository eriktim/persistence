import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PostRemove} from '../../../src/decorator/post-remove';
import {REMOVED} from '../../../src/symbols';
import {createEntityManagerStub} from '../helper';

describe('@PostRemove', () => {
  let entityManager;
  let test = function(Class) {
    return entityManager.create(Class, {key: 123})
      .then(entity => entityManager.persist(entity))
      .then(entity => entityManager.remove(entity))
      .then(entity => {
        expect(entity.trigger).toBeUndefined();
        expect(entity.removed).toEqual(true);
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

      @PostRemove
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

      @PostRemove
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
      @Entity class Foo {
        @PostRemove prop = 'val';
      }
    }).toThrowError('@PostRemove prop is not a function');
  });
});
