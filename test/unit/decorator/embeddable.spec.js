import {Embeddable} from '../../../src/decorator/embeddable';
import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {createEntityManagerStub} from '../helper';

describe('@Embeddable()', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
  });

  it('Undecorated', () => {
    class Foo {}
    expect(Foo.isEmbeddable).toBeFalsy();
  });

  it('Entity', () => {
    @Entity() class Foo {
      @Id() id;
    }
    expect(Foo.isEmbeddable).toBeFalsy();
    return entityManager.create(Foo, {});
  });

  it('default', () => {
    @Embeddable() class Foo {}
    expect(Foo.isEmbeddable).toEqual(true);
  });
});
