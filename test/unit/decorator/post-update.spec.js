import {Entity} from '../../../src/decorator/entity';
import {PostUpdate} from '../../../src/decorator/post-update';
import {Property} from '../../../src/decorator/property';
import {createEntityManagerStub} from '../helper';

describe('@PostUpdate()', () => {
  let entityManager;
  let test = function(Class, ...properties) {
    expect(properties.length > 0).toBe(true);
    return entityManager.create(Class, {}).then(entity => {
      expect(entity.trigger).toBeUndefined();
      properties.forEach(p => expect(entity[p]).toBe(undefined, p));
      entity.changeMe = true;
      properties.forEach(p => expect(entity[p]).toBe(true, p));
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

      @PostUpdate()
      trigger() {
        this.triggered = this.changeMe || false;
      }
    }
    return test(Foo, 'triggered');
  });

  it('Inheritance', () => {
    class Foo {
      @Property() triggered;

      @PostUpdate()
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

      @PostUpdate()
      trigger() {
        this.triggeredSuper = this.changeMe || false;
      }
    }
    @Entity()
    class Bar extends Foo {
      @Property() changeMe;
      @Property() triggeredSub;

      @PostUpdate()
      trigger() {
        this.triggeredSub = this.changeMe || false;
      }
    }
    return test(Bar, 'triggeredSuper', 'triggeredSub');
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity() class Foo {
        @PostUpdate() prop = 'val';
      }
    }).toThrowError('@PostUpdate() prop is not a function');
  });
});
