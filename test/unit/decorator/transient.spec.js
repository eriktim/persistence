import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Property} from '../../../src/decorator/property';
import {Transient} from '../../../src/decorator/transient';
import {PersistentData} from '../../../src/persistent-data';
import {createEntityManagerStub} from '../helper';

@Entity()
class Foo {
  @Id()
  key;

  @Property()
  undecorated;

  @Transient()
  default;
}

describe('@Transient()', () => {
  let foo;
  let data;

  beforeEach(() => {
    let entityManager = createEntityManagerStub();
    return entityManager.create(Foo, {}).then(f => {
      foo = f;
      data = PersistentData.extract(foo);
    });
  });

  it('Undecorated', () => {
    foo.undecorated = 'bar';
    expect(data).toEqual({undecorated: 'bar'});
    expect(foo.undecorated).toEqual('bar');
  });

  it('Default', () => {
    foo.default = 'bar';
    expect(data).toEqual({});
    expect(foo.default).toEqual('bar');
  });
});
