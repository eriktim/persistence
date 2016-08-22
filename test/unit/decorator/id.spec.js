import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Stub} from '../stub';

describe('@Id', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = Stub.createEntityManager();
  });

  it('Without id', () => {
    @Entity class Foo {}

    return entityManager.create(Foo, {key: 123})
        .then(foo => entityManager.save(foo))
        .then(
          () => {throw new Error();},
          err => expect(err.message).toEqual('Entity has no primary key')
        );
  });

  it('With id', () => {
    @Entity class Foo {
      @Id key;
    }

    return entityManager.create(Foo, {key: 123})
        .then(foo => entityManager.save(foo))
        .then(foo => expect(foo.key).toEqual(123));
  });
});
