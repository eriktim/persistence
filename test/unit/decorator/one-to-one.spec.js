import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {OneToOne} from '../../../src/decorator/one-to-one';
import {Property} from '../../../src/decorator/property';
import {createEntityManagerStub} from '../helper';

@Entity()
class Bar {
  @Id() key;
  @Property() prop;
}

@Entity()
class Foo {
  @Id() key;
  @OneToOne(Bar) bar;
}

describe('@OneToOne()', () => {
  let foo;
  let bar;
  let custom;
  let data;
  let lastRef;

  beforeEach(() => {
    let entityManager = createEntityManagerStub({
      unwrapUri: obj => {
        lastRef = obj;
        return obj ? obj['link'] : undefined;
      },
      wrapUri: uri => {
        return {link: uri};
      }
    });
    data = {};
    return Promise.all([
      entityManager.create(Foo, {key: 123}),
      entityManager.create(Bar, {key: 456}),
      entityManager.create(Foo, data)
    ])
    .then(values => [foo, bar, custom] = values);
  });

  it('initial value', () => {
    return foo.bar.then(b => expect(b).toBeUndefined());
  });

  it('invalid reference', () => {
    expect(() => foo.bar = foo).toThrowError('invalid relationship object');
  });

  it('valid reference', () => {
    foo.bar = bar;
    return foo.bar.then(b => expect(b).toEqual(bar));
  });

  it('set custom reference object', () => {
    expect(data).toEqual({});
    custom.bar = bar;
    return new Promise(resolve => { // FIXME somehow sync
      setTimeout(() => {
        expect(data).toEqual({bar: {link: 'bar/456'}});
        resolve();
      }, 100);
    });
  });

  it('get custom reference object', () => {
    let ref = {link: 'bar/111'};
    data['bar'] = ref;
    return custom.bar.then(bar => expect(lastRef).toBe(ref));
  });
});
