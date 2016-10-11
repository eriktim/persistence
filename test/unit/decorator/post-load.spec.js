import {Entity} from '../../../src/decorator/entity';
import {PostLoad} from '../../../src/decorator/post-load';
import {createEntityManagerStub} from '../helper';

describe('@PostLoad', () => {
  let entityManager;
  let test = function(Class) {
    return entityManager.create(Class, {}).then(entity => {
      expect(entity.trigger).toBeUndefined();
      expect(entity.triggered).toBe(true);
    });
  };

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Create', () => {
    @Entity
    class Foo {
      triggered = undefined;

      @PostLoad
      trigger() {
        this.triggered = true;
      }
    }
    return test(Foo);
  });

  it('Inheritance', () => {
    class Foo {
      triggered = undefined;

      @PostLoad
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
        @PostLoad prop = 'val';
      }
    }).toThrowError('@PostLoad prop is not a function');
  });
});
