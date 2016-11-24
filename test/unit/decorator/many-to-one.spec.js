import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {ManyToOne} from '../../../src/decorator/many-to-one';
import {Property} from '../../../src/decorator/property';
import {createEntityManagerStub} from '../helper';

@Entity
class Bar {
  @Id key;
  @Property prop;
}

@Entity
class Foo {
  @Id
  key;

  @ManyToOne(Bar)
  bars;
}

describe('@ManyToOne', () => {
  let data;
  let foo;
  let bar1;
  let bar2;
  let bar3;

  beforeEach(() => {
    let entityManager = createEntityManagerStub();
    data = {key: 123};
    return Promise.all([
      entityManager.create(Foo, data),
      entityManager.create(Bar, {key: 1}),
      entityManager.create(Bar, {key: 2}),
      entityManager.create(Bar, {key: 3})
    ])
    .then(values => [foo, bar1, bar2, bar3] = values);
  });

  it('initial value', () => {
    expect(foo.bars).toEqual(jasmine.any(Set));
    expect(foo.bars.size).toBe(0);
  });

  it('invalid reference', () => {
    expect(() => foo.bars.add(foo)).toThrowError('invalid reference object');
  });

  it('valid references', () => {
    expect(data).toEqual({key: 123});
    foo.bars.add(bar1);
    expect(data).toEqual({key: 123, bars: ['bar/1']});
    foo.bars.add(bar2);
    expect(data).toEqual({key: 123, bars: ['bar/1', 'bar/2']});
    foo.bars.add(bar3);
    expect(data).toEqual({key: 123, bars: ['bar/1', 'bar/2', 'bar/3']});
    foo.bars.delete(bar2);
    expect(data).toEqual({key: 123, bars: ['bar/1', 'bar/3']});
    return foo.bars.then(r => expect(r).toEqual([bar1, bar3]));
  });
});
