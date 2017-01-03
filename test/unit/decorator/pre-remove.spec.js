import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PreRemove} from '../../../src/decorator/pre-remove';
import {Property} from '../../../src/decorator/property';
import {Metadata} from '../../../src/metadata';
import {createEntityManagerStub} from '../helper';

describe('@PreRemove()', () => {
  let entityManager;
  let test = function(Class, ...properties) {
    expect(properties.length > 0).toBe(true);
    return entityManager.create(Class, {key: 123})
      .then(entity => entityManager.persist(entity))
      .then(entity => entityManager.remove(entity))
      .then(entity => {
        expect(entity.trigger).toBeUndefined();
        properties.forEach(p => expect(entity[p]).toBe(false, p));
      });
  };

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Default', () => {
    @Entity()
    class Foo {
      @Id() key;
      @Property() removed;

      @PreRemove()
      trigger() {
        this.removed = Reflect.getMetadata(Metadata.ENTITY_IS_REMOVED, this);
      }
    }
    return test(Foo, 'removed');
  });

  it('Inheritance', () => {
    class Foo {
      @Id() key;
      @Property() removed;

      @PreRemove()
      trigger() {
        this.removed = Reflect.getMetadata(Metadata.ENTITY_IS_REMOVED, this);
      }
    }
    @Entity()
    class Bar extends Foo {}
    return test(Bar, 'removed');
  });

  it('Inheritance & default', () => {
    class Foo {
      @Id() key;
      @Property() removedSuper;

      @PreRemove()
      trigger() {
        this.removedSuper = Reflect.getMetadata(Metadata.ENTITY_IS_REMOVED, this);
      }
    }
    @Entity()
    class Bar extends Foo {
      @Property() removedSub;

      @PreRemove()
      trigger() {
        this.removedSub = Reflect.getMetadata(Metadata.ENTITY_IS_REMOVED, this);
      }
    }
    return test(Bar, 'removedSuper', 'removedSub');
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity() class Bar {
        @PreRemove() prop = 'val';
      }
    }).toThrowError('@PreRemove() prop is not a function');
  });
});
