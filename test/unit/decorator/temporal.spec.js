import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Temporal} from '../../../src/decorator/temporal';
import {PersistentData} from '../../../src/persistent-data';
import {createEntityManagerStub} from '../helper';

function getTimezoneOffset() {
  let offset = new Date().getTimezoneOffset();
  let H = Math.floor(-offset / 60);
  let M = -offset % 60;
  let pad = val => (val < 10 ? '0' : '') + val;
  let prefix = offset <= 0 ? '+' : '';
  return prefix + pad(H) + ':' + pad(M);
}

const TZ_OFFSET = getTimezoneOffset();
const DEFAULT = '2000-01-01T12:00:00' + TZ_OFFSET;

@Entity()
class Foo {
  @Id()
  key;

  @Temporal()
  default;
}

function checkDateTime(entity, data, property) {
  expect(entity[property]).toBeUndefined();
  entity[property] = DEFAULT;
  expect(data[property]).toEqual('2000-01-01T12:00:00' + TZ_OFFSET);
  expect(entity[property].year()).toEqual(2000);
  expect(entity[property].month() + 1).toEqual(1);
  expect(entity[property].date()).toEqual(1);
  expect(entity[property].hour()).toEqual(12);
  expect(entity[property].minute()).toEqual(0);
  expect(entity[property].second()).toEqual(0);
}

describe('@Temporal()', () => {
  let foo;
  let data;

  beforeEach(() => {
    let entityManager = createEntityManagerStub();
    return entityManager.create(Foo, {}).then(f => {
      foo = f;
      data = PersistentData.extract(foo);
    });
  });

  it('Default', () => {
    checkDateTime(foo, data, 'default');
  });
});
