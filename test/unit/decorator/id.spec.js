import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {createEntityManagerStub} from '../helper';

describe('@Id', () => {
  let entityManager;
  let test = function(Class) {
    return entityManager.create(Class, {key: 123})
      .then(entity => entityManager.persist(entity))
      .then(entity => expect(entity.key).toEqual(123));
  };

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Without id', () => {
    @Entity class Foo {}

    return entityManager.create(Foo, {key: 123})
        .then(foo => entityManager.persist(foo))
        .then(
          () => {throw new Error();},
          err => expect(err.message).toEqual('Entity has no primary key')
        );
  });

  it('With id', () => {
    @Entity class Foo {
      @Id key;
    }
    return test(Foo);
  });

  it('Inheritance', () => {
    class Foo {
      @Id key;
    }
    @Entity class Bar extends Foo {}
    return test(Bar);
  });

  it('Double inheritance', () => {
    class Foo {
      @Id key;
    }
    class Bar extends Foo {}
    @Entity class Baz extends Bar {}
    return test(Baz);
  });
});
