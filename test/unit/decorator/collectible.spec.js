import {Collectible, isCollectible} from '../../../src/decorator/collectible';
import {Entity} from '../../../src/decorator/entity';
import {Stub} from '../stub';

describe('@Collectible', () => {
  let entityManager;

  beforeEach(() => {
    entityManager = Stub.createEntityManager();
  });

  it('Undecorated', () => {
    class Foo {}
    expect(isCollectible(Foo)).toEqual(false);
    expect(isCollectible(new Foo())).toEqual(false);
  });

  it('Entity', () => {
    @Entity class Foo {}
    expect(isCollectible(Foo)).toEqual(false);
    return entityManager.create(Foo, {}).then(foo => {
      expect(isCollectible(foo)).toEqual(false);
    });
  });

  it('noFactory', () => {
    @Collectible class Foo {}
    expect(isCollectible(Foo)).toEqual(true);
    expect(isCollectible(new Foo())).toEqual(true);
  });

  it('default', () => {
    @Collectible() class Foo {}
    expect(isCollectible(Foo)).toEqual(true);
    expect(isCollectible(new Foo())).toEqual(true);
  });
});
