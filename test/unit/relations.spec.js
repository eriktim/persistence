import {Entity} from '../../src/decorator/entity';
import {Id} from '../../src/decorator/id';
import {OneToOne} from '../../src/decorator/one-to-one';
import {PersistentData} from '../../src/persistent-data';
import {createEntityManagerStub} from './helper';

@Entity
class Bar {
  @Id id;
  prop = undefined;
}

@Entity
class Foo {
  @Id id;
  @OneToOne(Bar) bar;
}

describe('Relations', () => {
  let entityManager;
  let foo;
  let bar;
  let data;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
    return Promise.all([
      entityManager.create(Foo).then(f => foo = f),
      entityManager.create(Bar).then(b => bar = b)
    ])
    .then(() => {
      foo.bar = bar;
      data = PersistentData.extract(foo);
    });
  });

  it('should persist when referred', () => {
    return entityManager.persist(foo).then(() => {
      expect(foo.id).toBe('1');
      expect(bar.id).toBe('1');
      expect(data).toEqual({id: '1', bar: 'bar/1'});
    });
  });

  it('should not persist when not referred', () => {
    return entityManager.persist(bar).then(() => {
      expect(foo.id).toBeUndefined();
      expect(bar.id).toBe('1');
      expect(data).toEqual({});
    });
  });

});
