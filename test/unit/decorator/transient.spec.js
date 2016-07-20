import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Transient} from '../../../src/decorator/transient';
import {EntityData} from '../../../src/entity-data';
import {Stub} from '../stub';

@Entity
class Foo {
  @Id
  key;

  undecorated = undefined;

  @Transient
  noFactory;

  @Transient()
  default;
}

describe('Temporal', () => {
  let foo;
  let data;

  beforeEach(() => {
    let entityManager = Stub.createEntityManager();
    return entityManager.create(Foo, {}).then(f => {
      foo = f;
      data = EntityData.extract(foo);
    });
  });

  it('Undecorated', () => {
    foo.undecorated = 'bar';
    expect(data).toEqual({undecorated: 'bar'});
    expect(foo.undecorated).toEqual('bar');
  });

  it('No factory', () => {
    foo.noFactory = 'bar';
    expect(data).toEqual({});
    expect(foo.noFactory).toEqual('bar');
  });

  it('Default', () => {
    foo.default = 'bar';
    expect(data).toEqual({});
    expect(foo.default).toEqual('bar');
  });
});
