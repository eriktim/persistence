import {Embeddable, isEmbeddable} from '../../../src/decorator/embeddable';
import {Entity} from '../../../src/decorator/entity';
import {Stub} from '../stub';

describe('Embeddable', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = Stub.createEntityManager();
  });

  it('Undecorated', () => {
    class Foo {}
    expect(isEmbeddable(Foo)).toEqual(false);
    expect(isEmbeddable(new Foo())).toEqual(false);
  });

  it('Entity', () => {
    @Entity class Foo {}
    expect(isEmbeddable(Foo)).toEqual(false);
    return entityManager.create(Foo, {}).then(foo => {
      expect(isEmbeddable(foo)).toEqual(false);
    });
  });

  it('noFactory', () => {
    @Embeddable class Foo {}
    expect(isEmbeddable(Foo)).toEqual(true);
    expect(isEmbeddable(new Foo())).toEqual(true);
  });

  it('default', () => {
    @Embeddable() class Foo {}
    expect(isEmbeddable(Foo)).toEqual(true);
    expect(isEmbeddable(new Foo())).toEqual(true);
  });
});
