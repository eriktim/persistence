import {Entity, PhonyEntity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Config} from '../../../src/config';
import {createEntityManagerStub} from '../helper';

Config.create();

describe('@PhonyEntity()', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('@PhonyEntity()', () => {
    @PhonyEntity() class Foo {
      @Id() id;
    }

    return entityManager.find(Foo, '1')
      .then(foo => {
        expect(foo).toBeNull();
        expect(entityManager.requests.length).toBe(0);
      });
  });

  it('@PhonyEntity(path)', () => {
    @PhonyEntity('bar') class Foo {
      @Id() id;
    }

    return entityManager.find(Foo, '1')
      .then(foo => {
        expect(foo).toBeNull();
        expect(entityManager.requests.length).toBe(0);
      });
  });

  it('Use case', () => {
    @PhonyEntity('bar') class Foo {
      @Id() id;
    }
    @Entity('bar') class Bar {
      @Id() id;
    }

    return entityManager.find(Bar, '1')
      .then(bar => {
        expect(bar).toEqual(jasmine.any(Bar));
        expect(entityManager.requests.length).toBe(1);
        return entityManager.find(Foo, '1')
      })
      .then(foo => {
        expect(foo).toEqual(jasmine.any(Bar));
        expect(entityManager.requests.length).toBe(1);
      });
  });
});
