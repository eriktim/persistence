import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Property} from '../../../src/decorator/property';
import {PersistentData} from '../../../src/persistent-data';
import {createEntityManagerStub} from '../helper';

@Entity
class Foo {
  @Id
  key;

  undecorated = undefined;

  @Property
  unnamed;

  @Property()
  empty;

  @Property('nameOfNamed')
  named;

  @Property('some.path')
  path;

  @Property('array[1].item')
  array;
}

describe('@Property', () => {
  let entityManager;
  let data;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
    return entityManager.create(Foo, {}).then(foo => {
      for (let prop in foo) {
        foo[prop] = 1;
      }
      data = PersistentData.extract(foo);
    });
  });

  it('Save', () => {
    expect('undecorated' in data).toBeTruthy();
    expect('unnamed' in data).toBeTruthy();
    expect('empty' in data).toBeTruthy();
    expect('named' in data).toBeFalsy();
    expect('nameOfNamed' in data).toBeTruthy();
    expect('some' in data).toBeTruthy();
    expect('path' in data.some).toBeTruthy();
    expect('array' in data).toBeTruthy();
    expect(data.array.length).toEqual(2);
    expect(data.array[0]).toBeUndefined();
    expect('item' in data.array[1]).toBeTruthy();
  });
});
