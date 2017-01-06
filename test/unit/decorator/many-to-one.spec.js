import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {ManyToOne} from '../../../src/decorator/many-to-one';
import {Property} from '../../../src/decorator/property';
import {createEntityManagerStub, expectRejection} from '../helper';

function deferTest(test) {
  return new Promise(resolve => {
    setTimeout(() => {
      test();
      resolve();
    }, 100);
  });
}

@Entity()
class Bar {
  @Id() key;
  @Property() prop;
}

@Entity()
class Foo {
  @Id()
  key;

  @ManyToOne(Bar)
  bars;
}

describe('@ManyToOne()', () => {
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
    expect(foo.bars).toEqual(jasmine.any(Array));
    expect(foo.bars.length).toBe(0);
  });

  it('invalid reference', () => {
    expect(() => foo.bars.push(foo)).toThrowError('invalid related entity');
  });

  it('valid references', () => {
    expect(data).toEqual({key: 123});
    return Promise.resolve()
      .then(() => {
        foo.bars.push(bar1);
        return deferTest(() => expect(data).toEqual({key: 123, bars: ['bar/1']}));
      })
      .then(() => {
        foo.bars.push(bar2);
        return deferTest(() => expect(data).toEqual({key: 123, bars: ['bar/1', 'bar/2']}));
      })
      .then(() => {
        foo.bars.push(bar3);
        return deferTest(() => expect(data).toEqual({key: 123, bars: ['bar/1', 'bar/2', 'bar/3']}));
      })
      .then(() => {
        return Promise.all(foo.bars).then(bars => foo.bars.splice(bars.indexOf(bar2), 1))
          .then(() => deferTest(() => expect(data).toEqual({key: 123, bars: ['bar/1', 'bar/3']})));
      })
      .then(() => {
        return Promise.all(foo.bars).then(bars => expect(bars).toEqual([bar1, bar3]));
      });
  });
});
