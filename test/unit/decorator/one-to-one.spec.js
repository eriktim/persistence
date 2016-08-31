import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {OneToOne} from '../../../src/decorator/one-to-one';
import {Stub} from '../stub';

@Entity
class Bar {
  @Id
  key;

  prop = undefined;
}

@Entity
class Foo {
  @Id
  key;

  @OneToOne(Bar)
  bar;
}

describe('@OneToOne', () => {
  let foo;
  let bar;
  let emptyBar;

  beforeEach(() => {
    let entityManager = Stub.createEntityManager();
    return Promise.all([
      entityManager.create(Foo, {key: 123}),
      entityManager.create(Bar, {key: 456}),
      entityManager.create(Bar, {})
    ])
    .then(values => [foo, bar, emptyBar] = values);
  });

  it('initial value', () => {
    expect(foo.bar).toBeUndefined();
  });

  it('invalid reference', () => {
    expect(() => foo.bar = foo).toThrowError('invalid reference object');
  });

//  it('unattached reference', () => {
//    expect(() => foo.bar = emptyBar)
//        .toThrowError('unattached reference object');
//  });

  it('valid reference', () => {
    foo.bar = bar;
  });
});
