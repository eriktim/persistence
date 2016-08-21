import {Collectable, isCollectable} from '../../../src/decorator/collectable';
import {Entity} from '../../../src/decorator/entity';
import {Stub} from '../stub';

describe('Collectable', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = Stub.createEntityManager();
  });

  it('Undecorated', () => {
    class Foo {}
    expect(isCollectable(Foo)).toEqual(false);
    expect(isCollectable(new Foo())).toEqual(false);
  });

  it('Entity', () => {
    @Entity class Foo {}
    expect(isCollectable(Foo)).toEqual(false);
    return entityManager.create(Foo, {}).then(foo => {
      expect(isCollectable(foo)).toEqual(false);
    });
  });

  it('noFactory', () => {
    @Collectable class Foo {}
    expect(isCollectable(Foo)).toEqual(true);
    expect(isCollectable(new Foo())).toEqual(true);
  });

  it('default', () => {
    @Collectable() class Foo {}
    expect(isCollectable(Foo)).toEqual(true);
    expect(isCollectable(new Foo())).toEqual(true);
  });
});
