import {Entity} from '../../../src/decorator/entity';
import {PreUpdate} from '../../../src/decorator/pre-update';
import {Property} from '../../../src/decorator/property';
import {createEntityManagerStub} from '../helper';

describe('@PreUpdate()', () => {
  let entityManager;
  let test = function(Class, ...properties) {
    expect(properties.length > 0).toBe(true);
    return entityManager.create(Class, {}).then(entity => {
      expect(entity.trigger).toBeUndefined();
      properties.forEach(p => expect(entity[p]).toBe(undefined, p));
      entity.changeMe = true;
      properties.forEach(p => expect(entity[p]).toBe(false, p));
    });
  };

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Default', () => {
    @Entity()
    class Foo {
      @Property() changeMe;
      @Property() triggered;

      @PreUpdate()
      trigger() {
        this.triggered = this.changeMe || false;
      }
    }
    return test(Foo, 'triggered');
  });

  it('Inheritance', () => {
    class Foo {
      @Property() triggered;

      @PreUpdate()
      trigger() {
        this.triggered = this.changeMe || false;
      }
    }
    @Entity()
    class Bar extends Foo {
      @Property() changeMe;
    }
    return test(Bar, 'triggered');
  });

  it('Inheritance & default', () => {
    class Foo {
      @Property() triggeredSuper;

      @PreUpdate()
      trigger() {
        this.triggeredSuper = this.changeMe || false;
      }
    }
    @Entity()
    class Bar extends Foo {
      @Property() changeMe;
      @Property() triggeredSub;

      @PreUpdate()
      trigger() {
        this.triggeredSub = this.changeMe || false;
      }
    }
    return test(Bar, 'triggeredSuper', 'triggeredSub');
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity() class Foo {
        @PreUpdate() prop = 'val';
      }
    }).toThrowError('@PreUpdate() prop is not a function');
  });
});
