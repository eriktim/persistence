import {Entity} from '../../../src/decorator/entity';
import {PostLoad} from '../../../src/decorator/post-load';
import {Property} from '../../../src/decorator/property';
import {createEntityManagerStub} from '../helper';

describe('@PostLoad()', () => {
  let entityManager;
  let test = function(Class, ...properties) {
    expect(properties.length > 0).toBe(true);
    return entityManager.create(Class, {}).then(entity => {
      expect(entity.trigger).toBeUndefined();
      properties.forEach(p => expect(entity[p]).toBe(true, p));
    });
  };

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Default', () => {
    @Entity()
    class Foo {
      @Property() triggered;

      @PostLoad()
      trigger() {
        this.triggered = true;
      }
    }
    return test(Foo, 'triggered');
  });

  it('Inheritance', () => {
    class Foo {
      @Property() triggered;

      @PostLoad()
      trigger() {
        this.triggered = true;
      }
    }
    @Entity()
    class Bar extends Foo {}
    return test(Bar, 'triggered');
  });

  it('Inheritance & default', () => {
    class Foo {
      @Property() triggeredSuper;

      @PostLoad()
      trigger() {
        this.triggeredSuper = true;
      }
    }
    @Entity()
    class Bar extends Foo {
      @Property() triggeredSub;

      @PostLoad()
      trigger() {
        this.triggeredSub = true;
      }
    }
    return test(Bar, 'triggeredSuper', 'triggeredSub');
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity() class Foo {
        @PostLoad() prop = 'val';
      }
    }).toThrowError('@PostLoad() prop is not a function');
  });
});
